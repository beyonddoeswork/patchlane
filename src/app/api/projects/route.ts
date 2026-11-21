import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitizeSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function generateAccessCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const randomBytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += chars[randomBytes[i] % chars.length];
  }
  return code;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerEmail = searchParams.get("ownerEmail");
    const checkSlug = searchParams.get("checkSlug");
    const verifySlug = searchParams.get("verifySlug");
    const code = searchParams.get("code");

    const { db } = await connectToDatabase();
    await db.collection("projects").createIndex({ slug: 1 }, { unique: true });

    if (verifySlug) {
      const project = await db.collection("projects").findOne({ slug: verifySlug });
      if (!project) {
        return NextResponse.json({ valid: false, error: "Project workspace not found" }, { status: 404 });
      }

      let activeCode = project.accessCode;
      if (!activeCode) {
        activeCode = generateAccessCode();
        await db.collection("projects").updateOne(
          { _id: project._id },
          { $set: { accessCode: activeCode } }
        );
      }

      if (!code) {
        return NextResponse.json({
          requiresCode: true,
          projectName: project.name,
        });
      }

      const isValid = code.trim().toUpperCase() === activeCode.toUpperCase();
      if (!isValid) {
        return NextResponse.json({ valid: false, error: "Invalid access code" }, { status: 401 });
      }

      return NextResponse.json({
        valid: true,
        projectName: project.name,
      });
    }

    if (checkSlug) {
      const cleanSlug = sanitizeSlug(checkSlug);
      const existing = await db.collection("projects").findOne({ slug: cleanSlug });
      return NextResponse.json({
        slug: cleanSlug,
        available: !existing,
      });
    }

    if (!ownerEmail) {
      return NextResponse.json({ error: "ownerEmail is required" }, { status: 400 });
    }

    const cleanEmail = ownerEmail.toLowerCase().trim();

    const projects = await db
      .collection("projects")
      .find({
        $or: [
          { ownerEmail: cleanEmail },
          { "assignedDevelopers.email": cleanEmail },
        ],
      })
      .sort({ createdAt: -1 })
      .toArray();

    const formattedProjects = await Promise.all(
      projects.map(async (p) => {
        let currentUserRole: "owner" | "agency_admin" | "developer" = "developer";
        if (p.ownerEmail?.toLowerCase() === cleanEmail) {
          currentUserRole = "owner";
        } else {
          const dev = p.assignedDevelopers?.find(
            (d: any) => d.email?.toLowerCase() === cleanEmail
          );
          if (dev?.role === "agency_admin") currentUserRole = "agency_admin";
        }

        let accessCode = p.accessCode;
        if (!accessCode) {
          accessCode = generateAccessCode();
          await db.collection("projects").updateOne(
            { _id: p._id },
            { $set: { accessCode } }
          );
        }

        return {
          id: p._id.toString(),
          name: p.name,
          slug: p.slug,
          accessCode,
          ownerEmail: p.ownerEmail,
          currentUserRole,
          assignedDevelopers: p.assignedDevelopers || [],
          createdAt: p.createdAt,
        };
      })
    );

    return NextResponse.json({ projects: formattedProjects });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slug, ownerEmail } = body;

    if (!name || !ownerEmail) {
      return NextResponse.json({ error: "Project name and owner email are required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    await db.collection("projects").createIndex({ slug: 1 }, { unique: true });

    const baseSlug = sanitizeSlug(slug || name);
    let finalSlug = baseSlug;
    let counter = 1;

    while (await db.collection("projects").findOne({ slug: finalSlug })) {
      counter++;
      finalSlug = `${baseSlug}-${counter}`;
    }

    const cleanEmail = ownerEmail.toLowerCase().trim();
    const accessCode = generateAccessCode();

    const newProject = {
      name: name.trim(),
      slug: finalSlug,
      accessCode,
      ownerEmail: cleanEmail,
      assignedDevelopers: [
        {
          email: cleanEmail,
          role: "owner",
          assignedAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("projects").insertOne(newProject);

    return NextResponse.json({
      success: true,
      project: {
        id: result.insertedId.toString(),
        ...newProject,
        currentUserRole: "owner",
      },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "A project with this URL slug already exists. Please pick another." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message || "Failed to create project" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { slug, ownerEmail, action } = body;

    if (!slug || !ownerEmail) {
      return NextResponse.json({ error: "Slug and ownerEmail are required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const cleanEmail = ownerEmail.toLowerCase().trim();

    const project = await db.collection("projects").findOne({
      slug,
      $or: [
        { ownerEmail: cleanEmail },
        { assignedDevelopers: { $elemMatch: { email: cleanEmail, role: { $in: ["owner", "agency_admin"] } } } },
      ],
    });

    if (!project) {
      return NextResponse.json({ error: "Unauthorized or project not found" }, { status: 403 });
    }

    if (action === "regenerate_code") {
      const newCode = generateAccessCode();
      await db.collection("projects").updateOne(
        { _id: project._id },
        { $set: { accessCode: newCode, updatedAt: new Date() } }
      );
      return NextResponse.json({ success: true, accessCode: newCode });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const ownerEmail = searchParams.get("ownerEmail");

    if (!slug || !ownerEmail) {
      return NextResponse.json({ error: "Project slug and owner email are required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const cleanEmail = ownerEmail.toLowerCase().trim();

    const project = await db.collection("projects").findOne({ slug, ownerEmail: cleanEmail });

    if (!project) {
      return NextResponse.json({ error: "Project not found or unauthorized to delete" }, { status: 404 });
    }

    await db.collection("reports").deleteMany({ projectId: slug });
    await db.collection("project_messages").deleteMany({ projectSlug: slug });
    await db.collection("projects").deleteOne({ _id: project._id });

    return NextResponse.json({
      success: true,
      message: `Project ${slug} and its resources have been deleted. Slug is now freed.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete project" }, { status: 500 });
  }
}