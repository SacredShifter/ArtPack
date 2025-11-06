/*
  # Art Pack Gallery Schema

  ## Overview
  Creates a comprehensive gallery system for Sacred Shifter Art Packs, enabling artists
  to share, discover, and install community-created visual experiences.

  ## New Tables
  
  ### `artpacks`
  Core registry of available art packs with metadata, validation status, and analytics.
  - `id` (uuid, PK): Unique pack identifier
  - `manifest_url` (text): Public URL to manifest.json
  - `preview_url` (text): Preview media (webm/gif/png)
  - `thumbnail_url` (text): Grid thumbnail image
  - `author_id` (uuid): Reference to auth.users
  - `author_name` (text): Display name
  - `title` (text): Pack display name
  - `description` (text): Rich description
  - `version` (text): Semver version
  - `license` (text): License type
  - `tags` (text[]): Searchable tags
  - `color_palette` (jsonb): Dominant colors for preview
  - `safety_passed` (boolean): Validation result
  - `safety_report` (jsonb): Detailed validation data
  - `signature` (text): JWT signature for verified packs
  - `installed_count` (integer): Installation counter
  - `favorite_count` (integer): Favorites counter
  - `curator_featured` (boolean): Curator highlight flag
  - `status` (text): published/draft/rejected
  - `created_at` (timestamptz): Creation timestamp
  - `updated_at` (timestamptz): Last update timestamp

  ### `pack_favorites`
  User favorites/bookmarks for packs.
  - `user_id` (uuid): Reference to auth.users
  - `pack_id` (uuid): Reference to artpacks
  - `created_at` (timestamptz): When favorited

  ### `pack_reviews`
  Community reviews and ratings.
  - `id` (uuid, PK): Review identifier
  - `pack_id` (uuid): Reference to artpacks
  - `user_id` (uuid): Reference to auth.users
  - `rating` (integer): 1-5 stars
  - `comment` (text): Review text
  - `created_at` (timestamptz): Review timestamp

  ### `pack_installations`
  Track installations for analytics.
  - `pack_id` (uuid): Reference to artpacks
  - `user_id` (uuid): Reference to auth.users (nullable for anonymous)
  - `installed_at` (timestamptz): Installation timestamp

  ## Security
  - Enable RLS on all tables
  - Public read access for published packs
  - Authenticated write access for uploads
  - User-scoped access for favorites and reviews
*/

-- Create artpacks table
CREATE TABLE IF NOT EXISTS artpacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manifest_url text NOT NULL,
  preview_url text,
  thumbnail_url text,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  version text NOT NULL,
  license text DEFAULT 'MIT',
  tags text[] DEFAULT '{}',
  color_palette jsonb DEFAULT '[]',
  safety_passed boolean DEFAULT false,
  safety_report jsonb DEFAULT '{}',
  signature text,
  installed_count integer DEFAULT 0,
  favorite_count integer DEFAULT 0,
  curator_featured boolean DEFAULT false,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create pack_favorites table
CREATE TABLE IF NOT EXISTS pack_favorites (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  pack_id uuid REFERENCES artpacks(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, pack_id)
);

-- Create pack_reviews table
CREATE TABLE IF NOT EXISTS pack_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id uuid REFERENCES artpacks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(pack_id, user_id)
);

-- Create pack_installations table
CREATE TABLE IF NOT EXISTS pack_installations (
  pack_id uuid REFERENCES artpacks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  installed_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_artpacks_status ON artpacks(status);
CREATE INDEX IF NOT EXISTS idx_artpacks_author ON artpacks(author_id);
CREATE INDEX IF NOT EXISTS idx_artpacks_featured ON artpacks(curator_featured);
CREATE INDEX IF NOT EXISTS idx_artpacks_created ON artpacks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artpacks_installed ON artpacks(installed_count DESC);
CREATE INDEX IF NOT EXISTS idx_artpacks_tags ON artpacks USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_pack_favorites_user ON pack_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_pack_reviews_pack ON pack_reviews(pack_id);

-- Enable Row Level Security
ALTER TABLE artpacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_installations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for artpacks
CREATE POLICY "Anyone can view published packs"
  ON artpacks FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authors can view their own packs"
  ON artpacks FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Authenticated users can create packs"
  ON artpacks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own packs"
  ON artpacks FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own packs"
  ON artpacks FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- RLS Policies for pack_favorites
CREATE POLICY "Users can view their own favorites"
  ON pack_favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can favorite packs"
  ON pack_favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfavorite packs"
  ON pack_favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for pack_reviews
CREATE POLICY "Anyone can view reviews for published packs"
  ON pack_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM artpacks
      WHERE artpacks.id = pack_reviews.pack_id
      AND artpacks.status = 'published'
    )
  );

CREATE POLICY "Authenticated users can create reviews"
  ON pack_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON pack_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON pack_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for pack_installations
CREATE POLICY "Anyone can record installations"
  ON pack_installations FOR INSERT
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_artpacks_updated_at'
  ) THEN
    CREATE TRIGGER update_artpacks_updated_at
      BEFORE UPDATE ON artpacks
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Function to increment favorite_count
CREATE OR REPLACE FUNCTION increment_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE artpacks
  SET favorite_count = favorite_count + 1
  WHERE id = NEW.pack_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to decrement favorite_count
CREATE OR REPLACE FUNCTION decrement_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE artpacks
  SET favorite_count = favorite_count - 1
  WHERE id = OLD.pack_id;
  RETURN OLD;
END;
$$ language 'plpgsql';

-- Triggers for favorite_count
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'increment_favorite_on_insert'
  ) THEN
    CREATE TRIGGER increment_favorite_on_insert
      AFTER INSERT ON pack_favorites
      FOR EACH ROW
      EXECUTE FUNCTION increment_favorite_count();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'decrement_favorite_on_delete'
  ) THEN
    CREATE TRIGGER decrement_favorite_on_delete
      AFTER DELETE ON pack_favorites
      FOR EACH ROW
      EXECUTE FUNCTION decrement_favorite_count();
  END IF;
END $$;
