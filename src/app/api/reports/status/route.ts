import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "Project slug is required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // 1. Verify project exists
    const project = await db.collection("projects").findOne({ slug: slug.toLowerCase().trim() });
    if (!project) {
      return NextResponse.json({ error: "Project workspace not found" }, { status: 404 });
    }

    // 2. Fetch reports for this project — sanitize and expose ONLY client-safe fields
    const reports = await db
      .collection("reports")
      .find({ projectId: project.slug })
      .sort({ createdAt: -1 })
      .toArray();

    const publicReports = reports.map((r) => ({
      id: r._id.toString(),
      summary: r.summary,
      status: r.status || "Open",
      url: r.url || "",
      createdAt: r.createdAt,
      updatedAt: r.updatedAt || r.createdAt,
      // Mask client email if present for privacy
      reportedBy: r.clientEmail
        ? r.clientEmail.replace(/(.{2})(.*)(?=@)/, (_: string, a: string, b: string) => a + "*".repeat(b.length))
        : "Anonymous Client",
    }));

    return NextResponse.json({
      projectName: project.name,
      projectSlug: project.slug,
      reports: publicReports,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load project status" },
      { status: 500 }
    );
  }
}