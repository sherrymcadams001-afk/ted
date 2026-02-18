-- ═══════════════════════════════════════════════
-- TEDLYNS D1 — Allow guest chat IDs
-- Guests use user_id / sender_id like 'guest-<uuid>' which cannot satisfy FK to users.
-- This migration removes FK constraints on conversations.user_id and messages.sender_id.
-- ═══════════════════════════════════════════════

PRAGMA foreign_keys=off;

-- Conversations: drop FK to users(id)
DROP TABLE IF EXISTS conversations_new;
CREATE TABLE conversations_new (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'closed', 'whatsapp')),
  subject TEXT,
  created_at INTEGER,
  updated_at INTEGER
);
INSERT INTO conversations_new (id, user_id, status, subject, created_at, updated_at)
SELECT id, user_id, status, subject, created_at, updated_at FROM conversations;
DROP TABLE conversations;
ALTER TABLE conversations_new RENAME TO conversations;

-- Messages: drop FK to users(id)
DROP TABLE IF EXISTS messages_new;
CREATE TABLE messages_new (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_role TEXT NOT NULL DEFAULT 'user' CHECK(sender_role IN ('user', 'admin')),
  content TEXT NOT NULL,
  created_at INTEGER
);
INSERT INTO messages_new (id, conversation_id, sender_id, sender_role, content, created_at)
SELECT id, conversation_id, sender_id, sender_role, content, created_at FROM messages;
DROP TABLE messages;
ALTER TABLE messages_new RENAME TO messages;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

PRAGMA foreign_keys=on;
