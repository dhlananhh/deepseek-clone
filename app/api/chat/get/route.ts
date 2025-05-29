import connectDB from "@/config/db";
import Chat, { IChatDocument } from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    await connectDB();
    const chats: IChatDocument[] = await Chat.find({ userId }).sort({ updatedAt: -1 });

    return NextResponse.json({ success: true, data: chats });
  } catch (error) {
    console.error("Error in /api/chat/get:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
