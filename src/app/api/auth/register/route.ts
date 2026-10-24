import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, agencyName, displayName } = await req.json();

    if (!email || !agencyName) {
      return NextResponse.json({ error: "Email and Agency Name are required." }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const cleanEmail = email.toLowerCase().trim();

    // 1. Create or update agency profile
    await db.collection("agencies").updateOne(
      { email: cleanEmail },
      {
        $set: {
          agencyName: agencyName.trim(),
          plan: "starter",
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    // 2. Set default user profile
    await db.collection("users").updateOne(
      { email: cleanEmail },
      {
        $set: {
          displayName: displayName?.trim() || cleanEmail.split("@")[0],
          title: "Agency Owner",
          avatarColor: "#4f46e5",
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: "Agency registered successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to register agency profile." }, { status: 500 });
  }
}