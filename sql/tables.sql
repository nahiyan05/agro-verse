CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  area TEXT,
  city TEXT,
  country TEXT,
  profile_pic TEXT,
  age INTEGER,
  preferred_crops TEXT[],
  is_banned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE TABLE IF NOT EXISTS expenses_earnings (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('expense', 'earning')) NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  year INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM date)) STORED,
  month INTEGER GENERATED ALWAYS AS (EXTRACT(MONTH FROM date)) STORED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_expenses_earnings_user_id ON expenses_earnings(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_earnings_date ON expenses_earnings(date);
CREATE INDEX IF NOT EXISTS idx_expenses_earnings_year_month ON expenses_earnings(year, month);
CREATE INDEX IF NOT EXISTS idx_expenses_earnings_type ON expenses_earnings(type);
CREATE TABLE IF NOT EXISTS lands (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  land_type TEXT NOT NULL,
  area NUMERIC(10,2) NOT NULL,
  soil_quality TEXT,
  location_link TEXT,
  description TEXT,
  tags TEXT[],
  land_image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_lands_user_id ON lands(user_id);
CREATE INDEX IF NOT EXISTS idx_lands_created_at ON lands(created_at);
CREATE INDEX IF NOT EXISTS idx_lands_land_type ON lands(land_type);
CREATE TABLE IF NOT EXISTS admin (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO admin (username, password, email) VALUES 
('admin', '$2a$12$FmHwXEja.5cw8RisOzw4keox9SMDvEggNMRNVgCeUiH0D407W8PVu', 'admin@agriculture.com')
ON CONFLICT (username) DO NOTHING;
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  description TEXT,
  price_per_unit NUMERIC(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  quantity_available NUMERIC(10, 2) NOT NULL,
  location TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  images TEXT[],
  status TEXT CHECK (status IN ('active', 'sold', 'inactive')) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_marketplace_user_id ON marketplace_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_crop_name ON marketplace_listings(crop_name);
CREATE INDEX IF NOT EXISTS idx_marketplace_status ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_created_at ON marketplace_listings(created_at);
CREATE TABLE IF NOT EXISTS seasonal_crop_plans (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  land_id TEXT REFERENCES lands(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  season TEXT NOT NULL,
  planting_date DATE,
  expected_harvest_date DATE,
  estimated_yield NUMERIC(10, 2),
  yield_unit TEXT,
  notes TEXT,
  status TEXT CHECK (status IN ('planned', 'planted', 'harvested', 'cancelled')) DEFAULT 'planned',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_seasonal_crop_plans_user_id ON seasonal_crop_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_seasonal_crop_plans_land_id ON seasonal_crop_plans(land_id);
CREATE INDEX IF NOT EXISTS idx_seasonal_crop_plans_season ON seasonal_crop_plans(season);
CREATE INDEX IF NOT EXISTS idx_seasonal_crop_plans_status ON seasonal_crop_plans(status);
CREATE TABLE IF NOT EXISTS crop_records (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  land_id TEXT NOT NULL REFERENCES lands(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL, 
  season TEXT NOT NULL, 
  year INTEGER NOT NULL,
  planting_date DATE NOT NULL,
  harvest_date DATE,
  total_yield NUMERIC(10,2),
  yield_unit TEXT,
  total_expenses NUMERIC(10,2), 
  total_revenue NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS user_connections (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  requester_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(requester_id, receiver_id)
);
CREATE INDEX IF NOT EXISTS idx_user_connections_requester ON user_connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_receiver ON user_connections(receiver_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_status ON user_connections(status);
ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7);
ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude);
CREATE TABLE IF NOT EXISTS AIchats (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS AImessages (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  chat_id TEXT NOT NULL REFERENCES AIchats(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_AIchats_user_id ON AIchats(user_id);
CREATE INDEX IF NOT EXISTS idx_AIchats_created_at ON AIchats(created_at);
CREATE INDEX IF NOT EXISTS idx_AImessages_chat_id ON AImessages(chat_id);
CREATE INDEX IF NOT EXISTS idx_AImessages_timestamp ON AImessages(timestamp);
CREATE TABLE IF NOT EXISTS forum_posts (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  flair TEXT,
  area TEXT,
  city TEXT,
  images TEXT[],
  views_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  votes_count INTEGER DEFAULT 0,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_posts_area_city ON forum_posts(area, city);
CREATE INDEX IF NOT EXISTS idx_posts_flair ON forum_posts(flair);
CREATE INDEX IF NOT EXISTS idx_posts_last_activity ON forum_posts(last_activity DESC);
CREATE TABLE IF NOT EXISTS forum_comments (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  post_id TEXT NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON forum_comments(post_id);
CREATE TABLE IF NOT EXISTS forum_votes (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  post_id TEXT NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote_type SMALLINT NOT NULL CHECK (vote_type IN (1, -1)),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, post_id)
);
CREATE INDEX IF NOT EXISTS idx_votes_post_id ON forum_votes(post_id);
CREATE TABLE IF NOT EXISTS conversations (
  conversation_id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id TEXT NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (conversation_id, user_id)
);
CREATE TABLE IF NOT EXISTS messages (
  message_id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  conversation_id TEXT NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE TABLE IF NOT EXISTS user_connection_requests (
  request_id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(sender_id, receiver_id)
);
CREATE INDEX IF NOT EXISTS idx_user_connection_requests_sender ON user_connection_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_user_connection_requests_receiver ON user_connection_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_user_connection_requests_status ON user_connection_requests(status);
CREATE TABLE IF NOT EXISTS loans (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  loan_amount NUMERIC(12,2) NOT NULL,
  paid_amount NUMERIC(12,2) DEFAULT 0,
  payment_due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_created_at ON loans(created_at);
CREATE INDEX IF NOT EXISTS idx_loans_due_date ON loans(payment_due_date);
CREATE TABLE IF NOT EXISTS loan_payments (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  loan_id TEXT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_amount NUMERIC(12,2) NOT NULL,
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_loan_payments_loan_id ON loan_payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_user_id ON loan_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_date ON loan_payments(payment_date);
CREATE TABLE IF NOT EXISTS equipment (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  equipment_name TEXT NOT NULL,
  description TEXT,
  price_per_day NUMERIC(10,2) NOT NULL,
  max_duration_days INTEGER NOT NULL,
  owner_phone TEXT,
  owner_email TEXT,
  status TEXT NOT NULL DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS rental_requests (
  id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(4), 'hex'),
  equipment_id TEXT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  requester_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requester_phone TEXT,
  requester_email TEXT,
  price_per_day_requested NUMERIC(10,2) NOT NULL,
  requested_duration_days INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_equipment_owner_id ON equipment(owner_id);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_created_at ON equipment(created_at);
CREATE INDEX IF NOT EXISTS idx_rental_requests_equipment_id ON rental_requests(equipment_id);
CREATE INDEX IF NOT EXISTS idx_rental_requests_requester_id ON rental_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_rental_requests_status ON rental_requests(status);
CREATE INDEX IF NOT EXISTS idx_rental_requests_created_at ON rental_requests(created_at);
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    reporter_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_reason VARCHAR(255) NOT NULL,
    report_details TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    reporter_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_reason VARCHAR(255) NOT NULL,
    report_details TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
