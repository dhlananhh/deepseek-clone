import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

interface RenameChatPayload {
  chatId: string;
  name: string;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const { chatId, name }: RenameChatPayload = await req.json();
    if (!chatId || !name) {
      return NextResponse.json(
        { success: false, message: "Chat ID and new name are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const updatedChat = await Chat.findOneAndUpdate(
      { _id: chatId, userId },
      { name },
      { new: true }
    );

    if (!updatedChat) {
      return NextResponse.json(
        { success: false, message: "Chat not found or user unauthorized to rename" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Chat Renamed", data: updatedChat });
  } catch (error) {
    console.error("Error in /api/chat/rename:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
