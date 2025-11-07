/*
  # Collective Sessions and Participant Tracking

  1. New Tables
    - `collective_sessions`
      - `id` (uuid, primary key) - Unique session identifier
      - `title` (text) - Session name/description
      - `created_at` (timestamptz) - Session creation time
      - `created_by` (text) - Creator identifier
      - `mode` (text) - individual, small_group, large_group, massive
      - `is_live` (boolean) - Whether session is currently active
      - `pack_id` (text) - Active art pack for this session
      - `region_seed` (text) - Regional context if applicable

    - `session_participants`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key) - Links to collective_sessions
      - `participant_id` (text) - Unique participant identifier
      - `name` (text) - Participant name
      - `initials` (text) - Participant initials for glyph generation
      - `role` (text) - viewer, contributor, co-creator
      - `personal_coherence` (numeric) - Individual coherence score 0-1
      - `capture_url` (text) - URL to participant's captured portrait
      - `joined_at` (timestamptz) - When participant joined
      - `updated_at` (timestamptz) - Last update time

  2. Security
    - Enable RLS on both tables
    - Public read access for live sessions
    - Authenticated write access for session creators
    - Participants can update their own records

  3. Indexes
    - Index on session_id for fast participant lookups
    - Index on is_live for active session queries
*/

CREATE TABLE IF NOT EXISTS collective_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by text NOT NULL,
  mode text DEFAULT 'individual',
  is_live boolean DEFAULT true,
  pack_id text,
  region_seed text
);

CREATE TABLE IF NOT EXISTS session_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES collective_sessions(id) ON DELETE CASCADE,
  participant_id text NOT NULL,
  name text,
  initials text,
  role text DEFAULT 'viewer',
  personal_coherence numeric DEFAULT 0.7,
  capture_url text,
  joined_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(session_id, participant_id)
);

CREATE INDEX IF NOT EXISTS idx_session_participants_session ON session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_collective_sessions_live ON collective_sessions(is_live);

ALTER TABLE collective_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view live sessions"
  ON collective_sessions FOR SELECT
  USING (is_live = true);

CREATE POLICY "Authenticated users can create sessions"
  ON collective_sessions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Session creators can update their sessions"
  ON collective_sessions FOR UPDATE
  TO authenticated
  USING (created_by = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Anyone can view participants in live sessions"
  ON session_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collective_sessions
      WHERE collective_sessions.id = session_participants.session_id
      AND collective_sessions.is_live = true
    )
  );

CREATE POLICY "Anyone can join a session"
  ON session_participants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collective_sessions
      WHERE collective_sessions.id = session_participants.session_id
      AND collective_sessions.is_live = true
    )
  );

CREATE POLICY "Participants can update their own records"
  ON session_participants FOR UPDATE
  USING (participant_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (participant_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE OR REPLACE FUNCTION update_session_mode()
RETURNS trigger AS $$
DECLARE
  participant_count integer;
  new_mode text;
BEGIN
  SELECT COUNT(*) INTO participant_count
  FROM session_participants
  WHERE session_id = NEW.session_id;

  IF participant_count = 1 THEN
    new_mode := 'individual';
  ELSIF participant_count <= 50 THEN
    new_mode := 'small_group';
  ELSIF participant_count <= 1000 THEN
    new_mode := 'large_group';
  ELSE
    new_mode := 'massive';
  END IF;

  UPDATE collective_sessions
  SET mode = new_mode
  WHERE id = NEW.session_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_mode
  AFTER INSERT OR DELETE ON session_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_session_mode();
