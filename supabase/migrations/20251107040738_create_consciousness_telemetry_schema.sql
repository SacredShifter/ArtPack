/*
  # Consciousness Telemetry System Schema

  ## Overview
  Comprehensive system for capturing, storing, and analyzing consciousness metrics
  from individual participants and collective fields in real-time.

  ## New Tables

  ### 1. consciousness_metrics
  Stores individual participant consciousness measurements at regular intervals
  - `id` (uuid, primary key) - Unique metric sample ID
  - `session_id` (uuid) - Reference to collective session
  - `participant_id` (uuid) - Reference to participant
  - `timestamp` (timestamptz) - When measurement was taken
  - `coherence_personal` (float) - Personal coherence level (0-1)
  - `coherence_group` (float) - Coherence with group (0-1)
  - `coherence_field` (float) - Coherence with field (0-1)
  - `coherence_stability` (float) - Stability of coherence (0-1)
  - `presence_quality` (float) - Quality of presence (0-1)
  - `presence_depth` (float) - Depth of presence (0-1)
  - `presence_continuity` (float) - Continuity (0-1)
  - `presence_witnessing` (float) - Witnessing awareness (0-1)
  - `resonance_harmonic` (float) - Harmonic alignment (0-1)
  - `resonance_gaa_sync` (float) - GAA synchronization (0-1)
  - `resonance_location` (float) - Location resonance (0-1)
  - `resonance_elemental` (float) - Elemental balance (0-1)
  - `attention_focus` (float) - Focus level (0-1)
  - `attention_dispersion` (float) - Dispersion (0-1)
  - `attention_shift_rate` (float) - Rate of shifts
  - `attention_centeredness` (float) - Centeredness (0-1)
  - `energetic_amplitude` (float) - Energy amplitude
  - `energetic_frequency` (float) - Energy frequency (Hz)
  - `energetic_phase` (float) - Phase position (0-1)
  - `energetic_waveform` (text) - Waveform type
  - `emotional_valence` (float) - Positive/negative (-1 to 1)
  - `emotional_arousal` (float) - Arousal level (0-1)
  - `emotional_dominance` (float) - Dominance (0-1)
  - `emotional_flow` (float) - Emotional flow (0-1)
  - `collective_influence` (float) - Influence on collective (0-1)
  - `collective_receptivity` (float) - Receptivity (0-1)
  - `collective_contribution` (float) - Contribution (0-1)
  - `collective_synergy` (float) - Synergy level (0-1)
  - `dimensional_depth` (float) - Dimensional depth (0-1)
  - `dimensional_expansion` (float) - Expansion (0-1)
  - `dimensional_integration` (float) - Integration (0-1)
  - `dimensional_transcendence` (float) - Transcendence (0-1)
  - `created_at` (timestamptz) - Record creation time

  ### 2. collective_consciousness_states
  Stores aggregate measurements of the collective field
  - `id` (uuid, primary key) - Unique state ID
  - `session_id` (uuid) - Reference to collective session
  - `timestamp` (timestamptz) - When state was captured
  - `participant_count` (integer) - Number of participants
  - `coherence_average` (float) - Average coherence
  - `coherence_variance` (float) - Coherence variance
  - `coherence_peak` (float) - Peak coherence
  - `coherence_momentum` (float) - Change momentum
  - `resonance_harmonic_center` (float) - Harmonic center
  - `resonance_spread` (float) - Resonance spread
  - `resonance_stability` (float) - Stability
  - `resonance_clarity` (float) - Clarity
  - `energy_total_amplitude` (float) - Total amplitude
  - `energy_dominant_frequency` (float) - Dominant frequency
  - `energy_phase_alignment` (float) - Phase alignment
  - `energy_wave_coherence` (float) - Wave coherence
  - `attention_collective_focus` (float) - Collective focus
  - `attention_distribution_pattern` (text) - Distribution type
  - `attention_center_x` (float) - Center of mass X
  - `attention_center_y` (float) - Center of mass Y
  - `attention_radius` (float) - Field radius
  - `emergent_synergy_score` (float) - Synergy score
  - `emergent_field_stability` (float) - Field stability
  - `emergent_evolution_rate` (float) - Evolution rate
  - `emergent_dimensional_expansion` (float) - Dimensional expansion
  - `astro_transit_intensity` (float) - Transit intensity
  - `astro_aspect_activation` (float) - Aspect activation
  - `astro_element_fire` (float) - Fire element %
  - `astro_element_earth` (float) - Earth element %
  - `astro_element_air` (float) - Air element %
  - `astro_element_water` (float) - Water element %
  - `created_at` (timestamptz) - Record creation time

  ### 3. consciousness_events
  Records significant events and state transitions
  - `id` (uuid, primary key) - Unique event ID
  - `session_id` (uuid) - Reference to collective session
  - `participant_id` (uuid, nullable) - Participant if applicable
  - `timestamp` (timestamptz) - When event occurred
  - `event_type` (text) - Type of consciousness event
  - `intensity` (float) - Event intensity (0-1)
  - `metadata` (jsonb) - Additional event data
  - `created_at` (timestamptz) - Record creation time

  ### 4. consciousness_patterns
  Detected patterns in consciousness data
  - `id` (uuid, primary key) - Unique pattern ID
  - `session_id` (uuid, nullable) - Session if session-specific
  - `name` (text) - Pattern name
  - `description` (text) - Pattern description
  - `signature` (float[]) - Pattern signature array
  - `confidence` (float) - Detection confidence (0-1)
  - `occurrences` (integer) - Number of occurrences
  - `last_seen` (timestamptz) - Last occurrence time
  - `created_at` (timestamptz) - Record creation time

  ### 5. telemetry_snapshots
  Links telemetry data to visual snapshots
  - `id` (uuid, primary key) - Unique snapshot ID
  - `session_id` (uuid) - Reference to collective session
  - `snapshot_image_id` (uuid) - Reference to session_snapshots
  - `timestamp` (timestamptz) - Snapshot time
  - `metrics_summary` (jsonb) - Summary of metrics
  - `events_summary` (jsonb) - Summary of events
  - `created_at` (timestamptz) - Record creation time

  ## Security
  - All tables have RLS enabled
  - Public read access for viewing telemetry (for transparency)
  - Authenticated users can write metrics
  - Session participants can write their own metrics

  ## Indexes
  - Indexes on session_id for fast session queries
  - Indexes on timestamp for temporal queries
  - Indexes on participant_id for individual tracking
  - Indexes on event_type for event filtering
*/

