import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getConversationsByUserId,
  getAllConversations,
  createConversation,
  getLatestMessagePerConversation,
  findUserById,
} from "@/db";

// GET — list conversations
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = (session.user as { role: string }).role === "admin";
  const conversations = isAdmin
    ? getAllConversations()
    : getConversationsByUserId(session.user.id);

  // Attach latest message preview + user info
  const latestMessages = getLatestMessagePerConversation();

  const enriched = conversations.map((convo) => {
    const lastMsg = latestMessages.get(convo.id);
    const user = findUserById(convo.userId);
    return {
      ...convo,
      userName: user?.name ?? "Unknown",
      userEmail: user?.email ?? "",
      lastMessage: lastMsg?.content ?? null,
      lastMessageAt: lastMsg?.createdAt ?? null,
    };
  });

  // Sort by most recent activity
  enriched.sort((a, b) => {
    const aTime = a.lastMessageAt?.getTime() ?? a.createdAt?.getTime() ?? 0;
    const bTime = b.lastMessageAt?.getTime() ?? b.createdAt?.getTime() ?? 0;
    return bTime - aTime;
  });

  return NextResponse.json({ conversations: enriched });
}

// POST — create a new conversation
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const convo = createConversation({
    userId: session.user.id,
    subject: body.subject ?? "New Conversation",
  });

  return NextResponse.json({ conversation: convo }, { status: 201 });
}
