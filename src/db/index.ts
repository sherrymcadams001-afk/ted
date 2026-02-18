/* ═══════════════════════════════════════════════
   DUAL-MODE DATA LAYER
   • Production (Cloudflare Pages): D1 SQLite via binding
   • Local dev (next dev): In-memory store
   ═══════════════════════════════════════════════ */

import type { User, NewUser, Event, NewEvent, Message, NewMessage, Conversation, NewConversation, MenuItem, NewMenuItem } from "./schema";
import type { D1 } from "@/lib/get-db";

// ── In-Memory Store (Dev Only) ──
interface Store {
  users: User[];
  events: Event[];
  messages: Message[];
  conversations: Conversation[];
  menuItems: MenuItem[];
}

const store: Store = {
  users: [],
  events: [],
  messages: [],
  conversations: [],
  menuItems: [],
};

// ── Row → Model Mappers ──
function toDate(v: unknown): Date | null {
  if (v == null) return null;
  if (typeof v === "number") return new Date(v * 1000); // D1 stores epoch seconds
  if (v instanceof Date) return v;
  return null;
}

function mapUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    password: row.password as string,
    role: (row.role as User["role"]) ?? "private",
    company: (row.company as string) ?? null,
    phone: (row.phone as string) ?? null,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
}

function mapEvent(row: Record<string, unknown>): Event {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    date: row.date as string,
    type: (row.type as Event["type"]) ?? "family",
    relationship: (row.relationship as string) ?? null,
    status: (row.status as Event["status"]) ?? "active",
    notifiedAt: toDate(row.notified_at),
    createdAt: toDate(row.created_at),
  };
}

function mapConversation(row: Record<string, unknown>): Conversation {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    status: (row.status as Conversation["status"]) ?? "open",
    subject: (row.subject as string) ?? null,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
}

function mapMessage(row: Record<string, unknown>): Message {
  return {
    id: row.id as string,
    conversationId: row.conversation_id as string,
    senderId: row.sender_id as string,
    senderRole: (row.sender_role as Message["senderRole"]) ?? "user",
    content: row.content as string,
    createdAt: toDate(row.created_at),
  };
}

