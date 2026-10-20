import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectSlug = searchParams.get("projectSlug");

    if (!projectSlug) {
      return NextResponse.json({ error: "projectSlug is required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const messages = await db
      .collection("project_messages")
      .find({ projectSlug })
      .sort({ createdAt: 1 })
      .limit(150)
      .toArray();

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m._id.toString(),
        senderEmail: m.senderEmail,
        senderName: m.senderName,
        senderColor: m.senderColor || "#4f46e5",
        text: m.text,
        createdAt: m.createdAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load messages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectSlug, senderEmail, text } = body;

    if (!projectSlug || !senderEmail || !text?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const cleanEmail = senderEmail.toLowerCase().trim();

    // Look up sender's display profile
    const userProfile = await db.collection("users").findOne({ email: cleanEmail });

    const newMessage = {
      projectSlug,
      senderEmail: cleanEmail,
      senderName: userProfile?.displayName || cleanEmail.split("@")[0],
      senderColor: userProfile?.avatarColor || "#4f46e5",
      text: text.trim(),
      createdAt: new Date(),
    };

    const result = await db.collection("project_messages").insertOne(newMessage);

    return NextResponse.json({
      success: true,
      message: {
        id: result.insertedId.toString(),
        ...newMessage,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to send message" }, { status: 500 });
  }
}