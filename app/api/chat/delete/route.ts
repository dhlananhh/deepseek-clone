import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

interface DeleteChatPayload {
  chatId: string;
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

    const { chatId }: DeleteChatPayload = await req.json();
    if (!chatId) {
      return NextResponse.json(
        { success: false, message: "Chat ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const result = await Chat.deleteOne({ _id: chatId, userId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Chat not found or user unauthorized to delete" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Chat Deleted" });
  } catch (error) {
    console.error("Error in /api/chat/delete:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
