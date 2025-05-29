import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const chatData = {
      userId,
      messages: [],
      name: "New Chat",
    };

    await connectDB();
    const newChat = await Chat.create(chatData);

    return NextResponse.json({ success: true, message: "Chat created", data: newChat });
  } catch (error) {
    console.error("Error in /api/chat/create:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
