/* ═══════════════════════════════════════════════
   LOCAL DEV STORE — In-memory for development
   On Cloudflare: replaced with D1 via Drizzle
   ═══════════════════════════════════════════════ */

import type { User, NewUser, Event, NewEvent, Message, NewMessage, Conversation, NewConversation } from "./schema";

// ── In-Memory Store (Dev Only) ──
// In production, API routes will use Cloudflare D1 bindings.
// This store persists for the lifetime of the dev server process.

interface Store {
  users: User[];
  events: Event[];
  messages: Message[];
  conversations: Conversation[];
}

const store: Store = {
  users: [],
  events: [],
  messages: [],
  conversations: [],
};

// ── Users ──
export function findUserByEmail(email: string): User | undefined {
  return store.users.find((u) => u.email === email);
}

export function findUserById(id: string): User | undefined {
  return store.users.find((u) => u.id === id);
}

export function createUser(data: NewUser): User {
  const user: User = {
    id: data.id ?? crypto.randomUUID(),
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role ?? "private",
    company: data.company ?? null,
    phone: data.phone ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  store.users.push(user);
  return user;
}

export function getAllUsers(): User[] {
  return store.users;
}

// ── Events (Birthday Protocol) ──
export function getEventsByUserId(userId: string): Event[] {
  return store.events.filter((e) => e.userId === userId && e.status === "active");
}

export function getAllEvents(): Event[] {
  return store.events;
}

export function createEvent(data: NewEvent): Event {
  const event: Event = {
    id: data.id ?? crypto.randomUUID(),
    userId: data.userId,
    name: data.name,
    date: data.date,
    type: data.type ?? "family",
    relationship: data.relationship ?? null,
    status: data.status ?? "active",
    notifiedAt: null,
    createdAt: new Date(),
  };
  store.events.push(event);
  return event;
}

export function deleteEvent(id: string, userId: string): boolean {
  const idx = store.events.findIndex((e) => e.id === id && e.userId === userId);
  if (idx === -1) return false;
  store.events.splice(idx, 1);
  return true;
}

export function getUpcomingBirthdays(daysAhead: number = 7): (Event & { user?: User })[] {
  const now = new Date();
  const upcoming: (Event & { user?: User })[] = [];

  for (const event of store.events) {
    if (event.status !== "active") continue;
    const [, month, day] = event.date.split("-").map(Number);
    const thisYear = new Date(now.getFullYear(), month - 1, day);
    const diff = (thisYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diff >= 0 && diff <= daysAhead) {
      const user = findUserById(event.userId);
      upcoming.push({ ...event, user });
    }
  }
  return upcoming;
}

// ── Conversations ──
export function getConversationsByUserId(userId: string): Conversation[] {
  return store.conversations.filter((c) => c.userId === userId);
}

export function getAllConversations(): Conversation[] {
  return store.conversations;
}

export function getConversationById(id: string): Conversation | undefined {
  return store.conversations.find((c) => c.id === id);
}

export function createConversation(data: NewConversation): Conversation {
  const convo: Conversation = {
    id: data.id ?? crypto.randomUUID(),
    userId: data.userId,
    status: data.status ?? "open",
    subject: data.subject ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  store.conversations.push(convo);
  return convo;
}

export function updateConversationStatus(
  id: string,
  status: "open" | "closed" | "whatsapp"
): Conversation | undefined {
  const convo = store.conversations.find((c) => c.id === id);
  if (convo) {
    convo.status = status;
    convo.updatedAt = new Date();
  }
  return convo;
}

// ── Messages ──
export function getMessagesByConversationId(conversationId: string): Message[] {
  return store.messages
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0));
}

export function createMessage(data: NewMessage): Message {
  const msg: Message = {
    id: data.id ?? crypto.randomUUID(),
    conversationId: data.conversationId,
    senderId: data.senderId,
    senderRole: data.senderRole ?? "user",
    content: data.content,
    createdAt: new Date(),
  };
  store.messages.push(msg);

  // Update conversation timestamp
  const convo = store.conversations.find((c) => c.id === data.conversationId);
  if (convo) convo.updatedAt = new Date();

  return msg;
}

export function getLatestMessagePerConversation(): Map<string, Message> {
  const latest = new Map<string, Message>();
  for (const msg of store.messages) {
    const existing = latest.get(msg.conversationId);
    if (!existing || (msg.createdAt?.getTime() ?? 0) > (existing.createdAt?.getTime() ?? 0)) {
      latest.set(msg.conversationId, msg);
    }
  }
  return latest;
}

