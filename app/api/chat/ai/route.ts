import connectDB from "@/config/db";
import Chat, { IChatDocument, IMessageData } from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const maxDuration = 60;

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

interface AiRequestPayload {
  chatId: string;
  prompt: string;
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

    const { chatId, prompt }: AiRequestPayload = await req.json();
    if (!chatId || !prompt) {
      return NextResponse.json(
        { success: false, message: "Chat ID and prompt are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const chatDocument: IChatDocument | null = await Chat.findOne({
      userId,
      _id: chatId,
    });

    if (!chatDocument) {
      return NextResponse.json(
        { success: false, message: "Chat not found" },
        { status: 404 }
      );
    }

    const userPromptMessage: IMessageData = {
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    };
    chatDocument.messages.push(userPromptMessage);

    const completion = await openai.chat.completions.create({
      messages: [ { role: "user", content: prompt } ],
      model: "deepseek-chat",
      store: true,
    });

    if (
      !completion.choices ||
      completion.choices.length === 0 ||
      !completion.choices[ 0 ].message?.content
    ) {
      return NextResponse.json(
        { success: false, message: "AI response was empty or invalid." },
        { status: 500 }
      );
    }

    const assistantMessageContent = completion.choices[ 0 ].message.content;
    const assistantMessage: IMessageData = {
      role: "assistant",
      content: assistantMessageContent,
      timestamp: Date.now(),
    };

    chatDocument.messages.push(assistantMessage);
    await chatDocument.save();

    return NextResponse.json({
      success: true,
      data: assistantMessage
    });
  } catch (error) {
    console.error("Error in /api/chat/ai:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
