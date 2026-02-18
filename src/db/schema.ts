import {
  sqliteTable,
  text,
  integer,
} from "drizzle-orm/sqlite-core";

/* ═══════════════════════════════════════════════
   TEDLYNS D1 SCHEMA — Drizzle ORM (SQLite)
   ═══════════════════════════════════════════════ */

// ── Users ──
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["private", "enterprise", "admin"] })
    .notNull()
    .default("private"),
  company: text("company"),
  phone: text("phone"),
  avatar: text("avatar"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
});

// ── Birthday / Event Registry ──
export const events = sqliteTable("events", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  date: text("date").notNull(), // ISO date string YYYY-MM-DD
  type: text("type", { enum: ["corporate", "family"] })
    .notNull()
    .default("family"),
  relationship: text("relationship"), // e.g. "spouse", "child", "staff"
  status: text("status", { enum: ["active", "paused", "archived"] })
    .notNull()
    .default("active"),
  notifiedAt: integer("notified_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
});

// ── Chat Messages (Concierge) ──
export const messages = sqliteTable("messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  conversationId: text("conversation_id").notNull(),
  senderId: text("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  senderRole: text("sender_role", { enum: ["user", "admin"] })
    .notNull()
    .default("user"),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
});

// ── Conversations ──
export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["open", "closed", "whatsapp"] })
    .notNull()
    .default("open"),
  subject: text("subject"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
});

// ── Menu Items (Curate) ──
export const menuItems = sqliteTable("menu_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  category: text("category", { enum: ["corporate", "bakery", "gifting"] }).notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  badge: text("badge"),
  serves: text("serves"),
  leadTime: text("lead_time"),
  image: text("image").notNull().default(""),
  imagePrompt: text("image_prompt").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
});

// ── Type exports for use across the app ──
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type MenuItem = typeof menuItems.$inferSelect;
export type NewMenuItem = typeof menuItems.$inferInsert;