function mapMenuItem(row: Record<string, unknown>): MenuItem {
  return {
    id: row.id as string,
    category: row.category as MenuItem["category"],
    name: row.name as string,
    description: row.description as string,
    badge: (row.badge as string) ?? null,
    serves: (row.serves as string) ?? null,
    leadTime: (row.lead_time as string) ?? null,
    image: (row.image as string) ?? "",
    imagePrompt: (row.image_prompt as string) ?? "",
    sortOrder: (row.sort_order as number) ?? 0,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
}

function nowEpoch(): number {
  return Math.floor(Date.now() / 1000);
}

// ═══════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════

export async function findUserByEmail(email: string, d1?: D1 | null): Promise<User | undefined> {
  if (d1) {
    const row = await d1.prepare("SELECT * FROM users WHERE email = ? LIMIT 1").bind(email).first();
    return row ? mapUser(row as Record<string, unknown>) : undefined;
  }
  return store.users.find((u) => u.email === email);
}

export async function findUserById(id: string, d1?: D1 | null): Promise<User | undefined> {
  if (d1) {
    const row = await d1.prepare("SELECT * FROM users WHERE id = ? LIMIT 1").bind(id).first();
    return row ? mapUser(row as Record<string, unknown>) : undefined;
  }
  return store.users.find((u) => u.id === id);
}

export async function createUser(data: NewUser, d1?: D1 | null): Promise<User> {
  const id = data.id ?? crypto.randomUUID();
  const now = nowEpoch();

  if (d1) {
    await d1
      .prepare(
        `INSERT INTO users (id, name, email, password, role, company, phone, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(id, data.name, data.email, data.password, data.role ?? "private", data.company ?? null, data.phone ?? null, now, now)
      .run();
    return {
      id,
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role ?? "private",
      company: data.company ?? null,
      phone: data.phone ?? null,
      createdAt: new Date(now * 1000),
      updatedAt: new Date(now * 1000),
    };
  }

  const user: User = {
    id,
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

export async function getAllUsers(d1?: D1 | null): Promise<User[]> {
  if (d1) {
    const { results } = await d1.prepare("SELECT * FROM users ORDER BY created_at DESC").all();
    return (results as Record<string, unknown>[]).map(mapUser);
  }
  return store.users;
}

// ═══════════════════════════════════════════════
// EVENTS (Birthday Protocol)
// ═══════════════════════════════════════════════

export async function getEventsByUserId(userId: string, d1?: D1 | null): Promise<Event[]> {
  if (d1) {
    const { results } = await d1
      .prepare("SELECT * FROM events WHERE user_id = ? AND status = 'active' ORDER BY created_at DESC")
      .bind(userId)
      .all();
    return (results as Record<string, unknown>[]).map(mapEvent);
  }
  return store.events.filter((e) => e.userId === userId && e.status === "active");
}

export async function getAllEvents(d1?: D1 | null): Promise<Event[]> {
  if (d1) {
    const { results } = await d1.prepare("SELECT * FROM events ORDER BY created_at DESC").all();
    return (results as Record<string, unknown>[]).map(mapEvent);
  }
  return store.events;
}

export async function createEvent(data: NewEvent, d1?: D1 | null): Promise<Event> {
  const id = data.id ?? crypto.randomUUID();
  const now = nowEpoch();

  if (d1) {
    await d1
      .prepare(
        `INSERT INTO events (id, user_id, name, date, type, relationship, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(id, data.userId, data.name, data.date, data.type ?? "family", data.relationship ?? null, data.status ?? "active", now)
      .run();
    return {
      id,
      userId: data.userId,
      name: data.name,
      date: data.date,
      type: data.type ?? "family",
      relationship: data.relationship ?? null,
      status: data.status ?? "active",
      notifiedAt: null,
      createdAt: new Date(now * 1000),
    };
  }

  const event: Event = {
    id,
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

export async function deleteEvent(id: string, userId: string, d1?: D1 | null): Promise<boolean> {
  if (d1) {
    const result = await d1
      .prepare("DELETE FROM events WHERE id = ? AND user_id = ?")
      .bind(id, userId)
      .run();
    return (result.meta as Record<string, unknown>)?.changes !== 0;
  }
  const idx = store.events.findIndex((e) => e.id === id && e.userId === userId);
  if (idx === -1) return false;
  store.events.splice(idx, 1);
  return true;
}

export async function getUpcomingBirthdays(daysAhead: number = 7, d1?: D1 | null): Promise<(Event & { user?: User })[]> {
  if (d1) {
    // Fetch all active events, then filter in JS (D1 doesn't have great date functions)
    const { results } = await d1
      .prepare("SELECT * FROM events WHERE status = 'active'")
      .all();
    const allEvents = (results as Record<string, unknown>[]).map(mapEvent);
    const now = new Date();
    const upcoming: (Event & { user?: User })[] = [];

    for (const event of allEvents) {
      const [, month, day] = event.date.split("-").map(Number);
      const thisYear = new Date(now.getFullYear(), month - 1, day);
      const diff = (thisYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (diff >= 0 && diff <= daysAhead) {
        const user = await findUserById(event.userId, d1);
        upcoming.push({ ...event, user: user ?? undefined });
      }
    }
    return upcoming;
  }

  // In-memory path
  const now = new Date();
  const upcoming: (Event & { user?: User })[] = [];
  for (const event of store.events) {
    if (event.status !== "active") continue;
    const [, month, day] = event.date.split("-").map(Number);
    const thisYear = new Date(now.getFullYear(), month - 1, day);
    const diff = (thisYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diff >= 0 && diff <= daysAhead) {
      const user = store.users.find((u) => u.id === event.userId);
      upcoming.push({ ...event, user });
    }
  }
  return upcoming;
}

// ═══════════════════════════════════════════════
// CONVERSATIONS
// ═══════════════════════════════════════════════

export async function getConversationsByUserId(userId: string, d1?: D1 | null): Promise<Conversation[]> {
  if (d1) {
    const { results } = await d1
      .prepare("SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC")
      .bind(userId)
      .all();
    return (results as Record<string, unknown>[]).map(mapConversation);
  }
  return store.conversations.filter((c) => c.userId === userId);
}

export async function getAllConversations(d1?: D1 | null): Promise<Conversation[]> {
  if (d1) {
    const { results } = await d1.prepare("SELECT * FROM conversations ORDER BY updated_at DESC").all();
    return (results as Record<string, unknown>[]).map(mapConversation);
  }
  return store.conversations;
}

export async function getConversationById(id: string, d1?: D1 | null): Promise<Conversation | undefined> {
  if (d1) {
    const row = await d1.prepare("SELECT * FROM conversations WHERE id = ? LIMIT 1").bind(id).first();
    return row ? mapConversation(row as Record<string, unknown>) : undefined;
  }
  return store.conversations.find((c) => c.id === id);
}

export async function createConversation(data: NewConversation, d1?: D1 | null): Promise<Conversation> {
  const id = data.id ?? crypto.randomUUID();
  const now = nowEpoch();

  if (d1) {
    await d1
      .prepare(
        `INSERT INTO conversations (id, user_id, status, subject, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(id, data.userId, data.status ?? "open", data.subject ?? null, now, now)
      .run();
    return {
      id,
      userId: data.userId,
      status: data.status ?? "open",
      subject: data.subject ?? null,
      createdAt: new Date(now * 1000),
      updatedAt: new Date(now * 1000),
    };
  }

  const convo: Conversation = {
    id,
    userId: data.userId,
    status: data.status ?? "open",
    subject: data.subject ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  store.conversations.push(convo);
  return convo;
}

export async function updateConversationStatus(
  id: string,
  status: "open" | "closed" | "whatsapp",
  d1?: D1 | null
): Promise<Conversation | undefined> {
  const now = nowEpoch();

  if (d1) {
    await d1
      .prepare("UPDATE conversations SET status = ?, updated_at = ? WHERE id = ?")
      .bind(status, now, id)
      .run();
    return getConversationById(id, d1);
  }

  const convo = store.conversations.find((c) => c.id === id);
  if (convo) {
    convo.status = status;
    convo.updatedAt = new Date();
  }
  return convo;
}

// ═══════════════════════════════════════════════
// MESSAGES
// ═══════════════════════════════════════════════

export async function getMessagesByConversationId(conversationId: string, d1?: D1 | null): Promise<Message[]> {
  if (d1) {
    const { results } = await d1
      .prepare("SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC")
      .bind(conversationId)
      .all();
    return (results as Record<string, unknown>[]).map(mapMessage);
  }
  return store.messages
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0));
}

export async function createMessage(data: NewMessage, d1?: D1 | null): Promise<Message> {
  const id = data.id ?? crypto.randomUUID();
  const now = nowEpoch();

  if (d1) {
    await d1
      .prepare(
        `INSERT INTO messages (id, conversation_id, sender_id, sender_role, content, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(id, data.conversationId, data.senderId, data.senderRole ?? "user", data.content, now)
      .run();

    // Update conversation timestamp
    await d1
      .prepare("UPDATE conversations SET updated_at = ? WHERE id = ?")
      .bind(now, data.conversationId)
      .run();

    return {
      id,
      conversationId: data.conversationId,
      senderId: data.senderId,
      senderRole: data.senderRole ?? "user",
      content: data.content,
      createdAt: new Date(now * 1000),
    };
  }

  const msg: Message = {
    id,
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

export async function getLatestMessagePerConversation(d1?: D1 | null): Promise<Map<string, Message>> {
  if (d1) {
    // Get latest message per conversation using a subquery
    const { results } = await d1
      .prepare(
        `SELECT m.* FROM messages m
         INNER JOIN (
           SELECT conversation_id, MAX(created_at) as max_ts
           FROM messages GROUP BY conversation_id
         ) latest ON m.conversation_id = latest.conversation_id AND m.created_at = latest.max_ts`
      )
      .all();

    const map = new Map<string, Message>();
    for (const row of results as Record<string, unknown>[]) {
      const msg = mapMessage(row);
      map.set(msg.conversationId, msg);
    }
    return map;
  }

  const latest = new Map<string, Message>();
  for (const msg of store.messages) {
    const existing = latest.get(msg.conversationId);
    if (!existing || (msg.createdAt?.getTime() ?? 0) > (existing.createdAt?.getTime() ?? 0)) {
      latest.set(msg.conversationId, msg);
    }
  }
  return latest;
}

// ═══════════════════════════════════════════════
// MENU ITEMS (Curate)
// ═══════════════════════════════════════════════

export async function getAllMenuItems(d1?: D1 | null): Promise<MenuItem[]> {
  if (d1) {
    const { results } = await d1
      .prepare("SELECT * FROM menu_items ORDER BY category, sort_order ASC")
      .all();
    return (results as Record<string, unknown>[]).map(mapMenuItem);
  }
  // Seed once on first access in dev mode
  if (store.menuItems.length === 0) seedDefaultMenuItems();
  return [...store.menuItems].sort(
    (a, b) => a.category.localeCompare(b.category) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );
}

export async function getMenuItemsByCategory(
  category: string,
  d1?: D1 | null
): Promise<MenuItem[]> {
  if (d1) {
    const { results } = await d1
      .prepare("SELECT * FROM menu_items WHERE category = ? ORDER BY sort_order ASC")
      .bind(category)
      .all();
    return (results as Record<string, unknown>[]).map(mapMenuItem);
  }
  if (store.menuItems.length === 0) seedDefaultMenuItems();
  return store.menuItems
    .filter((m) => m.category === category)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export async function getMenuItemById(id: string, d1?: D1 | null): Promise<MenuItem | undefined> {
  if (d1) {
    const row = await d1.prepare("SELECT * FROM menu_items WHERE id = ? LIMIT 1").bind(id).first();
    return row ? mapMenuItem(row as Record<string, unknown>) : undefined;
  }
  if (store.menuItems.length === 0) seedDefaultMenuItems();
  return store.menuItems.find((m) => m.id === id);
}

export async function createMenuItem(data: NewMenuItem, d1?: D1 | null): Promise<MenuItem> {
  const id = data.id ?? crypto.randomUUID();
  const now = nowEpoch();

  if (d1) {
    await d1
      .prepare(
        `INSERT INTO menu_items (id, category, name, description, badge, serves, lead_time, image, image_prompt, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id, data.category, data.name, data.description,
        data.badge ?? null, data.serves ?? null, data.leadTime ?? null,
        data.image ?? "", data.imagePrompt ?? "", data.sortOrder ?? 0, now, now
      )
      .run();
    return {
      id, category: data.category, name: data.name, description: data.description,
      badge: data.badge ?? null, serves: data.serves ?? null, leadTime: data.leadTime ?? null,
      image: data.image ?? "", imagePrompt: data.imagePrompt ?? "", sortOrder: data.sortOrder ?? 0,
      createdAt: new Date(now * 1000), updatedAt: new Date(now * 1000),
    };
  }

  const item: MenuItem = {
    id, category: data.category, name: data.name, description: data.description,
    badge: data.badge ?? null, serves: data.serves ?? null, leadTime: data.leadTime ?? null,
    image: data.image ?? "", imagePrompt: data.imagePrompt ?? "", sortOrder: data.sortOrder ?? 0,
    createdAt: new Date(), updatedAt: new Date(),
  };
  store.menuItems.push(item);
  return item;
}

export async function updateMenuItem(
  id: string,
  data: Partial<Omit<MenuItem, "id" | "createdAt" | "updatedAt">>,
  d1?: D1 | null
): Promise<MenuItem | undefined> {
  const now = nowEpoch();

  if (d1) {
    const existing = await getMenuItemById(id, d1);
    if (!existing) return undefined;
    const merged = { ...existing, ...data };
    await d1
      .prepare(
        `UPDATE menu_items SET category=?, name=?, description=?, badge=?, serves=?, lead_time=?, image=?, image_prompt=?, sort_order=?, updated_at=? WHERE id=?`
      )
      .bind(
        merged.category, merged.name, merged.description,
        merged.badge ?? null, merged.serves ?? null, merged.leadTime ?? null,
        merged.image ?? "", merged.imagePrompt ?? "", merged.sortOrder ?? 0, now, id
      )
      .run();
    return { ...merged, updatedAt: new Date(now * 1000) };
  }

  const item = store.menuItems.find((m) => m.id === id);
  if (!item) return undefined;
  Object.assign(item, data, { updatedAt: new Date() });
  return item;
}

export async function deleteMenuItem(id: string, d1?: D1 | null): Promise<boolean> {
  if (d1) {
    const result = await d1.prepare("DELETE FROM menu_items WHERE id = ?").bind(id).run();
    return ((result.meta?.changes as number) ?? 0) > 0;
  }
  const idx = store.menuItems.findIndex((m) => m.id === id);
  if (idx === -1) return false;
  store.menuItems.splice(idx, 1);
  return true;
}

// ── Default Seed Data ──
function seedDefaultMenuItems() {
  const defaults: Omit<MenuItem, "createdAt" | "updatedAt">[] = [
    {
      id: "c1", category: "corporate", sortOrder: 0,
      name: "Executive Lunch Box",
      description: "Jollof rice, grilled chicken, plantain, coleslaw & chapman. Premium packaging with branded sleeve — the kind of lunch that makes your team smile.",
      serves: "Per person", leadTime: "48 hrs", badge: "Best Seller",
      image: "/menu/executive-lunch-box.jpg",
      imagePrompt: "Premium Nigerian executive lunch box photographed from a 45-degree overhead angle on a dark marble surface. Smoky party jollof rice with a deep-red tomato sheen, perfectly grilled chicken thigh with char marks, golden fried ripe plantain slices, fresh coleslaw in a small compartment, and a chilled glass bottle of chapman with orange slice garnish. Packaged in an elegant matte-black takeaway box with a gold branded sleeve. Warm directional lighting, shallow depth of field, editorial food photography style, 8K resolution.",
    },
    {
      id: "c2", category: "corporate", sortOrder: 1,
      name: "Conference Platter",
      description: "Assorted small chops — puff-puff, samosa, spring rolls, and dipping sauces. Perfect for that mid-meeting energy boost.",
      serves: "8–10 guests", leadTime: "72 hrs", badge: null,
      image: "/menu/conference-platter.jpg",
      imagePrompt: "Stunning overhead flat-lay of a Nigerian small chops platter on a round gold-rimmed charger plate against a dark obsidian background. Golden puff-puff dusted lightly, crispy samosas with flaky pastry, spring rolls with visible vegetable filling, mini chicken skewers, and three small dipping bowls (spicy pepper sauce, sweet chili, garlic mayo). Garnished with fresh parsley and lemon wedges. Professional food photography, soft studio lighting with golden tones, luxurious corporate event styling, 8K.",
    },
    {
      id: "c3", category: "corporate", sortOrder: 2,
      name: "Breakfast Spread",
      description: "Croissants, fruit platter, yogurt parfaits, freshly squeezed juice & drip coffee. White-glove setup included — we handle everything.",
      serves: "10–12 guests", leadTime: "48 hrs", badge: null,
      image: "/menu/breakfast-spread.jpg",
      imagePrompt: "Luxurious Nigerian corporate breakfast spread photographed on a long dark wood boardroom table with morning sunlight streaming in. Flaky golden croissants in a linen-lined basket, a colourful tropical fruit platter (mango, pineapple, watermelon, papaya), layered yogurt parfaits in elegant glass jars, fresh-pressed orange juice in glass carafes, and drip coffee in a polished silver setup. White bone china plates, linen napkins, scattered fresh mint leaves. Editorial wide-angle food photography, warm golden hour lighting, 8K resolution.",
    },
    {
      id: "c4", category: "corporate", sortOrder: 3,
      name: "Full-Day Event Package",
      description: "Breakfast, lunch & refreshments for your AGM, retreat, or conference. Dedicated service team, proper chinaware, and branded menu cards.",
      serves: "50+ guests", leadTime: "1 week", badge: "Premium",
      image: "/menu/full-day-event.jpg",
      imagePrompt: "Grand Nigerian corporate event catering setup in a high-ceiling Abuja conference hall. Long banquet tables with white tablecloths, elegant chafing dishes with polished silver lids revealing jollof rice, peppered beef, and fried rice. A separate dessert station with mini pastries. Uniformed service staff in black and gold. Branded menu cards with gold foil lettering on each place setting. Professional event photography, ambient warm lighting with chandeliers, wide shot showing scale and luxury, 8K resolution.",
    },
    {
      id: "b1", category: "bakery", sortOrder: 0,
      name: "Signature Celebration Cake",
      description: "Three-tier fondant masterpiece with a personal design consultation. Choose from red velvet, chocolate, vanilla, or carrot — each one baked with love.",
      serves: "30–40 slices", leadTime: "5 days", badge: "Signature",
      image: "/menu/celebration-cake.jpg",
      imagePrompt: "Magnificent three-tier Nigerian celebration cake on a gold cake stand against a dark backdrop with subtle bokeh fairy lights. Bottom tier ivory fondant with intricate gold leaf geometric patterns, middle tier deep burgundy with edible gold brush strokes, top tier white with fresh roses and gold-dusted berries. A gold cake server beside it, fine cake crumbs artfully scattered. Dramatic moody lighting from the left, shallow depth of field, luxury bakery editorial photography, 8K resolution.",
    },
    {
      id: "b2", category: "bakery", sortOrder: 1,
      name: "Cupcake Collection",
      description: "Box of 12 gourmet cupcakes with buttercream rosettes. Available with corporate branding — perfect for office celebrations.",
      serves: "12 pieces", leadTime: "48 hrs", badge: null,
      image: "/menu/cupcake-collection.jpg",
      imagePrompt: "Elegant box of 12 gourmet cupcakes arranged in a 3x4 grid inside a matte-black gift box with gold interior. Each cupcake has a different coloured buttercream rosette — gold, burgundy, ivory, and teal — piped with precision. Some topped with edible gold leaf, others with a chocolate disc stamped with a logo. Shot from directly overhead on dark marble, soft even studio lighting, sprinkles of edible gold dust. Luxury confectionery photography, 8K.",
    },
    {
      id: "b3", category: "bakery", sortOrder: 2,
      name: "Chin Chin Gift Jar",
      description: "Crunchy artisan chin chin in a premium glass jar with gold ribbon. The hostess gift that never misses.",
      serves: "Sharing", leadTime: "24 hrs", badge: "Popular",
      image: "/menu/chin-chin-jar.jpg",
      imagePrompt: "Premium glass mason jar filled with golden-brown crunchy Nigerian chin chin, sealed with a matte-black lid and tied with a thick gold satin ribbon bow. The jar sits on a dark wood surface beside loose chin chin pieces. A small kraft tag reads 'Made with love'. Warm side lighting creating a honey glow through the glass, bokeh background, shallow depth of field. Artisan Nigerian snack product photography, 8K resolution.",
    },
    {
      id: "b4", category: "bakery", sortOrder: 3,
      name: "Bread & Pastry Box",
      description: "Assorted Danish, croissants, banana bread, and meat pie. Fresh-baked morning delivery to your door — start the day right.",
      serves: "6–8 pieces", leadTime: "24 hrs", badge: null,
      image: "/menu/pastry-box.jpg",
      imagePrompt: "Artisan pastry box opened to reveal an assortment of fresh-baked Nigerian and continental pastries on parchment paper inside an elegant kraft box. Golden flaky croissants, swirled Danish pastries with custard filling, thick slices of moist banana bread with walnut pieces, and golden-crusted Nigerian meat pies with crimped edges. Steam wisps rising, flour dusting on the box edge. Morning window light, rustic-luxe styling, dark marble countertop. Professional bakery photography, 8K.",
    },
    {
      id: "g1", category: "gifting", sortOrder: 0,
      name: "The Indulgence Box",
      description: "Premium chocolate truffles, artisan chin chin, wine, scented candle & a personalised card — all nestled in a beautiful gold box. The kind of gift people don't forget.",
      serves: null, leadTime: "72 hrs", badge: "Luxury",
      image: "/menu/indulgence-box.jpg",
      imagePrompt: "Stunning luxury Nigerian gift hamper in an open gold-foil box lined with champagne-coloured tissue paper. Contents artfully arranged: a bottle of rich red wine, premium Belgian chocolate truffles in gold wrappers, a glass jar of artisan chin chin, a cream scented candle in a gold vessel, and a personalised ivory card with calligraphy. Dark obsidian background, dramatic side lighting with warm golden tones, rose petals scattered around the box. High-end gift product photography, 8K resolution.",
    },
    {
      id: "g2", category: "gifting", sortOrder: 1,
      name: "Birthday Bundle",
      description: "Celebration cake, cupcake box, balloon arrangement & a bottle of bubbly. Everything they need for a birthday they'll remember.",
      serves: null, leadTime: "72 hrs", badge: "Best Seller",
      image: "/menu/birthday-bundle.jpg",
      imagePrompt: "Joyful premium Nigerian birthday bundle arrangement photographed at a slight angle on a dark surface. A two-tier fondant birthday cake in ivory with gold script reading 'Cheers', a box of 6 cupcakes with colourful buttercream, elegant gold and white helium balloons clustered behind, and a bottle of champagne with condensation droplets. Confetti scattered on the surface, warm festive lighting with bokeh, celebration atmosphere. Luxury lifestyle product photography, 8K.",
    },
    {
      id: "g3", category: "gifting", sortOrder: 2,
      name: "Corporate Welcome Kit",
      description: "Branded tote, artisan snack box, welcome card & company-curated treats for new hires. First impressions matter — make yours count.",
      serves: "Per person", leadTime: "1 week", badge: null,
      image: "/menu/corporate-welcome-kit.jpg",
      imagePrompt: "Professional Nigerian corporate welcome kit flat-lay on dark charcoal linen. A canvas tote bag with subtle embossed logo, a small kraft snack box containing artisan chin chin and cookies, an elegant welcome card with gold foil border, a branded notebook with pen, and company-curated chocolate bar. Clean minimalist composition, geometric arrangement, soft overhead studio lighting. Corporate branding product photography, neutral tones with gold accents, 8K resolution.",
    },
    {
      id: "g4", category: "gifting", sortOrder: 3,
      name: "Seasonal Hamper",
      description: "Eid, Christmas, or any festive season — dates, cookies, juice, nuts, rice & premium packaging. Bulk options available for corporate gifting.",
      serves: null, leadTime: "1 week", badge: null,
      image: "/menu/seasonal-hamper.jpg",
      imagePrompt: "Grand Nigerian festive season hamper in a large woven basket with gold ribbon handle, photographed at eye level on a dark wood surface. Contains boxes of premium Medjool dates, assorted shortbread cookies, bottles of cranberry and apple juice, mixed nuts in glass jars, a bag of premium Thai rice, dried fruit packs, and a tin of holiday biscuits. Basket wrapped in clear cellophane with a massive gold bow on top. Warm ambient lighting with festive bokeh in background. Premium hamper product photography, rich and abundant styling, 8K resolution.",
    },
  ];

  for (const d of defaults) {
    store.menuItems.push({ ...d, createdAt: new Date(), updatedAt: new Date() });
  }
}

// ── Admin seed ──
// Ensures an admin account exists in BOTH in-memory (local dev) and D1 (production).
// Email: admin@tedlyns.com  Password: admin123
const ADMIN_SEED = {
  id: "admin-seed-001",
  name: "Ere (Admin)",
  email: "admin@tedlyns.com",
  // bcrypt hash of "admin123" — pre-computed so no async needed
  password: "$2b$12$p4b/nhONEVgBsGQc/GppY.dExf3zNrSkqJWAdp722QZVul5.CHk5C",
  role: "admin" as const,
  company: "Tedlyns",
  phone: null,
};

// Sync seed for in-memory store (runs on module load)
function seedDevAdmin() {
  if (store.users.some((u) => u.email === ADMIN_SEED.email)) return;
  store.users.push({
    ...ADMIN_SEED,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

// Async seed for D1 (production) — call from auth authorize
export async function ensureAdminExists(d1?: D1 | null): Promise<void> {
  if (!d1) return; // in-memory handled by seedDevAdmin
  try {
    const existing = await d1
      .prepare("SELECT id FROM users WHERE email = ? LIMIT 1")
      .bind(ADMIN_SEED.email)
      .first();
    if (existing) return;

    const now = nowEpoch();
    await d1
      .prepare(
        `INSERT OR IGNORE INTO users (id, name, email, password, role, company, phone, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        ADMIN_SEED.id, ADMIN_SEED.name, ADMIN_SEED.email, ADMIN_SEED.password,
        ADMIN_SEED.role, ADMIN_SEED.company, ADMIN_SEED.phone, now, now
      )
      .run();
  } catch {
    // Table may not exist yet — migration not run. Silently skip.
  }
}

// Auto-seed on module load (dev only — in-memory store)
seedDevAdmin();
