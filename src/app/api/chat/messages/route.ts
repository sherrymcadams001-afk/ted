import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getMessagesByConversationId,
  createMessage,
  getConversationById,
  updateConversationStatus,
} from "@/db";

// GET — fetch messages for a conversation (polling endpoint)
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");
  if (!conversationId) {
    return NextResponse.json(
      { error: "conversationId required" },
      { status: 400 }
    );
  }

  // Verify access
  const convo = getConversationById(conversationId);
  if (!convo) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  const isAdmin = (session.user as { role: string }).role === "admin";
  if (convo.userId !== session.user.id && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = getMessagesByConversationId(conversationId);

  return NextResponse.json({ messages, status: convo.status });
}

// POST — send a message
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { conversationId, content } = body;

  if (!conversationId || !content?.trim()) {
    return NextResponse.json(
      { error: "conversationId and content required" },
      { status: 400 }
    );
  }

  // Verify access
  const convo = getConversationById(conversationId);
  if (!convo) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  const isAdmin = (session.user as { role: string }).role === "admin";
  if (convo.userId !== session.user.id && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const message = createMessage({
    conversationId,
    senderId: session.user.id,
    senderRole: isAdmin ? "admin" : "user",
    content: content.trim(),
  });

  return NextResponse.json({ message }, { status: 201 });
}

// PATCH — update conversation status (admin: close, handover to WhatsApp)
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = (session.user as { role: string }).role === "admin";
  if (!isAdmin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = await req.json();
  const { conversationId, status } = body;

  if (!conversationId || !["open", "closed", "whatsapp"].includes(status)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const updated = updateConversationStatus(conversationId, status);
  if (!updated) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ conversation: updated });
}
