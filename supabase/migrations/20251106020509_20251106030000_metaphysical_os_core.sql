/*
  # Metaphysical OS Core Tables

  1. New Tables
    - akashic_events: System event log
    - resonance_moments: Peak state captures
    - collective_coherence_samples: Group coherence data
    - quantum_pairs: Entangled user sessions
    - journeys: Intention-driven sequences

  2. Security
    - RLS enabled with public access for demo
    - Production should restrict to authenticated users

  3. Indexes
    - Optimized for timestamp queries
    - GIN indexes for array/jsonb searches
*/

CREATE TABLE akashic_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  event_type text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  labels text[] DEFAULT '{}',
  payload jsonb DEFAULT '{}',
  source_module text NOT NULL,
  resonance_signature integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_akashic_user_time ON akashic_events(user_id, timestamp DESC);
CREATE INDEX idx_akashic_labels ON akashic_events USING gin(labels);
CREATE INDEX idx_akashic_type ON akashic_events(event_type);

ALTER TABLE akashic_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON akashic_events FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE resonance_moments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  coherence_score numeric(3,2) NOT NULL,
  screenshot text,
  artpack_id text NOT NULL,
  biometric_snapshot jsonb DEFAULT '{}',
  emotional_tag text,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_moments_user_time ON resonance_moments(user_id, timestamp DESC);
CREATE INDEX idx_moments_coherence ON resonance_moments(coherence_score DESC);
CREATE INDEX idx_moments_artpack ON resonance_moments(artpack_id);

ALTER TABLE resonance_moments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON resonance_moments FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE collective_coherence_samples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  group_coherence numeric(3,2) NOT NULL,
  participant_count integer NOT NULL,
  synchronization_index numeric(3,2),
  individual_coherences numeric(3,2)[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_coherence_session ON collective_coherence_samples(session_id, timestamp DESC);

ALTER TABLE collective_coherence_samples ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON collective_coherence_samples FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE quantum_pairs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid UNIQUE NOT NULL,
  user_id_1 text NOT NULL,
  user_id_2 text NOT NULL,
  sync_mode text NOT NULL,
  coherence_correlation numeric(3,2) DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_quantum_session ON quantum_pairs(session_id);

ALTER TABLE quantum_pairs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON quantum_pairs FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE journeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  intention text NOT NULL,
  telos text[] DEFAULT '{}',
  pack_sequence text[] DEFAULT '{}',
  current_index integer DEFAULT 0,
  peak_moments text[] DEFAULT '{}',
  adaptations jsonb DEFAULT '[]',
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_journeys_user ON journeys(user_id, started_at DESC);
CREATE INDEX idx_journeys_telos ON journeys USING gin(telos);

ALTER TABLE journeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON journeys FOR ALL USING (true) WITH CHECK (true);
