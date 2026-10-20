import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Fetch all projects accessible by this user (as owner OR as assigned developer)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get("ownerEmail");

    if (!userEmail) {
      return NextResponse.json({ error: "ownerEmail query parameter is required" }, { status: 400 });
    }

    const cleanEmail = userEmail.toLowerCase().trim();
    const { db } = await connectToDatabase();

    // Query for projects where user is owner OR listed in assignedDevelopers
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

    // Augment each project with the requesting user's resolved role
    const sanitizedProjects = projects.map((p) => {
      let role = "developer";
      if (p.ownerEmail?.toLowerCase() === cleanEmail) {
        role = "owner";
      } else {
        const found = p.assignedDevelopers?.find((dev: any) => dev.email?.toLowerCase() === cleanEmail);
        if (found?.role) role = found.role;
      }

      return {
        ...p,
        id: p._id.toString(),
        _id: p._id.toString(),
        currentUserRole: role,
      };
    });

    return NextResponse.json({ projects: sanitizedProjects }, { status: 200 });
  } catch (error: any) {
    console.error("MongoDB Project Fetch Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch projects" }, { status: 500 });
  }
}

// Create a new project (Agency Owner)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slug, ownerEmail } = body;

    if (!name || !slug || !ownerEmail) {
      return NextResponse.json({ error: "Missing required fields (name, slug, ownerEmail)" }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, "-");
    const cleanEmail = ownerEmail.toLowerCase().trim();

    const { db } = await connectToDatabase();
    const existing = await db.collection("projects").findOne({ slug: cleanSlug });
    if (existing) {
      return NextResponse.json({ error: "A project with this link slug already exists" }, { status: 409 });
    }

    const newProject = {
      name,
      slug: cleanSlug,
      ownerEmail: cleanEmail,
      assignedDevelopers: [
        {
          email: cleanEmail,
          role: "owner",
          assignedAt: new Date(),
        },
      ],
      createdAt: new Date(),
    };

    await db.collection("projects").insertOne(newProject);
    return NextResponse.json({ success: true, project: newProject }, { status: 201 });
  } catch (error: any) {
    console.error("MongoDB Project Creation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create project" }, { status: 500 });
  }
}

// Delete a project
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const ownerEmail = searchParams.get("ownerEmail");

    if (!slug || !ownerEmail) {
      return NextResponse.json({ error: "Missing slug or ownerEmail query parameter" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const cleanEmail = ownerEmail.toLowerCase().trim();

    // Verify ownership
    const project = await db.collection("projects").findOne({ slug, ownerEmail: cleanEmail });
    if (!project) {
      return NextResponse.json({ error: "Only project owners can delete this project" }, { status: 403 });
    }

    await db.collection("projects").deleteOne({ slug, ownerEmail: cleanEmail });
    await db.collection("reports").deleteMany({ projectId: slug });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("MongoDB Project Deletion Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete project" }, { status: 500 });
  }
}