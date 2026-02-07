-- ============================================================================
-- Security Fix Migration: CO-SEC-001
-- Date: 2025-12-30
-- Description: Fix RLS vulnerabilities, harden functions, and review privileges
-- ============================================================================

-- ============================================================================
-- PHASE A: CRITICAL POLICY FIXES
-- ============================================================================

-- 1. FIX NOTIFICATIONS TABLE
-- Issue: "System can insert notifications" policy has CHECK true (anyone can insert)
-- Fix: Only allow users to create notifications for themselves

DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;

CREATE POLICY "Users can insert own notifications"
  ON public.notifications
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

-- Alternative if system-only (uncomment if this is the requirement):
-- CREATE POLICY "Block direct notification inserts"
--   ON public.notifications
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (false);  -- Must use service_role or edge function


-- 2. FIX WEATHER_ALERTS UPDATE
-- Issue: "System can update weather alerts" has USING true (anyone can update)
-- Fix: Block all direct client updates. Updates must come from server/API only.

DROP POLICY IF EXISTS "System can update weather alerts" ON public.weather_alerts;
DROP POLICY IF EXISTS "Authenticated users can update weather alerts" ON public.weather_alerts;
DROP POLICY IF EXISTS "Block direct weather alert updates" ON public.weather_alerts;

CREATE POLICY "Block direct weather alert updates"
  ON public.weather_alerts
  FOR UPDATE
  TO public
  USING (false)
  WITH CHECK (false);  -- Must use service_role or edge function


-- ============================================================================
-- PHASE B: HIGH-RISK POLICY TIGHTENING
-- ============================================================================

-- 3. TIGHTEN WEATHER_ALERTS INSERT
-- Issue: Any authenticated user can create alerts
-- Fix: Block all direct client inserts. Inserts must come from server/API only.

DROP POLICY IF EXISTS "Authenticated users can create weather alerts" ON public.weather_alerts;
DROP POLICY IF EXISTS "Block direct weather alert inserts" ON public.weather_alerts;

CREATE POLICY "Block direct weather alert inserts"
  ON public.weather_alerts
  FOR INSERT
  TO public
  WITH CHECK (false);  -- Must use service_role or edge function


-- 4. TIGHTEN CRIME_ALERTS INSERT
-- Issue: Only checks auth.role(), doesn't enforce created_by = auth.uid()
-- Fix: Add created_by validation

DROP POLICY IF EXISTS "Authenticated users can create crime alerts" ON public.crime_alerts;

CREATE POLICY "Authenticated users can create crime alerts"
  ON public.crime_alerts
  FOR INSERT
  TO public
  WITH CHECK (
    auth.role() = 'authenticated'::text 
    AND auth.uid() = created_by
  );


-- ============================================================================
-- PHASE C: FUNCTION HARDENING
-- ============================================================================

-- 5. SET EXPLICIT SEARCH_PATH FOR SECURITY FUNCTIONS
-- Issue: Both functions have NULL proconfig (use default search_path)
-- Fix: Set explicit search_path to prevent search path attacks

ALTER FUNCTION public.increment_incident_like_count() 
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.enforce_device_limit(target_user_id uuid, max_sessions integer) 
  SET search_path = public, pg_catalog;


-- ============================================================================
-- PHASE D: PRIVILEGE REVIEW (Optional - uncomment if desired)
-- ============================================================================

-- 6. REVOKE EXCESSIVE PRIVILEGES FROM ANON AND AUTHENTICATED ROLES
-- Issue: Both anon and authenticated have TRIGGER and TRUNCATE privileges
-- Fix: Revoke dangerous privileges while keeping RLS protection

-- Uncomment the following to apply stricter privilege model:

/*
-- Revoke TRIGGER privilege (users shouldn't create triggers)
REVOKE TRIGGER ON public.crime_alerts FROM anon, authenticated;
REVOKE TRIGGER ON public.current_threat_status FROM anon, authenticated;
REVOKE TRIGGER ON public.incident_likes FROM anon, authenticated;
REVOKE TRIGGER ON public.incidents FROM anon, authenticated;
REVOKE TRIGGER ON public.notifications FROM anon, authenticated;
REVOKE TRIGGER ON public.threat_levels FROM anon, authenticated;
REVOKE TRIGGER ON public.user_locations FROM anon, authenticated;
REVOKE TRIGGER ON public.user_preferences FROM anon, authenticated;
REVOKE TRIGGER ON public.user_profiles FROM anon, authenticated;
REVOKE TRIGGER ON public.weather_alerts FROM anon, authenticated;

-- Revoke TRUNCATE privilege (users shouldn't truncate tables)
REVOKE TRUNCATE ON public.crime_alerts FROM anon, authenticated;
REVOKE TRUNCATE ON public.current_threat_status FROM anon, authenticated;
REVOKE TRUNCATE ON public.incident_likes FROM anon, authenticated;
REVOKE TRUNCATE ON public.incidents FROM anon, authenticated;
REVOKE TRUNCATE ON public.notifications FROM anon, authenticated;
REVOKE TRUNCATE ON public.threat_levels FROM anon, authenticated;
REVOKE TRUNCATE ON public.user_locations FROM anon, authenticated;
REVOKE TRUNCATE ON public.user_preferences FROM anon, authenticated;
REVOKE TRUNCATE ON public.user_profiles FROM anon, authenticated;
REVOKE TRUNCATE ON public.weather_alerts FROM anon, authenticated;

-- Revoke REFERENCES privilege (not typically needed by app users)
REVOKE REFERENCES ON public.crime_alerts FROM anon, authenticated;
REVOKE REFERENCES ON public.current_threat_status FROM anon, authenticated;
REVOKE REFERENCES ON public.incident_likes FROM anon, authenticated;
REVOKE REFERENCES ON public.incidents FROM anon, authenticated;
REVOKE REFERENCES ON public.notifications FROM anon, authenticated;
REVOKE REFERENCES ON public.threat_levels FROM anon, authenticated;
REVOKE REFERENCES ON public.user_locations FROM anon, authenticated;
REVOKE REFERENCES ON public.user_preferences FROM anon, authenticated;
REVOKE REFERENCES ON public.user_profiles FROM anon, authenticated;
REVOKE REFERENCES ON public.weather_alerts FROM anon, authenticated;
*/


-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these after migration to verify fixes:

-- 1. Check all policies are updated
-- SELECT schemaname, tablename, policyname, roles, cmd 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, policyname;

-- 2. Verify function search_path is set
-- SELECT n.nspname AS schema, p.proname AS function, p.proconfig
-- FROM pg_proc p
-- JOIN pg_namespace n ON n.oid = p.pronamespace
-- WHERE n.nspname = 'public'
--   AND p.proname IN ('increment_incident_like_count','enforce_device_limit');

-- 3. Check remaining privileges
-- SELECT table_name, grantee, privilege_type
-- FROM information_schema.table_privileges
-- WHERE table_schema = 'public' AND grantee IN ('anon', 'authenticated')
-- ORDER BY table_name, grantee, privilege_type;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

