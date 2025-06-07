import mongoose, { Document, Model, Schema } from "mongoose";

export interface IMessageData {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

export interface IChat {
  name: string;
  messages: IMessageData[];
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IChatDocument extends IChat, Document { }

const ChatSchema = new Schema<IChatDocument>(
  {
    name: { type: String, required: true },
    messages: [
      {
        role: { type: String, required: true },
        content: { type: String, required: true },
        timestamp: { type: Number, required: true },
      },
    ],
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

const Chat: Model<IChatDocument> =
  mongoose.models.Chat || mongoose.model<IChatDocument>("Chat", ChatSchema);

export default Chat;
