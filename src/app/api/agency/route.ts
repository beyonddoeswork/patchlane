import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, agencyName, phone, teamSize, plan } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const collection = db.collection("agencies");

    await collection.updateOne(
      { email },
      {
        $set: {
          agencyName: agencyName || "Independent Studio",
          phone: phone || "",
          teamSize: teamSize || "1-5",
          plan: plan || "starter",
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Agency profile save error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}