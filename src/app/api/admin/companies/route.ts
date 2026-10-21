import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { adminAuth } from "@/lib/firebaseAdmin";
import { 
  sendDeveloperInviteEmail, 
  sendDeveloperRemovalEmail, 
  sendPasswordResetNoticeEmail 
} from "@/lib/mail";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { db } = await connectToDatabase();
    const companies = await db.collection("agencies").find({}).sort({ createdAt: -1 }).toArray();
    const projects = await db.collection("projects").find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({
      companies: companies.map((c) => ({
        id: c._id.toString(),
        agencyName: c.agencyName || "Unnamed Studio",
        email: c.email,
        phone: c.phone || "N/A",
        plan: c.plan || "enterprise",
        createdAt: c.createdAt,
      })),
      projects: projects.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        slug: p.slug,
        ownerEmail: p.ownerEmail,
        assignedDevelopers: p.assignedDevelopers || [],
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load admin data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      action, 
      companyName, 
      ownerEmail, 
      phone, 
      projectSlug, 
      developerEmail, 
      role, 
      reason, 
      targetEmail, 
      customPassword, 
      resetBy 
    } = body;
    
    const { db } = await connectToDatabase();

    // Dynamically detect the website domain from the incoming request
    const originHeader = req.headers.get("origin");
    const hostHeader = req.headers.get("host");
    const requestAppUrl = originHeader || (hostHeader ? `https://${hostHeader}` : undefined);

    // 1. Create client company
    if (action === "create_company") {
      if (!ownerEmail || !companyName) {
        return NextResponse.json({ error: "Company name and owner email are required" }, { status: 400 });
      }

      await db.collection("agencies").updateOne(
        { email: ownerEmail.toLowerCase().trim() },
        {
          $set: {
            agencyName: companyName,
            phone: phone || "",
            plan: "enterprise_managed",
            updatedAt: new Date(),
          },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      );

      return NextResponse.json({ success: true, message: "Company provisioned successfully" });
    }

    // 2. Assign Developer + Provision Firebase + Dispatch Email
    if (action === "assign_member") {
      if (!projectSlug || !developerEmail) {
        return NextResponse.json({ error: "Project slug and developer email are required" }, { status: 400 });
      }

      const cleanEmail = developerEmail.toLowerCase().trim();
      const targetProject = await db.collection("projects").findOne({ slug: projectSlug });

      if (!targetProject) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }

      let temporaryPassword: string | undefined = undefined;
      let isExistingUser = false;

      try {
        await adminAuth.getUserByEmail(cleanEmail);
        isExistingUser = true;
      } catch (err: any) {
        if (err.code === "auth/user-not-found") {
          temporaryPassword = "Pch_" + crypto.randomBytes(4).toString("hex");
          await adminAuth.createUser({
            email: cleanEmail,
            password: temporaryPassword,
            emailVerified: true,
          });
          isExistingUser = false;
        }
      }

      const memberRole = role || "developer";
      const newMember = {
        email: cleanEmail,
        role: memberRole,
        assignedAt: new Date(),
      };

      await db.collection("projects").updateOne(
        { slug: projectSlug },
        { $pull: { assignedDevelopers: { email: cleanEmail } } as any }
      );

      await db.collection("projects").updateOne(
        { slug: projectSlug },
        { $push: { assignedDevelopers: newMember } as any }
      );

      try {
        await sendDeveloperInviteEmail({
          to: cleanEmail,
          projectName: targetProject.name || projectSlug,
          projectSlug: targetProject.slug,
          role: memberRole,
          temporaryPassword,
          isExistingUser,
          appUrl: requestAppUrl,
        });
      } catch (mailErr) {
        console.error("Invite email failed:", mailErr);
      }

      return NextResponse.json({
        success: true,
        member: newMember,
        userProvisioned: !isExistingUser,
        temporaryPassword: temporaryPassword || null,
      });
    }

    // 3. Remove Developer with Reason + Delete Firebase Auth Account if No Remaining Seats
    if (action === "remove_member") {
      if (!projectSlug || !developerEmail) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const cleanEmail = developerEmail.toLowerCase().trim();
      const targetProject = await db.collection("projects").findOne({ slug: projectSlug });

      await db.collection("projects").updateOne(
        { slug: projectSlug },
        { $pull: { assignedDevelopers: { email: cleanEmail } } as any }
      );

      const otherProjectsCount = await db.collection("projects").countDocuments({
        $or: [
          { ownerEmail: cleanEmail },
          { "assignedDevelopers.email": cleanEmail },
        ],
      });

      let firebaseAccountDeleted = false;

      if (otherProjectsCount === 0) {
        try {
          const userRecord = await adminAuth.getUserByEmail(cleanEmail);
          if (userRecord?.uid) {
            await adminAuth.deleteUser(userRecord.uid);
            firebaseAccountDeleted = true;
          }
        } catch (authErr: any) {
          console.warn("Firebase Auth deletion notice:", authErr.message);
        }
      }

      if (targetProject) {
        try {
          await sendDeveloperRemovalEmail({
            to: cleanEmail,
            projectName: targetProject.name || projectSlug,
            projectSlug: targetProject.slug,
            reason: reason || "Team roster adjustments.",
          });
        } catch (mailErr) {
          console.error("Removal notification email failed:", mailErr);
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: "Member removed and notified.",
        firebaseAccountDeleted 
      });
    }

    // 4. Reset User Password (by Manager or Super Admin)
    if (action === "reset_password") {
      if (!targetEmail) {
        return NextResponse.json({ error: "Target email is required" }, { status: 400 });
      }

      const cleanEmail = targetEmail.toLowerCase().trim();

      try {
        const userRecord = await adminAuth.getUserByEmail(cleanEmail);
        const newPassword = customPassword?.trim() || "Pch_" + crypto.randomBytes(4).toString("hex") + "!";

        await adminAuth.updateUser(userRecord.uid, {
          password: newPassword,
        });

        try {
          await sendPasswordResetNoticeEmail({
            to: cleanEmail,
            newPassword,
            resetBy: resetBy || "Agency Manager",
            appUrl: requestAppUrl,
          });
        } catch (mailErr) {
          console.error("Password reset notification email failed:", mailErr);
        }

        return NextResponse.json({
          success: true,
          message: `Password successfully updated for ${cleanEmail}`,
          newPassword,
        });
      } catch (authErr: any) {
        if (authErr.code === "auth/user-not-found") {
          return NextResponse.json({ error: "No user found with that email." }, { status: 404 });
        }
        return NextResponse.json({ error: authErr.message || "Failed to reset password" }, { status: 500 });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed operation" }, { status: 500 });
  }
}