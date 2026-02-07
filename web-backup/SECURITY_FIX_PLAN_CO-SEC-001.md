# Security Fix Plan: CO-SEC-001 (Supabase RLS)

**Scope:** Supabase RLS policies and related auth enforcement for `notifications`, `weather_alerts`, and `crime_alerts`, plus function `search_path` hardening and privilege review.  
**Goal:** Eliminate IDOR/broken access control paths and reduce abuse risk while preserving intended product behavior.

---

## 1) Preconditions / Decisions Required

Before applying any SQL, confirm the intended business rules:
- **Notifications:** Should *only* the system/service role create them, or can users create their own?
- **Weather alerts:** API-only (no admin or client writes).
- **Crime alerts:** Community reporting vs admin/system-only?
- **Admin model:** Which table/field determines admin status (`user_profiles.user_role` is assumed)?

Record these decisions in the change log before proceeding.

---

## 2) Fix Strategy (Phased)

### Phase A — Critical policy fixes (block unsafe writes)
1. **Notifications INSERT**
   - Drop permissive policy (`CHECK true`) and replace with:
     - `WITH CHECK (false)` for `public` if system-only.
     - or `WITH CHECK (auth.uid() = user_id)` if user-generated.
2. **Weather alerts UPDATE**
   - Block all direct client updates; allow only API/service_role.

### Phase B — High-risk policy tightening
3. **Weather alerts INSERT**
   - Block all direct client inserts; allow only API/service_role.
4. **Crime alerts INSERT**
   - Require `created_by = auth.uid()` if community reporting.
   - Consider rate limiting or insert via edge function for moderation.

### Phase C — Function hardening and privilege review
5. **Function search_path**
   - Set explicit `search_path` for:
     - `public.increment_incident_like_count`
     - `public.enforce_device_limit`
6. **Table grants**
   - Review `anon`/`authenticated` grants and revoke `TRIGGER`/`TRUNCATE` unless explicitly required.
   - Keep RLS enabled and validated.

### Phase D — Client guardrails (defense in depth)
7. **Remove/guard system-only client functions**
   - Remove or gate usage of:
     - `createNotification`, `createWeatherAlert`, `updateWeatherAlert`
   - If needed, route through edge functions with auth checks.

---

## 3) Implementation Steps

1. **Create a migration SQL script** (e.g., `fix_rls_vulnerabilities.sql`) with:
   - `DROP POLICY ...`
   - `CREATE POLICY ...`
   - `ALTER FUNCTION ... SET search_path = public, pg_catalog`
   - Optional `REVOKE` statements for excessive grants.
2. **Apply in staging** first.
3. **Run verification tests** (see Section 4).
4. **Apply in production** during a low-traffic window.
5. **Monitor** for policy denials and error spikes.

---

## 4) Verification Checklist

Run tests as:
- **anon** (no session)
- **authenticated user A**
- **authenticated user B**
- **admin** (if applicable)

Tests:
- Notifications: A cannot insert notifications for B.
- Weather alerts: no client can insert or update (API/service_role only).
- Crime alerts: user can only insert with `created_by = auth.uid()` (if allowed).
- User-specific tables still enforce `auth.uid()` isolation.
- Function search_path is set (Supabase linter no longer flags).
- No unexpected 403s in normal flows.

---

## 5) Rollback Plan

If issues arise:
1. Re-apply prior policies from the audit export.
2. Restore previous grants if revoked.
3. Confirm critical flows are restored.
4. Open an incident log entry for further analysis.

---

## 6) Deliverables

- Updated RLS policies in Supabase.
- Hardened functions with explicit `search_path`.
- Updated client code paths (if system-only operations are removed from clients).
- Verification report with test evidence.

---

## 7) Owner / Timeline (Fill In)

- Owner: ______________________
- Staging window: ______________
- Production window: ___________
- Verification sign-off: _______
