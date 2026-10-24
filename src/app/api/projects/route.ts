import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Helper to sanitize slug into URL-safe format
function sanitizeSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// 1. GET: Fetch projects for an owner or check slug availability
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerEmail = searchParams.get("ownerEmail");
    const checkSlug = searchParams.get("checkSlug");

    const { db } = await connectToDatabase();

    // Ensure unique index on slug exists in MongoDB
    await db.collection("projects").createIndex({ slug: 1 }, { unique: true });

    // Endpoint for real-time slug check
    if (checkSlug) {
      const cleanSlug = sanitizeSlug(checkSlug);
      const existing = await db.collection("projects").findOne({ slug: cleanSlug });
      return NextResponse.json({ 
        slug: cleanSlug, 
        available: !existing 
      });
    }

    if (!ownerEmail) {
      return NextResponse.json({ error: "ownerEmail is required" }, { status: 400 });
    }

    const cleanEmail = ownerEmail.toLowerCase().trim();

    // Fetch projects where user is owner OR assigned developer
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

    return NextResponse.json({
      projects: projects.map((p) => {
        let currentUserRole: "owner" | "agency_admin" | "developer" = "developer";
        if (p.ownerEmail?.toLowerCase() === cleanEmail) {
          currentUserRole = "owner";
        } else {
          const dev = p.assignedDevelopers?.find(
            (d: any) => d.email?.toLowerCase() === cleanEmail
          );
          if (dev?.role === "agency_admin") currentUserRole = "agency_admin";
        }

        return {
          id: p._id.toString(),
          name: p.name,
          slug: p.slug,
          ownerEmail: p.ownerEmail,
          currentUserRole,
          assignedDevelopers: p.assignedDevelopers || [],
          createdAt: p.createdAt,
        };
      }),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch projects" }, { status: 500 });
  }
}

// 2. POST: Create Project with automatic collision resolution
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

    // Check if slug is already taken across all accounts
    while (await db.collection("projects").findOne({ slug: finalSlug })) {
      counter++;
      finalSlug = `${baseSlug}-${counter}`; // e.g. c1 -> c1-2 -> c1-3
    }

    const cleanEmail = ownerEmail.toLowerCase().trim();

    const newProject = {
      name: name.trim(),
      slug: finalSlug,
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

// 3. DELETE: Delete Project and free the slug from MongoDB
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

    // Verify ownership before deleting
    const project = await db.collection("projects").findOne({ slug, ownerEmail: cleanEmail });

    if (!project) {
      return NextResponse.json({ error: "Project not found or unauthorized to delete" }, { status: 404 });
    }

    // 1. Delete all reports linked to this project
    await db.collection("reports").deleteMany({ projectId: slug });

    // 2. Delete all chat messages linked to this project
    await db.collection("project_messages").deleteMany({ projectSlug: slug });

    // 3. Delete the project document (frees the unique slug in MongoDB)
    await db.collection("projects").deleteOne({ _id: project._id });

    return NextResponse.json({ 
      success: true, 
      message: `Project ${slug} and its resources have been deleted. Slug is now freed.` 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete project" }, { status: 500 });
  }
}