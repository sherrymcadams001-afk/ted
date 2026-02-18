-- Site content key-value store for admin-editable text/images
CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'text',   -- text | image | textarea | json
  label TEXT NOT NULL DEFAULT '',
  page TEXT NOT NULL DEFAULT 'home',
  updated_at INTEGER
);

-- Seed home page content
INSERT OR IGNORE INTO site_content (key, value, type, label, page, updated_at) VALUES
  ('home.hero.tagline', 'Indulge Yourself', 'text', 'Hero Tagline', 'home', 0),
  ('home.hero.subtitle', 'Where every dish tells a story and every gathering becomes an occasion. Abuja''s finest culinary logistics — seamless from our kitchen to your table.', 'textarea', 'Hero Subtitle', 'home', 0),
  ('home.hero.video', '/vid.mp4', 'text', 'Hero Video URL', 'home', 0),
  ('home.hero.poster', '/hero-poster.jpg', 'image', 'Hero Poster Image', 'home', 0),
  ('home.hero.cta1_text', 'Corporate Solutions', 'text', 'CTA Button 1 Text', 'home', 0),
  ('home.hero.cta1_link', '/curate?view=corporate', 'text', 'CTA Button 1 Link', 'home', 0),
  ('home.hero.cta2_text', 'Retail Collections', 'text', 'CTA Button 2 Text', 'home', 0),
  ('home.hero.cta2_link', '/curate?view=retail', 'text', 'CTA Button 2 Link', 'home', 0),
  ('home.section_label', 'What We Do', 'text', 'Section Label', 'home', 0),
  ('home.section_title', 'The Tedlyns Experience', 'text', 'Section Title', 'home', 0),
  ('home.section_subtitle', 'Three pillars, one standard of excellence. Whatever the occasion, we''ve got you covered.', 'textarea', 'Section Subtitle', 'home', 0);

-- Seed tribe page content
INSERT OR IGNORE INTO site_content (key, value, type, label, page, updated_at) VALUES
  ('tribe.header_label', 'Profits With Purpose', 'text', 'Page Label', 'tribe', 0),
  ('tribe.header_title', 'Ted''s Tribe', 'text', 'Page Title', 'tribe', 0),
  ('tribe.header_subtitle', 'Every Tedlyns experience contributes to something bigger. We believe that no celebration should happen in isolation — when we eat well, we should make sure others do too.', 'textarea', 'Page Subtitle', 'tribe', 0),
  ('tribe.founder.image', '/ceo.jpg', 'image', 'Founder Image', 'tribe', 0),
  ('tribe.founder.name', 'Ere Erhiaghe', 'text', 'Founder Name', 'tribe', 0),
  ('tribe.founder.title', 'Founder & Head Chef', 'text', 'Founder Title', 'tribe', 0),
  ('tribe.founder.quote', 'I started Tedlyns with a simple belief: food is more than just sustenance — it''s how we celebrate, how we connect, how we show love. Growing up in Abuja, I saw how a shared meal could bridge any divide. Ted''s Tribe is my promise that every plate we serve creates ripples of good that reach far beyond the table. When you order from us, you''re not just feeding your guests — you''re feeding someone else''s hope.', 'textarea', 'Founder Quote', 'tribe', 0),
  ('tribe.kindred_intro', 'Kindred Spirits is our community initiative — a network of clients, partners, and volunteers who believe that every Nigerian deserves a seat at the table. When you order with Tedlyns, you automatically become a Kindred Spirit. Welcome to the family.', 'textarea', 'Kindred Spirits Intro', 'tribe', 0),
  ('tribe.pillar1_title', 'Meal Outreach', 'text', 'Pillar 1 Title', 'tribe', 0),
  ('tribe.pillar1_desc', 'We partner with local shelters and schools to provide nutritious meals to those in need across Abuja. Because no one should go hungry while we celebrate.', 'textarea', 'Pillar 1 Description', 'tribe', 0),
  ('tribe.pillar2_title', 'Culinary Training', 'text', 'Pillar 2 Title', 'tribe', 0),
  ('tribe.pillar2_desc', 'Our apprenticeship programme equips young Nigerians with professional catering skills and small-business know-how. We''re building the next generation of chefs and entrepreneurs.', 'textarea', 'Pillar 2 Description', 'tribe', 0),
  ('tribe.pillar3_title', 'Red Cross Partnership', 'text', 'Pillar 3 Title', 'tribe', 0),
  ('tribe.pillar3_desc', 'A portion of every Tedlyns order supports the Nigerian Red Cross Society''s emergency relief and disaster response. Your indulgence has impact.', 'textarea', 'Pillar 3 Description', 'tribe', 0),
  ('tribe.stat1_value', '2400', 'text', 'Impact Stat 1 Value', 'tribe', 0),
  ('tribe.stat1_suffix', '+', 'text', 'Impact Stat 1 Suffix', 'tribe', 0),
  ('tribe.stat1_label', 'Meals Donated', 'text', 'Impact Stat 1 Label', 'tribe', 0),
  ('tribe.stat2_value', '150', 'text', 'Impact Stat 2 Value', 'tribe', 0),
  ('tribe.stat2_suffix', '+', 'text', 'Impact Stat 2 Suffix', 'tribe', 0),
  ('tribe.stat2_label', 'Chefs Trained', 'text', 'Impact Stat 2 Label', 'tribe', 0),
  ('tribe.stat3_value', '12', 'text', 'Impact Stat 3 Value', 'tribe', 0),
  ('tribe.stat3_suffix', '', 'text', 'Impact Stat 3 Suffix', 'tribe', 0),
  ('tribe.stat3_label', 'Communities Reached', 'text', 'Impact Stat 3 Label', 'tribe', 0),
  ('tribe.partner_title', 'Official Partner — Nigerian Red Cross Society', 'text', 'Partner Badge Title', 'tribe', 0),
  ('tribe.partner_subtitle', 'FCT Chapter · Since 2023', 'text', 'Partner Badge Subtitle', 'tribe', 0),
  ('tribe.testimonial1_quote', 'Tedlyns didn''t just cater our conference — they fed our entire shelter for a month. That''s the kind of business Nigeria needs more of.', 'textarea', 'Testimonial 1 Quote', 'tribe', 0),
  ('tribe.testimonial1_author', 'Amina B.', 'text', 'Testimonial 1 Author', 'tribe', 0),
  ('tribe.testimonial1_role', 'Director, Hope House Abuja', 'text', 'Testimonial 1 Role', 'tribe', 0),
  ('tribe.testimonial2_quote', 'The apprenticeship changed my life. I now run my own small catering outfit and I employ two people. Tedlyns gave me a chance when nobody else would.', 'textarea', 'Testimonial 2 Quote', 'tribe', 0),
  ('tribe.testimonial2_author', 'Chukwuemeka O.', 'text', 'Testimonial 2 Author', 'tribe', 0),
  ('tribe.testimonial2_role', 'Tedlyns Alumni, Class of 2024', 'text', 'Testimonial 2 Role', 'tribe', 0),
  ('tribe.testimonial3_quote', 'I order from Tedlyns because the food is excellent — but knowing that my money also feeds families? That''s why I keep coming back.', 'textarea', 'Testimonial 3 Quote', 'tribe', 0),
  ('tribe.testimonial3_author', 'Funke A.', 'text', 'Testimonial 3 Author', 'tribe', 0),
  ('tribe.testimonial3_role', 'Regular Client, Maitama', 'text', 'Testimonial 3 Role', 'tribe', 0);

