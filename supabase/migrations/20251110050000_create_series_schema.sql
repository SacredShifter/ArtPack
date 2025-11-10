/*
  # Create Series Schema for Art Pack Collections

  ## Overview
  Extends the art pack system to support curated series like "The Unseen" with
  narrative progression, coherence-based unlocking, and journey orchestration.

  ## New Tables

  ### `series`
  Master metadata for art pack series/collections.
  - `id` (uuid, PK): Unique series identifier
  - `slug` (text, unique): URL-friendly identifier (e.g., "the-unseen")
  - `name` (text): Display name (e.g., "The Unseen Series")
  - `description` (text): Full narrative description
  - `author_id` (uuid): Reference to auth.users (series creator)
  - `author_name` (text): Creator display name
  - `narrative_arc` (text): Story/journey description
  - `total_packs` (integer): Number of packs in series
  - `aesthetic_notes` (jsonb): Visual style guidelines
  - `badge_url` (text): Series badge/logo URL
  - `color_palette` (jsonb): Series color scheme
  - `release_wave` (integer): Which release wave (1, 2, 3)
  - `status` (text): draft/published/archived
  - `featured` (boolean): Featured series flag
  - `created_at` (timestamptz): Creation timestamp
  - `updated_at` (timestamptz): Last update timestamp

  ### `series_progression_logic`
  Defines coherence-based progression and unlock rules.
  - `id` (uuid, PK): Rule identifier
  - `series_id` (uuid): Reference to series
  - `from_pack_id` (uuid): Starting pack (nullable for series entry)
  - `to_pack_id` (uuid): Target pack
  - `unlock_threshold` (jsonb): Metrics required {coherence: 0.85, stillness: 0.9}
  - `duration_seconds` (integer): Optional minimum duration before unlock
  - `suggestion_text` (text): Message shown when threshold met
  - `ordering` (integer): Sequence order in progression
  - `created_at` (timestamptz): Creation timestamp

  ## Modified Tables

  ### `artpacks` (add series fields)
  - `series_id` (uuid): Reference to series (nullable)
  - `series_order` (integer): Position within series
  - `motion_profile` (text): Motion style descriptor
  - `power_rating` (integer): Intensity level 1-5
  - `aesthetic_coherence_score` (float): How well it fits series aesthetic

  ## Security
  - Enable RLS on all new tables
  - Public read access for published series
  - Authenticated write for series creators
  - Progression logic readable by anyone using the packs
*/

-- ============================================================================
-- CREATE SERIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text NOT NULL,
  narrative_arc text DEFAULT '',
  total_packs integer DEFAULT 0,
  aesthetic_notes jsonb DEFAULT '{}',
  badge_url text,
  color_palette jsonb DEFAULT '[]',
  release_wave integer DEFAULT 1,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- CREATE SERIES PROGRESSION LOGIC TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS series_progression_logic (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid REFERENCES series(id) ON DELETE CASCADE NOT NULL,
  from_pack_id uuid REFERENCES artpacks(id) ON DELETE CASCADE,
  to_pack_id uuid REFERENCES artpacks(id) ON DELETE CASCADE NOT NULL,
  unlock_threshold jsonb DEFAULT '{}',
  duration_seconds integer,
  suggestion_text text DEFAULT '',
  ordering integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(series_id, from_pack_id, to_pack_id)
);

-- ============================================================================
-- EXTEND ARTPACKS TABLE WITH SERIES FIELDS
-- ============================================================================

DO $$
BEGIN
  -- Add series_id if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artpacks' AND column_name = 'series_id'
  ) THEN
    ALTER TABLE artpacks ADD COLUMN series_id uuid REFERENCES series(id) ON DELETE SET NULL;
  END IF;

  -- Add series_order if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artpacks' AND column_name = 'series_order'
  ) THEN
    ALTER TABLE artpacks ADD COLUMN series_order integer;
  END IF;

  -- Add motion_profile if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artpacks' AND column_name = 'motion_profile'
  ) THEN
    ALTER TABLE artpacks ADD COLUMN motion_profile text DEFAULT 'gentle';
  END IF;

  -- Add power_rating if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artpacks' AND column_name = 'power_rating'
  ) THEN
    ALTER TABLE artpacks ADD COLUMN power_rating integer DEFAULT 3 CHECK (power_rating >= 1 AND power_rating <= 5);
  END IF;

  -- Add aesthetic_coherence_score if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artpacks' AND column_name = 'aesthetic_coherence_score'
  ) THEN
    ALTER TABLE artpacks ADD COLUMN aesthetic_coherence_score float DEFAULT 1.0 CHECK (aesthetic_coherence_score >= 0.0 AND aesthetic_coherence_score <= 1.0);
  END IF;
END $$;

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_series_slug ON series(slug);
CREATE INDEX IF NOT EXISTS idx_series_status ON series(status);
CREATE INDEX IF NOT EXISTS idx_series_featured ON series(featured);
CREATE INDEX IF NOT EXISTS idx_series_wave ON series(release_wave);
CREATE INDEX IF NOT EXISTS idx_artpacks_series ON artpacks(series_id);
CREATE INDEX IF NOT EXISTS idx_artpacks_series_order ON artpacks(series_id, series_order);
CREATE INDEX IF NOT EXISTS idx_progression_series ON series_progression_logic(series_id);
CREATE INDEX IF NOT EXISTS idx_progression_ordering ON series_progression_logic(series_id, ordering);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE series_progression_logic ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES FOR SERIES
-- ============================================================================

CREATE POLICY "Anyone can view published series"
  ON series FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authors can view their own series"
  ON series FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Authenticated users can create series"
  ON series FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own series"
  ON series FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own series"
  ON series FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- ============================================================================
-- RLS POLICIES FOR SERIES PROGRESSION LOGIC
-- ============================================================================

CREATE POLICY "Anyone can view progression logic for published series"
  ON series_progression_logic FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM series
      WHERE series.id = series_progression_logic.series_id
      AND series.status = 'published'
    )
  );

CREATE POLICY "Series authors can manage progression logic"
  ON series_progression_logic FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM series
      WHERE series.id = series_progression_logic.series_id
      AND series.author_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM series
      WHERE series.id = series_progression_logic.series_id
      AND series.author_id = auth.uid()
    )
  );

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_series_updated_at'
  ) THEN
    CREATE TRIGGER update_series_updated_at
      BEFORE UPDATE ON series
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================================================
-- FUNCTION TO AUTO-UPDATE SERIES TOTAL_PACKS COUNT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_series_pack_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.series_id IS NOT NULL THEN
      UPDATE series
      SET total_packs = (
        SELECT COUNT(*) FROM artpacks WHERE series_id = NEW.series_id
      )
      WHERE id = NEW.series_id;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF OLD.series_id IS NOT NULL THEN
      UPDATE series
      SET total_packs = (
        SELECT COUNT(*) FROM artpacks WHERE series_id = OLD.series_id
      )
      WHERE id = OLD.series_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER TO AUTO-UPDATE TOTAL_PACKS
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_series_pack_count_trigger'
  ) THEN
    CREATE TRIGGER update_series_pack_count_trigger
      AFTER INSERT OR UPDATE OR DELETE ON artpacks
      FOR EACH ROW
      EXECUTE FUNCTION update_series_pack_count();
  END IF;
END $$;
