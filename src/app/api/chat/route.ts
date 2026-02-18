import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getConversationsByUserId,
  getAllConversations,
  createConversation,
  getLatestMessagePerConversation,
  findUserById,
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

// GET — list conversations
export async function GET(req: Request) {
  const session = await auth();
  const identity = resolveIdentity(session, req);
  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const d1 = await getCloudflareDb();
  const conversations = identity.isAdmin
    ? await getAllConversations(d1)
    : await getConversationsByUserId(identity.userId, d1);

  // Attach latest message preview + user info
  const latestMessages = await getLatestMessagePerConversation(d1);

  const enriched = await Promise.all(
    conversations.map(async (convo) => {
      const lastMsg = latestMessages.get(convo.id);
      const isGuestConvo = convo.userId.startsWith("guest-");
      const user = isGuestConvo ? null : await findUserById(convo.userId, d1);
      return {
        ...convo,
        userName: isGuestConvo ? "Guest" : (user?.name ?? "Unknown"),
        userEmail: isGuestConvo ? "" : (user?.email ?? ""),
        lastMessage: lastMsg?.content ?? null,
        lastMessageAt: lastMsg?.createdAt ?? null,
      };
    })
  );

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
  const identity = resolveIdentity(session, req);
  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const d1 = await getCloudflareDb();
  const convo = await createConversation({
    userId: identity.userId,
    subject: body.subject ?? "New Conversation",
  }, d1);

  return NextResponse.json({ conversation: convo }, { status: 201 });
}