-- Seed curate category metadata
INSERT OR IGNORE INTO site_content (key, value, type, label, page, updated_at) VALUES
  ('curate.corporate.headline', 'Corporate Catering', 'text', 'Corporate Headline', 'curate', 0),
  ('curate.corporate.subtitle', 'Boardroom-ready menus for Abuja''s top organisations. We show up correct, every time.', 'textarea', 'Corporate Subtitle', 'curate', 0),
  ('curate.bakery.headline', 'Artisan Bakery', 'text', 'Bakery Headline', 'curate', 0),
  ('curate.bakery.subtitle', 'Handcrafted with the kind of attention your grandmother would approve of. Every bite tells a story.', 'textarea', 'Bakery Subtitle', 'curate', 0),
  ('curate.gifting.headline', 'Curated Gifts', 'text', 'Gifting Headline', 'curate', 0),
  ('curate.gifting.subtitle', 'Thoughtfully assembled hampers that say what words cannot. For the people who matter most.', 'textarea', 'Gifting Subtitle', 'curate', 0);

-- Seed contact info
INSERT OR IGNORE INTO site_content (key, value, type, label, page, updated_at) VALUES
  ('contact.whatsapp', '2349000000000', 'text', 'WhatsApp Number', 'contact', 0),
  ('contact.email', 'hello@tedlyns.com', 'text', 'Contact Email', 'contact', 0),
  ('contact.phone', '+234 900 000 0000', 'text', 'Contact Phone', 'contact', 0),
  ('contact.address', 'Abuja, Nigeria', 'text', 'Address', 'contact', 0);

-- Seed footer content
INSERT OR IGNORE INTO site_content (key, value, type, label, page, updated_at) VALUES
  ('footer.tagline', 'From boardrooms to birthday parties — we bring the flavour, you bring the people.', 'textarea', 'Footer Tagline', 'footer', 0),
  ('footer.copyright_extra', 'Abuja, Nigeria — Culinary Logistics & Curated Experiences', 'text', 'Footer Subtext', 'footer', 0);
