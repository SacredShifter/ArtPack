/*
  # Mirror of the Unseen - Database Schema

  ## Overview
  Captures the invisible: residuals (predicted vs observed), uncertainties, phase errors,
  silence presence, and emergent collective potentials. No mind-reading, only gaps and gradients.

  ## New Tables

  ### 1. latent_observations
  Individual "unseen" metrics per participant
  - `id` (uuid, primary key)
  - `session_id` (uuid) - Reference to session
  - `user_id` (uuid) - Reference to participant
  - `ts` (timestamptz) - Observation timestamp
  - `phase_error_natal` (float) - Phase gap from natal chart (0-1)
  - `phase_error_transit` (float) - Phase gap from transits (0-1)
  - `phase_error_gaa` (float) - Phase gap from GAA clock (0-1)
  - `residual_magnitude` (float) - Predicted vs observed delta (0-1)
  - `uncertainty_score` (float) - Aggregate model uncertainty (0-1)
  - `silence_seconds` (int) - Seconds of intentional stillness
  - `entrainment_lock` (boolean) - Whether tempo locked to GAA
  - `entrainment_delta_pct` (float) - Tempo difference % (0-1)
  - `collective_potential_score` (float) - Individual contribution to emergence (0-1)
  - `created_at` (timestamptz)

  ### 2. collective_metrics
  Aggregate invisible field metrics
  - `id` (uuid, primary key)
  - `session_id` (uuid) - Reference to session
  - `ts` (timestamptz) - Metric timestamp
  - `element_ratio_fire` (float) - Fire element ratio (0-1)
  - `element_ratio_air` (float) - Air element ratio (0-1)
  - `element_ratio_earth` (float) - Earth element ratio (0-1)
  - `element_ratio_water` (float) - Water element ratio (0-1)
  - `graph_modularity_q` (float) - Network modularity (Louvain Q)
  - `synchrony_bursts_per_min` (float) - Phase lock bursts rate
  - `dominant_phase` (text) - Phase state enum
  - `element_entropy` (float) - Diversity of elements (0-1)
  - `avg_residual` (float) - Mean residual across participants
  - `avg_uncertainty` (float) - Mean uncertainty
  - `collective_coherence` (float) - Field-level coherence
  - `evolution_rate` (float) - Rate of form change
  - `created_at` (timestamptz)

  ### 3. evolution_states
  Tracks form evolution parameters over time
  - `id` (uuid, primary key)
  - `session_id` (uuid) - Reference to session
  - `user_id` (uuid, nullable) - User if individual, null if collective
  - `ts` (timestamptz) - State timestamp
  - `symmetry_m` (int) - Superformula symmetry count
  - `n1` (float) - Spikiness parameter
  - `n2` (float) - Lobe roundness 1
  - `n3` (float) - Lobe roundness 2
  - `lift_amount` (float) - 2D to 3D morph weight (0-1)
  - `merkaba_active` (boolean) - High coherence overlay
  - `vesica_strength` (float) - Pairwise resonance intensity (0-1)
  - `star_mix` (float) - Tension/unintegrated weight (0-1)
  - `haze_intensity` (float) - Uncertainty veil (0-1)
  - `form_type` (text) - Current form: circle, polygon, flower, star, platonic
  - `transition_progress` (float) - Morph completion (0-1)
  - `created_at` (timestamptz)

  ### 4. phase_transitions
  Records form evolution events
  - `id` (uuid, primary key)
  - `session_id` (uuid) - Reference to session
  - `user_id` (uuid, nullable) - User if individual
  - `ts` (timestamptz) - Transition timestamp
  - `from_form` (text) - Previous form type
  - `to_form` (text) - New form type
  - `trigger_metric` (text) - What caused transition
  - `threshold_value` (float) - Trigger value
  - `hold_duration_sec` (float) - How long held before transition
  - `created_at` (timestamptz)

  ## Security
  - All tables have RLS enabled
  - User-scoped read/write for personal observations
  - Public read for aggregate collective metrics (transparency)
  - Session participants can view session aggregates

  ## Indexes
  - Session and user lookups
  - Timestamp ordering
  - Form type filtering
*/

-- latent_observations table
CREATE TABLE IF NOT EXISTS latent_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  user_id uuid NOT NULL,
  ts timestamptz NOT NULL DEFAULT now(),
  
  phase_error_natal float NOT NULL DEFAULT 0,
  phase_error_transit float NOT NULL DEFAULT 0,
  phase_error_gaa float NOT NULL DEFAULT 0,
  
  residual_magnitude float NOT NULL DEFAULT 0,
  uncertainty_score float NOT NULL DEFAULT 0,
  
  silence_seconds int NOT NULL DEFAULT 0,
  entrainment_lock boolean NOT NULL DEFAULT false,
  entrainment_delta_pct float NOT NULL DEFAULT 0,
  
  collective_potential_score float NOT NULL DEFAULT 0.5,
  
  created_at timestamptz DEFAULT now()
);

