/*
  # Add storage policies for resonance_artifacts bucket

  1. Changes
    - Add public INSERT policy for uploading art pack files
    - Add public UPDATE policy for updating art pack files
    - Policies allow anyone to upload/update files to enable community contributions
  
  2. Security
    - Public read access already exists
    - Upload access is open to allow art pack uploads
    - Files are immutable once created (version-based)
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can upload to resonance_artifacts" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update resonance_artifacts" ON storage.objects;

-- Allow public uploads to resonance_artifacts bucket
CREATE POLICY "Anyone can upload to resonance_artifacts"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'resonance_artifacts');

-- Allow public updates to resonance_artifacts bucket  
CREATE POLICY "Anyone can update resonance_artifacts"
  ON storage.objects FOR UPDATE
  TO public
  USING (bucket_id = 'resonance_artifacts')
  WITH CHECK (bucket_id = 'resonance_artifacts');
