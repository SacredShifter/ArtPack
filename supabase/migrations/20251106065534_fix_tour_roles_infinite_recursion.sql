/*
  # Fix infinite recursion in tour_roles policies

  1. Problem
    - The tour_roles_admin_all policy queries tour_roles table while checking access to tour_roles
    - This creates infinite recursion when RLS is enabled
  
  2. Solution
    - Drop the problematic recursive policy
    - Replace with simpler policies that don't query the same table
    - Keep the self-select policy for users to see their own roles
*/

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "tour_roles_admin_all" ON tour_roles;

-- Allow users to view their own roles (already exists, but ensure it's there)
DROP POLICY IF EXISTS "tour_roles_self_select" ON tour_roles;
CREATE POLICY "tour_roles_self_select"
  ON tour_roles FOR SELECT
  TO public
  USING (user_id = auth.uid());

-- For now, disable other operations on tour_roles to avoid recursion
-- Admins can manage this via direct database access or service role
