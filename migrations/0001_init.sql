-- ═══════════════════════════════════════════════
-- TEDLYNS D1 SCHEMA — SQLite Migration
-- Run: npx wrangler d1 execute tedlyns-db --file=migrations/0001_init.sql
-- ═══════════════════════════════════════════════

-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'private' CHECK(role IN ('private', 'enterprise', 'admin')),
  company TEXT,
  phone TEXT,
  created_at INTEGER,
  updated_at INTEGER
);

-- Birthday / Event Registry
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'family' CHECK(type IN ('corporate', 'family')),
  relationship TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'paused', 'archived')),
  notified_at INTEGER,
  created_at INTEGER
);

-- Conversations (Concierge)
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'closed', 'whatsapp')),
  subject TEXT,
  created_at INTEGER,
  updated_at INTEGER
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL DEFAULT 'user' CHECK(sender_role IN ('user', 'admin')),
  content TEXT NOT NULL,
  created_at INTEGER
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
