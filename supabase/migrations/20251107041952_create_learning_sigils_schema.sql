/*
  # Learning Sigils & Integration Journal Schema

  ## Overview
  Captures balanced consciousness states as "sigils" - geometric snapshots with teachings.
  Users collect personal archetypes and journal integration insights.

  ## New Tables

  ### 1. learning_sigils
  Captures frozen geometry states representing integrated consciousness
  - `id` (uuid, primary key)
  - `user_id` (uuid) - Owner of sigil
  - `session_id` (uuid) - Session where achieved
  - `created_at` (timestamptz) - When sigil captured
  - `archetype_name` (text) - Still Point, Harmonic Union, etc.
  - `geometry_type` (text) - circle, flower, platonic, etc.
  - `image_url` (text) - Rendered sigil image
  - `svg_data` (text) - Vector format for re-rendering
  
  **Metrics at capture:**
  - `coherence` (float) - Coherence level (0-1)
  - `complexity` (float) - Complexity level (0-1)
  - `polarity` (float) - Polarity balance (0-1)
  - `uncertainty` (float) - Uncertainty at time (0-1)
  - `residual` (float) - Residual tension (0-1)
  
  **Superformula parameters:**
  - `symmetry_m` (int) - Petal/lobe count
  - `n1` (float) - Spikiness
  - `n2` (float) - Roundness 1
  - `n3` (float) - Roundness 2
  - `lift` (float) - 3D elevation
  
  **Meta:**
  - `dominant_frequency` (float) - Hz at capture
  - `teaching_text` (text) - Associated wisdom
  - `color_palette` (jsonb) - Colors used
  - `revisit_count` (int) - Times user returned to this
  - `last_revisited` (timestamptz) - Last viewing

  ### 2. integration_journal
  User reflections on their shifts and learnings
  - `id` (uuid, primary key)
  - `user_id` (uuid) - Journal owner
  - `sigil_id` (uuid, nullable) - Associated sigil if any
  - `session_id` (uuid) - Session context
  - `created_at` (timestamptz) - Entry timestamp
  - `reflection_text` (text) - What shifted?
  - `tags` (text[]) - User-defined tags
  - `before_metrics` (jsonb) - Metrics before shift
  - `after_metrics` (jsonb) - Metrics after shift

  ### 3. revelation_phases
  Tracks user progression through teaching phases
  - `id` (uuid, primary key)
  - `session_id` (uuid) - Session reference
  - `user_id` (uuid) - User reference
  - `phase_name` (text) - recognition, reflection, integration, revelation, seal
  - `entered_at` (timestamptz) - When phase began
  - `duration_sec` (float) - Time in phase
  - `trigger_metric` (text) - What triggered transition
  - `trigger_value` (float) - Metric value at trigger
  - `teaching_shown` (text) - Caption displayed
  - `created_at` (timestamptz)

  ### 4. archetype_instances
  Links users to archetypal patterns they've manifested
  - `id` (uuid, primary key)
  - `user_id` (uuid) - User who manifested
  - `archetype_id` (text) - still_point, harmonic_union, etc.
  - `sigil_id` (uuid) - Sigil capturing this instance
  - `occurrence_count` (int) - How many times manifested
  - `first_seen` (timestamptz) - Initial manifestation
  - `last_seen` (timestamptz) - Most recent
  - `avg_coherence` (float) - Average coherence when manifesting
  - `avg_duration_sec` (float) - Average time in state

  ### 5. collective_archetypes
  Group-level archetypal states
  - `id` (uuid, primary key)
  - `session_id` (uuid) - Collective session
  - `archetype_id` (text) - Archetype identifier
  - `participant_count` (int) - How many in field
  - `manifested_at` (timestamptz) - When achieved
  - `duration_sec` (float) - How long sustained
  - `teaching_shown` (text) - Group teaching
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can read/write their own sigils and journal
  - Public read on collective archetypes (transparency)
  - Revelation phases tied to session participants

  ## Indexes
  - User lookups for personal collections
  - Archetype clustering
  - Temporal queries
*/

