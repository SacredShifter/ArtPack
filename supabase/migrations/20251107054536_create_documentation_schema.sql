/*
  # Create Documentation Schema

  1. New Tables
    - `documentation`
      - `id` (uuid, primary key)
      - `slug` (text, unique) - URL-friendly identifier (e.g., 'user-guide')
      - `title` (text) - Display title
      - `description` (text) - Brief description
      - `category` (text) - Category for grouping (e.g., 'guide', 'reference', 'science')
      - `icon` (text) - Icon identifier
      - `color_gradient` (text) - Tailwind gradient classes
      - `page_count` (text) - Display text like "27 pages"
      - `content` (text) - Full markdown content
      - `order` (integer) - Display order
      - `is_published` (boolean) - Visibility flag
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Public read access for published docs
    - Admin write access only
*/

CREATE TABLE IF NOT EXISTS documentation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'guide',
  icon text NOT NULL DEFAULT 'book',
  color_gradient text NOT NULL DEFAULT 'from-cyan-500 to-blue-500',
  page_count text,
  content text NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE documentation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published documentation"
  ON documentation
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Authenticated users can insert documentation"
  ON documentation
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update documentation"
  ON documentation
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_documentation_slug ON documentation(slug);
CREATE INDEX IF NOT EXISTS idx_documentation_category ON documentation(category);
CREATE INDEX IF NOT EXISTS idx_documentation_order ON documentation("order");