-- consciousness_metrics table
CREATE TABLE IF NOT EXISTS consciousness_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid,
  participant_id uuid,
  timestamp timestamptz NOT NULL,
  
  coherence_personal float DEFAULT 0.5,
  coherence_group float DEFAULT 0.5,
  coherence_field float DEFAULT 0.5,
  coherence_stability float DEFAULT 0.5,
  
  presence_quality float DEFAULT 0.5,
  presence_depth float DEFAULT 0.5,
  presence_continuity float DEFAULT 0.5,
  presence_witnessing float DEFAULT 0.5,
  
  resonance_harmonic float DEFAULT 0.5,
  resonance_gaa_sync float DEFAULT 0.5,
  resonance_location float DEFAULT 0.5,
  resonance_elemental float DEFAULT 0.5,
  
  attention_focus float DEFAULT 0.5,
  attention_dispersion float DEFAULT 0.5,
  attention_shift_rate float DEFAULT 0,
  attention_centeredness float DEFAULT 0.5,
  
  energetic_amplitude float DEFAULT 1.0,
  energetic_frequency float DEFAULT 432.0,
  energetic_phase float DEFAULT 0,
  energetic_waveform text DEFAULT 'sine',
  
  emotional_valence float DEFAULT 0,
  emotional_arousal float DEFAULT 0.5,
  emotional_dominance float DEFAULT 0.5,
  emotional_flow float DEFAULT 0.5,
  
  collective_influence float DEFAULT 0.5,
  collective_receptivity float DEFAULT 0.5,
  collective_contribution float DEFAULT 0.5,
  collective_synergy float DEFAULT 0.5,
  
  dimensional_depth float DEFAULT 0.5,
  dimensional_expansion float DEFAULT 0.5,
  dimensional_integration float DEFAULT 0.5,
  dimensional_transcendence float DEFAULT 0.5,
  
  created_at timestamptz DEFAULT now()
);