-- learning_sigils table
CREATE TABLE IF NOT EXISTS learning_sigils (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  archetype_name text NOT NULL,
  geometry_type text NOT NULL,
  image_url text,
  svg_data text,
  
  coherence float NOT NULL,
  complexity float NOT NULL,
  polarity float NOT NULL,
  uncertainty float NOT NULL,
  residual float NOT NULL,
  
  symmetry_m int NOT NULL,
  n1 float NOT NULL,
  n2 float NOT NULL,
  n3 float NOT NULL,
  lift float NOT NULL,
  
  dominant_frequency float DEFAULT 432.0,
  teaching_text text,
  color_palette jsonb DEFAULT '{}'::jsonb,
  
  revisit_count int DEFAULT 0,
  last_revisited timestamptz
);

-- integration_journal table
CREATE TABLE IF NOT EXISTS integration_journal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  sigil_id uuid,
  session_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  reflection_text text NOT NULL,
  tags text[] DEFAULT ARRAY[]::text[],
  
  before_metrics jsonb DEFAULT '{}'::jsonb,
  after_metrics jsonb DEFAULT '{}'::jsonb
);

-- revelation_phases table
CREATE TABLE IF NOT EXISTS revelation_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  user_id uuid NOT NULL,
  phase_name text NOT NULL,
  entered_at timestamptz NOT NULL,
  duration_sec float DEFAULT 0,
  trigger_metric text,
  trigger_value float,
  teaching_shown text,
  created_at timestamptz DEFAULT now()
);

-- archetype_instances table
CREATE TABLE IF NOT EXISTS archetype_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  archetype_id text NOT NULL,
  sigil_id uuid,
  occurrence_count int DEFAULT 1,
  first_seen timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now(),
  avg_coherence float DEFAULT 0.5,
  avg_duration_sec float DEFAULT 0
);

-- collective_archetypes table
CREATE TABLE IF NOT EXISTS collective_archetypes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  archetype_id text NOT NULL,
  participant_count int NOT NULL,
  manifested_at timestamptz DEFAULT now(),
  duration_sec float DEFAULT 0,
  teaching_shown text,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_learning_sigils_user ON learning_sigils(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_sigils_archetype ON learning_sigils(archetype_name);
CREATE INDEX IF NOT EXISTS idx_learning_sigils_created ON learning_sigils(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_integration_journal_user ON integration_journal(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_journal_sigil ON integration_journal(sigil_id);
CREATE INDEX IF NOT EXISTS idx_integration_journal_created ON integration_journal(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_revelation_phases_session ON revelation_phases(session_id);
CREATE INDEX IF NOT EXISTS idx_revelation_phases_user ON revelation_phases(user_id);
CREATE INDEX IF NOT EXISTS idx_revelation_phases_phase ON revelation_phases(phase_name);

CREATE INDEX IF NOT EXISTS idx_archetype_instances_user ON archetype_instances(user_id);
CREATE INDEX IF NOT EXISTS idx_archetype_instances_archetype ON archetype_instances(archetype_id);

CREATE INDEX IF NOT EXISTS idx_collective_archetypes_session ON collective_archetypes(session_id);
CREATE INDEX IF NOT EXISTS idx_collective_archetypes_archetype ON collective_archetypes(archetype_id);

-- Enable RLS
ALTER TABLE learning_sigils ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE revelation_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE archetype_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE collective_archetypes ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- learning_sigils: users own their sigils
CREATE POLICY "Users can view own sigils"
  ON learning_sigils FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sigils"
  ON learning_sigils FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sigils"
  ON learning_sigils FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- integration_journal: private by default
CREATE POLICY "Users can view own journal"
  ON integration_journal FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own journal entries"
  ON integration_journal FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- revelation_phases: session participants can view
CREATE POLICY "Users can view own phases"
  ON revelation_phases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can record own phases"
  ON revelation_phases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- archetype_instances: personal
CREATE POLICY "Users can view own archetypes"
  ON archetype_instances FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can record own archetypes"
  ON archetype_instances FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own archetypes"
  ON archetype_instances FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- collective_archetypes: public read for transparency
CREATE POLICY "Anyone can view collective archetypes"
  ON collective_archetypes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can record collective archetypes"
  ON collective_archetypes FOR INSERT
  TO authenticated
  WITH CHECK (true);
