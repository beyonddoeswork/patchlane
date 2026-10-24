import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { sendScopeApprovedConfirmationEmail } from "@/lib/mail";
import { ObjectId } from "mongodb";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ticketId, projectSlug, fullName, email, phone, declaration } = body;

    if (!ticketId || !fullName || !email || !phone) {
      return NextResponse.json({ error: "All signature identification fields are required." }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const report = await db.collection("reports").findOne({ _id: new ObjectId(ticketId) });

    if (!report) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const project = await db.collection("projects").findOne({ slug: report.projectId });

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "Direct Remote IP";
    const userAgent = req.headers.get("user-agent") || "Standard Browser";
    const signedAt = new Date();

    const auditToken = crypto
      .createHash("sha256")
      .update(`${ticketId}-${email.toLowerCase().trim()}-${signedAt.toISOString()}-${ipAddress}`)
      .digest("hex");

    const signOffRecord = {
      clientName: fullName.trim(),
      clientEmail: email.toLowerCase().trim(),
      clientPhone: phone.trim(),
      declaration: declaration || "I confirm authorization for this billable work.",
      signedAt,
      ipAddress,
      userAgent,
      auditToken,
    };

    await db.collection("reports").updateOne(
      { _id: new ObjectId(ticketId) },
      {
        $set: {
          "scopeApproval.approvalStatus": "approved",
          "scopeApproval.signOff": signOffRecord,
          status: "In Progress",
          updatedAt: signedAt,
        },
      }
    );

    const estimate = report.scopeApproval?.estimate || {};
    const emailPayload = {
      projectName: project?.name || report.projectId,
      ticketSummary: report.summary,
      amount: estimate.amount || 0,
      currency: estimate.currency || "INR",
      signerName: signOffRecord.clientName,
      signerEmail: signOffRecord.clientEmail,
      signerPhone: signOffRecord.clientPhone,
      signedAt: signedAt.toLocaleString(),
      auditToken,
    };

    try {
      await sendScopeApprovedConfirmationEmail({
        to: signOffRecord.clientEmail,
        ...emailPayload,
      });

      if (project?.ownerEmail) {
        await sendScopeApprovedConfirmationEmail({
          to: project.ownerEmail,
          ...emailPayload,
        });
      }
    } catch (mailErr) {
      console.error("Scope execution receipt email failed:", mailErr);
    }

    return NextResponse.json({
      success: true,
      record: signOffRecord,
    });
  } catch (error: any) {
    console.error("Scope sign-off error:", error);
    return NextResponse.json({ error: error.message || "Failed to sign scope" }, { status: 500 });
  }
}