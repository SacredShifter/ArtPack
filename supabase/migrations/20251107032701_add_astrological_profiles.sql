-- Add Astrological Profiles and Birth Data
-- 
-- 1. New table: astrological_profiles
-- 2. Extend session_participants with astrology fields
-- 3. RLS policies for privacy
-- 4. Indexes for performance

CREATE TABLE IF NOT EXISTS astrological_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id text UNIQUE NOT NULL,
  birth_date date NOT NULL,
  birth_time time,
  birth_location jsonb NOT NULL,
  
  sun_sign text,
  sun_degree numeric,
  moon_sign text,
  moon_degree numeric,
  rising_sign text,
  rising_degree numeric,
  
  natal_chart jsonb,
  element_balance jsonb,
  visual_signature jsonb,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'session_participants' AND column_name = 'has_astrology'
  ) THEN
    ALTER TABLE session_participants ADD COLUMN has_astrology boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'session_participants' AND column_name = 'astrological_profile_id'
  ) THEN
    ALTER TABLE session_participants ADD COLUMN astrological_profile_id uuid REFERENCES astrological_profiles(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_astrological_profiles_participant ON astrological_profiles(participant_id);
CREATE INDEX IF NOT EXISTS idx_astrological_profiles_sun_sign ON astrological_profiles(sun_sign);
CREATE INDEX IF NOT EXISTS idx_session_participants_astrology ON session_participants(has_astrology);

ALTER TABLE astrological_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own astrological profiles"
  ON astrological_profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view profiles of session participants"
  ON astrological_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM session_participants sp
      JOIN collective_sessions cs ON cs.id = sp.session_id
      WHERE sp.astrological_profile_id = astrological_profiles.id
      AND cs.is_live = true
    )
  );

CREATE POLICY "Users can update their own profiles"
  ON astrological_profiles FOR UPDATE
  USING (participant_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (participant_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE OR REPLACE FUNCTION update_astrological_profile_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_astrological_profile_timestamp
  BEFORE UPDATE ON astrological_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_astrological_profile_timestamp();
