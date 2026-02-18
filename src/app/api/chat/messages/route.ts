import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getMessagesByConversationId,
  createMessage,
  getConversationById,
  updateConversationStatus,
} from "@/db";
import { getCloudflareDb } from "@/lib/get-db";

export const runtime = "edge";

/** Resolve user identity — authenticated session or guest ID from header */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveIdentity(session: any, req?: Request) {
  if (session?.user?.id) {
    return {
      userId: session.user.id as string,
      isAdmin: session.user?.role === "admin",
      isGuest: false,
    };
  }
  const guestId = req?.headers.get("x-guest-id");
  if (guestId) {
    return { userId: `guest-${guestId}`, isAdmin: false, isGuest: true };
  }
  return null;
}

// GET — fetch messages for a conversation (polling endpoint)
export async function GET(req: Request) {
  const session = await auth();
  const identity = resolveIdentity(session, req);
  if (!identity) {
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

  const d1 = await getCloudflareDb();

  // Verify access
  const convo = await getConversationById(conversationId, d1);
  if (!convo) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  const isAdmin = identity.isAdmin;
  if (convo.userId !== identity.userId && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await getMessagesByConversationId(conversationId, d1);

  return NextResponse.json({ messages, status: convo.status });
}

// POST — send a message
export async function POST(req: Request) {
  const session = await auth();
  const identity = resolveIdentity(session, req);
  if (!identity) {
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

  const d1 = await getCloudflareDb();

  // Verify access
  const convo = await getConversationById(conversationId, d1);
  if (!convo) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  const isAdminPost = identity.isAdmin;
  if (convo.userId !== identity.userId && !isAdminPost) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const message = await createMessage({
    conversationId,
    senderId: identity.userId,
    senderRole: isAdminPost ? "admin" : "user",
    content: content.trim(),
  }, d1);

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

  const d1 = await getCloudflareDb();
  const updated = await updateConversationStatus(conversationId, status, d1);
  if (!updated) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ conversation: updated });
}
