-- ═══════════════════════════════════════════════
-- TEDLYNS D1 — Menu Items Table + Admin Seed
-- Run: npx wrangler d1 execute tedlyns-db --file=migrations/0002_menu_items_and_admin.sql
-- ═══════════════════════════════════════════════

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK(category IN ('corporate', 'bakery', 'gifting')),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  badge TEXT,
  serves TEXT,
  lead_time TEXT,
  image TEXT NOT NULL DEFAULT '',
  image_prompt TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER,
  updated_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);

-- ═══════════════════════════════════════════════
-- Seed: Admin Account
-- Email: admin@tedlyns.com  Password: admin123
-- bcrypt hash pre-computed (12 rounds)
-- ═══════════════════════════════════════════════
INSERT OR IGNORE INTO users (id, name, email, password, role, company, phone, created_at, updated_at)
VALUES (
  'admin-seed-001',
  'Ere (Admin)',
  'admin@tedlyns.com',
  '$2b$12$p4b/nhONEVgBsGQc/GppY.dExf3zNrSkqJWAdp722QZVul5.CHk5C',
  'admin',
  'Tedlyns',
  NULL,
  unixepoch(),
  unixepoch()
);

-- ═══════════════════════════════════════════════
-- Seed: Default Menu Items
-- ═══════════════════════════════════════════════
INSERT OR IGNORE INTO menu_items (id, category, name, description, badge, serves, lead_time, image, image_prompt, sort_order, created_at, updated_at) VALUES
  ('c1', 'corporate', 'Executive Lunch Box', 'Jollof rice, grilled chicken, plantain, coleslaw & a chilled drink — packed in a branded box. Ideal for board meetings, workshops & corporate events.', 'Best Seller', '1 person', '24 hrs', '/menu/executive-lunch-box.jpg', '', 1, unixepoch(), unixepoch()),
  ('c2', 'corporate', 'Conference Platter', 'Assorted puff-puff, samosas, spring rolls, mini pies & fruit skewers on a premium tray. Perfect for conferences, training sessions & networking events.', NULL, '10–15', '48 hrs', '/menu/conference-platter.jpg', '', 2, unixepoch(), unixepoch()),
  ('c3', 'corporate', 'Breakfast Spread', 'Croissants, fresh fruit, yoghurt parfaits, toast & juice — individually packed or buffet-style for morning meetings.', NULL, '5–20', '24 hrs', '/menu/breakfast-spread.jpg', '', 3, unixepoch(), unixepoch()),
  ('c4', 'corporate', 'Full-Day Event Package', 'Breakfast → mid-morning snack → lunch → afternoon refreshment. Complete catering for all-day conferences and retreats.', 'Premium', '20+', '72 hrs', '/menu/full-day-event.jpg', '', 4, unixepoch(), unixepoch()),
  ('b1', 'bakery', 'Celebration Cake', 'Custom-designed fondant or buttercream cake for birthdays, weddings & milestones. Flavours: vanilla, red velvet, chocolate, carrot.', 'Popular', '10–50', '72 hrs', '/menu/celebration-cake.jpg', '', 1, unixepoch(), unixepoch()),
  ('b2', 'bakery', 'Cupcake Collection', 'Box of 12 or 24 gourmet cupcakes — assorted toppings & flavours. Great for offices, parties & gifting.', NULL, '12–24 pcs', '48 hrs', '/menu/cupcake-collection.jpg', '', 2, unixepoch(), unixepoch()),
  ('b3', 'bakery', 'Chin-Chin Jar', 'Crunchy, golden chin-chin in a branded glass jar. A beloved Nigerian snack elevated for gifting.', NULL, NULL, '24 hrs', '/menu/chin-chin-jar.jpg', '', 3, unixepoch(), unixepoch()),
  ('b4', 'bakery', 'Pastry Box', 'Assorted croissants, danish pastries, sausage rolls & meat pies in a premium box. Perfect morning-meeting add-on.', NULL, '6–12 pcs', '24 hrs', '/menu/pastry-box.jpg', '', 4, unixepoch(), unixepoch()),
  ('g1', 'gifting', 'The Indulgence Box', 'Curated box with artisan chocolate, wine/juice, cookies, dried fruit & a handwritten note. Perfect for thank-yous & celebrations.', 'Signature', '1 person', '48 hrs', '/menu/indulgence-box.jpg', '', 1, unixepoch(), unixepoch()),
  ('g2', 'gifting', 'Birthday Bundle', 'Cake + cupcakes + chin-chin jar + a personalised card. Complete birthday gifting in one order.', NULL, NULL, '72 hrs', '/menu/birthday-bundle.jpg', '', 2, unixepoch(), unixepoch()),
  ('g3', 'gifting', 'Corporate Welcome Kit', 'Branded tote with snack box, notebook, pen & a sweet treat. Perfect for onboarding new hires or client gifts.', NULL, '1 person', '1 week', '/menu/corporate-welcome-kit.jpg', '', 3, unixepoch(), unixepoch()),
  ('g4', 'gifting', 'Seasonal Hamper', 'Eid, Christmas, or any festive season — dates, cookies, juice, nuts, rice & premium packaging. Bulk options available for corporate gifting.', NULL, NULL, '1 week', '/menu/seasonal-hamper.jpg', '', 4, unixepoch(), unixepoch());