-- collective_consciousness_states table
CREATE TABLE IF NOT EXISTS collective_consciousness_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid,
  timestamp timestamptz NOT NULL,
  participant_count integer DEFAULT 0,
  
  coherence_average float DEFAULT 0.5,
  coherence_variance float DEFAULT 0,
  coherence_peak float DEFAULT 0.5,
  coherence_momentum float DEFAULT 0,
  
  resonance_harmonic_center float DEFAULT 1.0,
  resonance_spread float DEFAULT 0,
  resonance_stability float DEFAULT 0.5,
  resonance_clarity float DEFAULT 0.5,
  
  energy_total_amplitude float DEFAULT 0,
  energy_dominant_frequency float DEFAULT 432.0,
  energy_phase_alignment float DEFAULT 0.5,
  energy_wave_coherence float DEFAULT 0.5,
  
  attention_collective_focus float DEFAULT 0.5,
  attention_distribution_pattern text DEFAULT 'distributed',
  attention_center_x float DEFAULT 0,
  attention_center_y float DEFAULT 0,
  attention_radius float DEFAULT 0.5,
  
  emergent_synergy_score float DEFAULT 0.5,
  emergent_field_stability float DEFAULT 0.5,
  emergent_evolution_rate float DEFAULT 0,
  emergent_dimensional_expansion float DEFAULT 0.5,
  
  astro_transit_intensity float DEFAULT 0.5,
  astro_aspect_activation float DEFAULT 0.5,
  astro_element_fire float DEFAULT 0.25,
  astro_element_earth float DEFAULT 0.25,
  astro_element_air float DEFAULT 0.25,
  astro_element_water float DEFAULT 0.25,
  
  created_at timestamptz DEFAULT now()
);

-- consciousness_events table
CREATE TABLE IF NOT EXISTS consciousness_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid,
  participant_id uuid,
  timestamp timestamptz NOT NULL,
  event_type text NOT NULL,
  intensity float DEFAULT 0.5,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- consciousness_patterns table
CREATE TABLE IF NOT EXISTS consciousness_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid,
  name text NOT NULL,
  description text,
  signature float[] DEFAULT ARRAY[]::float[],
  confidence float DEFAULT 0.5,
  occurrences integer DEFAULT 1,
  last_seen timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- telemetry_snapshots table
CREATE TABLE IF NOT EXISTS telemetry_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid,
  snapshot_image_id uuid,
  timestamp timestamptz NOT NULL,
  metrics_summary jsonb DEFAULT '{}'::jsonb,
  events_summary jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_consciousness_metrics_session ON consciousness_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_consciousness_metrics_participant ON consciousness_metrics(participant_id);
CREATE INDEX IF NOT EXISTS idx_consciousness_metrics_timestamp ON consciousness_metrics(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_collective_states_session ON collective_consciousness_states(session_id);
CREATE INDEX IF NOT EXISTS idx_collective_states_timestamp ON collective_consciousness_states(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_consciousness_events_session ON consciousness_events(session_id);
CREATE INDEX IF NOT EXISTS idx_consciousness_events_type ON consciousness_events(event_type);
CREATE INDEX IF NOT EXISTS idx_consciousness_events_timestamp ON consciousness_events(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_consciousness_patterns_session ON consciousness_patterns(session_id);
CREATE INDEX IF NOT EXISTS idx_consciousness_patterns_name ON consciousness_patterns(name);

CREATE INDEX IF NOT EXISTS idx_telemetry_snapshots_session ON telemetry_snapshots(session_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_snapshots_timestamp ON telemetry_snapshots(timestamp DESC);

-- Enable RLS
ALTER TABLE consciousness_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE collective_consciousness_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE consciousness_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE consciousness_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read, authenticated write
CREATE POLICY "Anyone can view consciousness metrics"
  ON consciousness_metrics FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert metrics"
  ON consciousness_metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view collective states"
  ON collective_consciousness_states FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert collective states"
  ON collective_consciousness_states FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view consciousness events"
  ON consciousness_events FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert events"
  ON consciousness_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view consciousness patterns"
  ON consciousness_patterns FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert patterns"
  ON consciousness_patterns FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view telemetry snapshots"
  ON telemetry_snapshots FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create snapshots"
  ON telemetry_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (true);
