import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Support both frontend and legacy field names
    const reportId = body.ticketId || body.reportId || body.id;
    const signerName = (body.clientName || body.signerName || body.fullName || "").trim();
    const signerEmail = (body.clientEmail || body.signerEmail || "").trim();
    const signerPhone = (body.clientPhone || body.signerPhone || "").trim();
    const agreed = Boolean(body.agreed);

    if (!reportId || !signerName || !signerEmail || !signerPhone || !agreed) {
      return NextResponse.json(
        { error: "All signature identification fields are required." },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const reportsCollection = db.collection("reports");

    const query = ObjectId.isValid(reportId)
      ? { _id: new ObjectId(reportId) }
      : { id: reportId };

    const report = await reportsCollection.findOne(query);
    if (!report) {
      return NextResponse.json(
        { error: "Ticket not found." },
        { status: 404 }
      );
    }

    const signedAt = new Date().toISOString();
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Generate deterministic SHA-256 audit hash for legal verification
    const auditPayload = `${report._id.toString()}|${signerName}|${signerEmail}|${signerPhone}|${signedAt}`;
    const auditToken = crypto
      .createHash("sha256")
      .update(auditPayload)
      .digest("hex");

    const signOffRecord = {
      signerName,
      signerEmail,
      signerPhone,
      agreed: true,
      signedAt,
      ipAddress,
      userAgent,
      auditToken,
    };

    await reportsCollection.updateOne(query, {
      $set: {
        "scopeApproval.approvalStatus": "approved",
        "scopeApproval.signOff": signOffRecord,
        updatedAt: signedAt,
      },
    });

    return NextResponse.json({
      success: true,
      auditToken,
      signOff: signOffRecord,
    });
  } catch (error: any) {
    console.error("Scope sign-off error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to record digital signature." },
      { status: 500 }
    );
  }
}