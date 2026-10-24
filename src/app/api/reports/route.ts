import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { 
  sendClientReportConfirmationEmail, 
  sendScopeApprovalRequestEmail 
} from "@/lib/mail";
import { ObjectId } from "mongodb";

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
      clientEmail: clientEmail ? clientEmail.trim() : "",
      clientMeta: clientMeta || null,
      attachmentUrl: attachmentUrl || null,
      status: "Open",
      classification: "Defect", // Default: Defect (Warranty)
      scopeApproval: {
        isBillable: false,
        approvalStatus: "none", // none | pending_review | approved | rejected
      },
      createdAt: new Date(),
      updatedAt: new Date(),
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
    const reportId = searchParams.get("reportId");

    const { db } = await connectToDatabase();

    // Fetch single report for sign-off review
    if (reportId) {
      const report = await db.collection("reports").findOne({ _id: new ObjectId(reportId) });
      if (!report) {
        return NextResponse.json({ error: "Report not found" }, { status: 404 });
      }
      return NextResponse.json({
        report: {
          ...report,
          id: report._id.toString(),
        },
      });
    }

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

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
    const { 
      reportId, 
      status, 
      classification, 
      requestApproval, 
      amount, 
      currency, 
      hours, 
      developerNotes, 
      clientEmail 
    } = body;

    const { db } = await connectToDatabase();
    const updateFields: any = { updatedAt: new Date() };

    if (status) {
      updateFields.status = status;
    }

    // 1. Dispatching Out-of-Warranty Quote & Approval Request
    if (requestApproval) {
      const currentReport = await db.collection("reports").findOne({ _id: new ObjectId(reportId) });
      if (!currentReport) {
        return NextResponse.json({ error: "Report not found" }, { status: 404 });
      }

      const project = await db.collection("projects").findOne({ slug: currentReport.projectId });
      const recipientEmail = (clientEmail || currentReport.clientEmail)?.trim();

      if (!recipientEmail || !recipientEmail.includes("@")) {
        return NextResponse.json(
          { error: "A valid client email address is required to dispatch scope authorization." },
          { status: 400 }
        );
      }

      updateFields.clientEmail = recipientEmail;
      updateFields.classification = "Scope Expansion";
      
      // Setting scopeApproval as one consolidated object eliminates the path conflict
      updateFields.scopeApproval = {
        isBillable: true,
        approvalStatus: "pending_review",
        estimate: {
          amount: Number(amount) || 0,
          currency: currency || "INR",
          hoursEstimate: hours ? Number(hours) : undefined,
          developerNotes: developerNotes || "",
          quotedAt: new Date(),
        },
      };

      const origin = req.headers.get("origin") || undefined;

      try {
        await sendScopeApprovalRequestEmail({
          to: recipientEmail,
          projectName: project?.name || currentReport.projectId,
          projectSlug: currentReport.projectId,
          ticketId: reportId,
          ticketSummary: currentReport.summary,
          amount: amount || 0,
          currency: currency || "INR",
          hours,
          developerNotes,
          appUrl: origin,
        });
      } catch (mailErr) {
        console.error("Scope authorization request email failed:", mailErr);
      }
    } 
    // 2. Standard Classification Switch (without sending quote)
    else if (classification) {
      updateFields.classification = classification;
      
      if (classification === "Defect") {
        updateFields.scopeApproval = {
          isBillable: false,
          approvalStatus: "none",
        };
      } else {
        updateFields.scopeApproval = {
          isBillable: true,
          approvalStatus: "none",
        };
      }
    }

    await db.collection("reports").updateOne(
      { _id: new ObjectId(reportId) },
      { $set: updateFields }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PATCH error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}