-- collective_metrics table
CREATE TABLE IF NOT EXISTS collective_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  ts timestamptz NOT NULL DEFAULT now(),
  
  element_ratio_fire float NOT NULL DEFAULT 0.25,
  element_ratio_air float NOT NULL DEFAULT 0.25,
  element_ratio_earth float NOT NULL DEFAULT 0.25,
  element_ratio_water float NOT NULL DEFAULT 0.25,
  
  graph_modularity_q float NOT NULL DEFAULT 0,
  synchrony_bursts_per_min float NOT NULL DEFAULT 0,
  dominant_phase text DEFAULT 'distributed',
  
  element_entropy float NOT NULL DEFAULT 0.5,
  avg_residual float NOT NULL DEFAULT 0,
  avg_uncertainty float NOT NULL DEFAULT 0.5,
  collective_coherence float NOT NULL DEFAULT 0.5,
  evolution_rate float NOT NULL DEFAULT 0,
  
  created_at timestamptz DEFAULT now()
);

-- evolution_states table
CREATE TABLE IF NOT EXISTS evolution_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  user_id uuid,
  ts timestamptz NOT NULL DEFAULT now(),
  
  symmetry_m int NOT NULL DEFAULT 5,
  n1 float NOT NULL DEFAULT 2.0,
  n2 float NOT NULL DEFAULT 2.0,
  n3 float NOT NULL DEFAULT 2.0,
  
  lift_amount float NOT NULL DEFAULT 0,
  merkaba_active boolean NOT NULL DEFAULT false,
  vesica_strength float NOT NULL DEFAULT 0,
  star_mix float NOT NULL DEFAULT 0,
  haze_intensity float NOT NULL DEFAULT 0,
  
  form_type text NOT NULL DEFAULT 'circle',
  transition_progress float NOT NULL DEFAULT 1.0,
  
  created_at timestamptz DEFAULT now()
);

-- phase_transitions table
CREATE TABLE IF NOT EXISTS phase_transitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  user_id uuid,
  ts timestamptz NOT NULL DEFAULT now(),
  
  from_form text NOT NULL,
  to_form text NOT NULL,
  trigger_metric text NOT NULL,
  threshold_value float NOT NULL,
  hold_duration_sec float NOT NULL DEFAULT 5.0,
  
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_latent_observations_session ON latent_observations(session_id);
CREATE INDEX IF NOT EXISTS idx_latent_observations_user ON latent_observations(user_id);
CREATE INDEX IF NOT EXISTS idx_latent_observations_ts ON latent_observations(ts DESC);

CREATE INDEX IF NOT EXISTS idx_collective_metrics_session ON collective_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_collective_metrics_ts ON collective_metrics(ts DESC);

CREATE INDEX IF NOT EXISTS idx_evolution_states_session ON evolution_states(session_id);
CREATE INDEX IF NOT EXISTS idx_evolution_states_user ON evolution_states(user_id);
CREATE INDEX IF NOT EXISTS idx_evolution_states_form ON evolution_states(form_type);
CREATE INDEX IF NOT EXISTS idx_evolution_states_ts ON evolution_states(ts DESC);

CREATE INDEX IF NOT EXISTS idx_phase_transitions_session ON phase_transitions(session_id);
CREATE INDEX IF NOT EXISTS idx_phase_transitions_user ON phase_transitions(user_id);
CREATE INDEX IF NOT EXISTS idx_phase_transitions_ts ON phase_transitions(ts DESC);

-- Enable RLS
ALTER TABLE latent_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE collective_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE evolution_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase_transitions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- latent_observations: users see their own + session aggregates
CREATE POLICY "Users can view own latent observations"
  ON latent_observations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own latent observations"
  ON latent_observations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- collective_metrics: public read for transparency
CREATE POLICY "Anyone can view collective metrics"
  ON collective_metrics FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert collective metrics"
  ON collective_metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- evolution_states: users see their own + collective (null user_id)
CREATE POLICY "Users can view own evolution states"
  ON evolution_states FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own evolution states"
  ON evolution_states FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- phase_transitions: public read
CREATE POLICY "Anyone can view phase transitions"
  ON phase_transitions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can record transitions"
  ON phase_transitions FOR INSERT
  TO authenticated
  WITH CHECK (true);
