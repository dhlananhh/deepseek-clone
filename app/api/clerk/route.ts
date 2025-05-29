import { Webhook, WebhookRequiredHeaders } from "svix";
import connectDB from "@/config/db";
import User, { IUser } from "@/models/User";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface ClerkEmailAddress {
  email_address: string;
}

interface ClerkWebhookEventData {
  id: string;
  email_addresses: ClerkEmailAddress[];
  first_name?: string | null;
  last_name?: string | null;
  image_url: string;
}

interface ClerkWebhookEvent {
  data: ClerkWebhookEventData;
  object: "event";
  type: "user.created" | "user.updated" | "user.deleted" | string;
}

export async function POST(req: NextRequest) {
  const SIGNING_SECRET =
    process.env.CLERK_WEBHOOK_SIGNING_SECRET || process.env.SIGNING_SERCRET;

  if (!SIGNING_SECRET) {
    console.error("Clerk signing secret is not defined in environment variables.");
    return NextResponse.json({ message: "Webhook secret not configured" }, { status: 500 });
  }

  const wh = new Webhook(SIGNING_SECRET);

  const headerPayload = await headers();
  const svixHeaders: WebhookRequiredHeaders = {
    "svix-id": headerPayload.get("svix-id") || "",
    "svix-timestamp": headerPayload.get("svix-timestamp") || "",
    "svix-signature": headerPayload.get("svix-signature") || "",
  };

  if (!svixHeaders[ "svix-id" ] || !svixHeaders[ "svix-timestamp" ] || !svixHeaders[ "svix-signature" ]) {
    return NextResponse.json({ message: "Missing Svix headers" }, { status: 400 });
  }

  const payloadString = await req.text();

  let event: ClerkWebhookEvent;
  try {
    event = wh.verify(payloadString, svixHeaders) as ClerkWebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json({ message: "Webhook verification failed", error: (err as Error).message }, { status: 400 });
  }

  const { data, type } = event;

  if (!data.email_addresses || data.email_addresses.length === 0) {
    console.error("Webhook data is missing email_addresses.");
    return NextResponse.json({ message: "Missing email address in webhook data" }, { status: 400 });
  }

  const userData: IUser = {
    _id: data.id,
    email: data.email_addresses[ 0 ].email_address,
    name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || data.email_addresses[ 0 ].email_address, // Fallback name
    image: data.image_url,
  };

  try {
    await connectDB();

    switch (type) {
      case "user.created":
        await User.create(userData);
        console.log("User created:", userData._id);
        break;

      case "user.updated":
        await User.findByIdAndUpdate(data.id, userData, { upsert: true, new: true });
        console.log("User updated:", userData._id);
        break;

      case "user.deleted":
        if (data.id) {
          await User.findByIdAndDelete(data.id);
          console.log("User deleted:", data.id);
        } else {
          console.warn("User deleted event received without an ID in data.", data);
        }
        break;

      default:
        console.log("Received unhandled Clerk webhook event type:", type);
        break;
    }
    return NextResponse.json({ success: true, message: "Webhook event received and processed" });
  } catch (error) {
    console.error("Error processing webhook event:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown database error occurred";
    return NextResponse.json({ success: false, message: "Error processing webhook event", error: errorMessage }, { status: 500 });
  }
}
