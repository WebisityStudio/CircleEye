# Security Fix Plan: CO-SEC-003 (Exposed Keys / Client Secrets)

**Scope:** Client-exposed keys in `.env`, `google-services.json`, and public client configs.  
**Goal:** Reduce abuse risk via key rotation, provider restrictions, and repo hygiene.

---

## 1) What Is and Isn’t a Secret

- **Supabase anon key** is *public by design* but must be protected by RLS.
- **Google Maps API key** and **Firebase API key** are *not secrets*, but must be **usage‑restricted**.
- Any **service_role** or backend secrets must never appear in client configs.

---

## 2) Fix Strategy (Operational + Repo Hygiene)

### Phase A — Operational actions (required)
1. **Rotate exposed keys**
   - Supabase anon key (optional but recommended after exposure).
   - Google Maps API key (required if shared publicly).
   - Firebase API key (rotate if it was shared outside trusted channels).
2. **Restrict provider keys**
   - Google Maps: restrict by HTTP referrers (web) and/or Android package + SHA.
   - Firebase/Google services: restrict to your Android package name (and iOS bundle id if applicable).
3. **Confirm RLS is enforced**
   - Ensures anon key can’t read/write unauthorized data.

### Phase B — Repo hygiene (safe to apply now)
4. **Keep secrets out of VCS**
   - `.env` already ignored; also ignore `.env.*` variants.
   - Keep `.env.example` as the only tracked env template.
5. **Add a secret scanning step** (optional)
   - CI or pre‑commit scan for accidental key commits.

---

## 3) Verification Checklist

- Supabase dashboard shows **new anon key** (if rotated).
- Google Cloud Console shows **API restrictions** applied.
- Firebase API key restricted by package/bundle id.
- `git status` does not show `.env` or `.env.*` files staged.
- `rg -n "VITE_SUPABASE_ANON_KEY|VITE_GOOGLE_MAPS_API_KEY" .` only matches `.env.example` (no real keys).

---

## 4) Rollback Plan

If rotation breaks production:
1. Re‑enable previous key in provider console (if allowed).
2. Update environment vars to known good keys.
3. Re‑deploy clients.

---

## 5) Owner / Timeline (Fill In)

- Owner: ______________________
- Rotate keys by: ______________
- Restrictions applied by: ______
- Verification sign‑off: ________

