import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { sendClientReportConfirmationEmail } from "@/lib/mail";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, summary, expected, actual, url, clientEmail, clientMeta, attachmentUrl } = body;

    if (!projectId || !summary) {
      return NextResponse.json({ error: "Missing project ID or summary" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const project = await db.collection("projects").findOne({ slug: projectId });

    const newReport = {
      projectId,
      summary,
      expected: expected || "",
      actual: actual || "",
      url: url || "",
      clientEmail: clientEmail || "",
      clientMeta: clientMeta || null,
      attachmentUrl: attachmentUrl || null,
      status: "Open",
      classification: "Defect", // Default: Defect (Warranty)
      createdAt: new Date(),
    };

    const result = await db.collection("reports").insertOne(newReport);

    // Send confirmation email to client if an email was provided
    if (clientEmail && clientEmail.includes("@")) {
      try {
        await sendClientReportConfirmationEmail({
          to: clientEmail.trim(),
          projectName: project?.name || projectId,
          summary,
          url,
        });
      } catch (emailErr) {
        console.error("Client report confirmation email failed:", emailErr);
      }
    }

    return NextResponse.json({ success: true, reportId: result.insertedId }, { status: 201 });
  } catch (error: any) {
    console.error("Report creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to create report" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const reports = await db
      .collection("reports")
      .find({ projectId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      reports: reports.map((r) => ({
        ...r,
        id: r._id.toString(),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { reportId, status, classification } = body;
    const { ObjectId } = require("mongodb");
    const { db } = await connectToDatabase();

    const updateFields: any = {};
    if (status) updateFields.status = status;
    if (classification) updateFields.classification = classification;

    await db.collection("reports").updateOne(
      { _id: new ObjectId(reportId) },
      { $set: updateFields }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}