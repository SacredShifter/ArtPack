/*
  # Create session snapshots table

  1. New Tables
    - `session_snapshots`
      - `id` (uuid, primary key) - Unique identifier for the snapshot
      - `image_url` (text) - URL to the snapshot image in storage
      - `mode` (text) - Visualization mode (individual, small_group, large_group, massive)
      - `participant_count` (integer) - Number of participants in the snapshot
      - `fps` (integer, nullable) - FPS at time of capture
      - `created_at` (timestamptz) - When the snapshot was taken
      - `session_id` (uuid, nullable) - Optional reference to a collective session

  2. Security
    - Enable RLS on `session_snapshots` table
    - Allow public read access to view snapshots
    - Allow anyone to create snapshots (for demo purposes)

  3. Indexes
    - Index on created_at for chronological queries
    - Index on mode for filtering by visualization type
*/

CREATE TABLE IF NOT EXISTS session_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  mode text NOT NULL,
  participant_count integer NOT NULL DEFAULT 1,
  fps integer,
  session_id uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE session_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view snapshots"
  ON session_snapshots FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create snapshots"
  ON session_snapshots FOR INSERT
  TO public
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_snapshots_created_at ON session_snapshots(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_snapshots_mode ON session_snapshots(mode);
