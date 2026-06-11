-- ============================================
-- Migration 001: Initial schema for PodcastAI
-- ============================================

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT,
  podcast_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Users (mirrors mock data structure)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'moderator')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  avatar TEXT,
  bio TEXT,
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_active TIMESTAMPTZ DEFAULT now(),
  social JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  password_hash TEXT
);

-- Collections (editor-created curated lists)
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Podcasts (published content)
CREATE TABLE IF NOT EXISTS podcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  host TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  episodes_count INTEGER DEFAULT 0,
  plays INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
  cover_image TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  rating NUMERIC(2,1) DEFAULT 0,
  language TEXT DEFAULT 'English',
  featured BOOLEAN DEFAULT false,
  summary TEXT,
  tags TEXT[] DEFAULT '{}',
  collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
  source_feed_id TEXT,
  source_feed_url TEXT
);

-- Episodes
CREATE TABLE IF NOT EXISTS episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  podcast_id UUID REFERENCES podcasts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  host TEXT,
  date TIMESTAMPTZ,
  duration TEXT,
  duration_seconds INTEGER,
  plays INTEGER DEFAULT 0,
  category TEXT,
  excerpt TEXT,
  tags TEXT[] DEFAULT '{}',
  audio_url TEXT,
  published BOOLEAN DEFAULT true,
  ai_highlights TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_episodes_podcast ON episodes(podcast_id);
CREATE INDEX IF NOT EXISTS idx_episodes_date ON episodes(date DESC);
CREATE INDEX IF NOT EXISTS idx_podcasts_category ON podcasts(category_id);
CREATE INDEX IF NOT EXISTS idx_podcasts_featured ON podcasts(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_podcasts_status ON podcasts(status);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read podcasts" ON podcasts FOR SELECT USING (true);
CREATE POLICY "Public read episodes" ON episodes FOR SELECT USING (true);
CREATE POLICY "Public read collections" ON collections FOR SELECT USING (true);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE podcasts;
ALTER PUBLICATION supabase_realtime ADD TABLE episodes;
