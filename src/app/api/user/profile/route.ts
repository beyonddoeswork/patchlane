import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const cleanEmail = email.toLowerCase().trim();

    const user = await db.collection("users").findOne({ email: cleanEmail });

    return NextResponse.json({
      profile: {
        email: cleanEmail,
        displayName: user?.displayName || cleanEmail.split("@")[0],
        title: user?.title || "Developer",
        avatarColor: user?.avatarColor || "#4f46e5",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load profile" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { email, displayName, title, avatarColor } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const { db } = await connectToDatabase();

    await db.collection("users").updateOne(
      { email: cleanEmail },
      {
        $set: {
          displayName: displayName?.trim() || cleanEmail.split("@")[0],
          title: title?.trim() || "Developer",
          avatarColor: avatarColor || "#4f46e5",
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: "Profile updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}