---
name: live-community-incidents-mvp
overview: Add a Phase 1 "What’s happening now" feature backed by Supabase for community-reported incidents across web (React) and mobile (Expo), with real-time updates and a 24-hour ephemeral lifecycle.
todos:
  - id: db-schema-incidents
    content: Add `incidents` and `incident_likes` tables, indexes, constraints, and RLS policies in Supabase, then regenerate/update web and mobile TypeScript DB types.
    status: pending
  - id: supabase-incidents-services
    content: Implement shared Supabase incident service modules for web (`src/supabase/incidents.ts`) and mobile (`ExpoApp/services/supabase/incidents.ts` or equivalent) including create, nearby query, like, and realtime subscribe helpers.
    status: pending
    dependencies:
      - db-schema-incidents
  - id: web-incidents-ui
    content: Integrate a "Reported incidents near you" card and reporting modal into the web dashboard (`Home` component and potentially a dedicated incidents page) wired to the incident services.
    status: pending
    dependencies:
      - supabase-incidents-services
  - id: mobile-incidents-ui
    content: Build the Expo `alerts` tab as the live incident feed plus a dedicated reporting screen, both using the shared incidents service and matching legal/safety wording.
    status: pending
    dependencies:
      - supabase-incidents-services
  - id: expiry-cron-job
    content: Create and schedule a Supabase Edge Function to archive expired incidents and ensure clients filter on `is_active` and `expires_at` for the live feed.
    status: pending
    dependencies:
      - db-schema-incidents
---

# Live Community Incidents – Phase 1 Plan

## 1. Database schema & lifecycle

- **New table `incidents` (public schema)**
- Columns (aligned with your spec):
    - `id uuid primary key default gen_random_uuid()`
    - `created_at timestamptz not null default now()`
    - `expires_at timestamptz not null default (now() + interval '24 hours')`
    - `lat double precision not null`
    - `lng double precision not null`
    - `geohash text not null` (computed client-side for now; optional later server-side function)
    - `category text not null` with a **CHECK** constraint to a small fixed set (e.g. `('suspicious_activity','disturbance','property_damage','noise','other')`) – no crime labels
    - `description text not null` with a **CHECK** on max length (e.g. 200 chars)
    - `created_by_user_id uuid not null` (FK to `auth.users`)
    - `like_count integer not null default 0`
    - `is_active boolean not null default true`
    - `archived_at timestamptz null`
- Indexes:
    - `idx_incidents_active_expires` on `(is_active, expires_at)`
    - `idx_incidents_geohash` on `(geohash)` for prefix lookups
    - `idx_incidents_created_at` on `(created_at desc)`
- **New table `incident_likes` (public schema)**
- Columns:
    - `id uuid primary key default gen_random_uuid()`
    - `incident_id uuid not null` (FK to `incidents.id` on delete cascade)
    - `user_id uuid not null` (FK to `auth.users`)
    - `created_at timestamptz not null default now()`
- Constraints & indexes:
    - Unique constraint `uniq_incident_likes_incident_user` on `(incident_id, user_id)` to prevent duplicate likes
    - Index on `(user_id)` for quick lookups
- **RLS & safety on `incidents` / `incident_likes`**
- Enable RLS and add simple, deterministic policies:
    - `incidents`:
    - `SELECT`: allow **authenticated** users to read only rows where `is_active = true AND archived_at IS NULL AND expires_at > now()`.
    - `INSERT`: allow authenticated users to insert rows with `created_by_user_id = auth.uid()`.
    - `UPDATE`: allow only the system (via service role / edge functions) to archive/expire rows; no user edits in Phase 1.
    - `incident_likes`:
    - `INSERT` and `SELECT`: allow authenticated users where `user_id = auth.uid()`.
- For internal analytics, access archived incidents using the **service_role** key (e.g. via server-side scripts or Edge Functions) so archived data never flows directly to client SDKs.
- **Type updates for existing codegen**
- Extend Supabase types used in both apps:
    - Web: update [`src/supabase/database.types.ts`](src/supabase/database.types.ts) to include `incidents` and `incident_likes` tables plus convenience aliases (e.g. `Incident`, `IncidentInsert`).
    - Mobile: update [`ExpoApp/services/supabase/types.ts`](ExpoApp/services/supabase/types.ts) similarly.

## 2. Expiry & archiving mechanism

- **Scheduled expiry job using Supabase Edge Function**
- Create a new Edge Function (e.g. `expire-incidents`) that:
    - Runs an `UPDATE incidents` query setting `is_active = false, archived_at = now()`
    - `WHERE is_active = true AND expires_at <= now()`.
    - Optionally logs how many rows were archived for monitoring.
- Register a Supabase cron schedule (e.g. every 5–10 minutes) to call this Edge Function so expiry is near-real-time but simple.
- **Front-end filtering to reinforce lifecycle rules**
- All client queries for the live feed additionally filter by `is_active = true` and `expires_at > now()` as a belt-and-braces check, so any slightly late cron runs don’t leak expired incidents into the UI.
- **Lifecycle summary (active vs archived)**
```mermaid
flowchart TD
  userReport[UserSubmitsIncident] --> insertRow[InsertRow_incidents]
  insertRow --> activeFeed[VisibleInLiveFeed]
  activeFeed --> cronCheck[CronExpireJob]
  cronCheck -->|expires_at <= now()| archive[Set_is_active_false_and_archived_at]
  archive --> archivedStore[ArchivedForAnalyticsOnly]
  activeFeed -->|expires_at > now()| continueVisible[RemainsVisibleUntil24h]
  like[UserLikesIncident] --> likeRow[InsertRow_incident_likes]
  likeRow --> bumpCount[Increment_like_count]
```




## 3. Supabase service layer & real-time subscriptions

- **Shared incident service for web (`src`)**
- Add [`src/supabase/incidents.ts`](src/supabase/incidents.ts) that wraps the Supabase client in strongly-typed helpers:
    - `createIncident({ lat, lng, category, description }: IncidentInsertInput)`
    - Sanitises input (see safety section), computes a **coarse geohash** or grid key on the client (e.g. precision 5–6), and inserts into `incidents`.
    - Relies on DB defaults for `created_at`, `expires_at`, `is_active`.
    - `getActiveIncidentsNearby({ lat, lng, radiusKm, category? })`
    - Approximates radius filter via bounding box: `lat BETWEEN latMin AND latMax` and `lng BETWEEN lngMin AND lngMax`, plus `is_active` and `expires_at > now()`.
    - Optionally also filters `geohash` by prefix if we choose geohash-based bucketing.
    - `likeIncident(incidentId)`
    - Inserts into `incident_likes` with `user_id = auth.uid()`, handling unique-violation errors gracefully (idempotent behaviour).
    - Also increments `like_count` on the corresponding `incidents` row using a single `UPDATE` (or via a Postgres trigger to keep server-side only).
    - `subscribeToIncidents(onInsert, onUpdate)`
    - Creates a Supabase Realtime channel on `public.incidents`:
        - `on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'incidents' }, handler)`
        - `on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'incidents' }, handler)`
    - In the handlers, apply the same proximity + active/expiry checks as in the initial query and update local state accordingly.
- **Parallel incident service for mobile (`ExpoApp`)**
- Mirror the web helpers in [`ExpoApp/services/supabase/db.ts`](ExpoApp/services/supabase/db.ts) or a new [`ExpoApp/services/supabase/incidents.ts`](ExpoApp/services/supabase/incidents.ts):
    - Reuse `supabase` from [`ExpoApp/services/supabase/config.ts`](ExpoApp/services/supabase/config.ts).
    - Provide the same core functions: `createIncident`, `getActiveIncidentsNearby`, `likeIncident`, `subscribeToIncidents`.
    - Use existing location utilities from your services (e.g. the ones used in `home.tsx`) to pass approximate lat/lng into the query.
- **Real-time behaviour**
- On initial load, fetch the current active incidents within the user’s area, then subscribe to Realtime changes to:
    - Prepend new incidents (INSERT) that match the current filters.
    - Update `like_count` and `is_active`/expiry locally when relevant UPDATE events arrive.
- Ensure we **never resurface** incidents whose `expires_at` is past or `is_active` is false, even if a like arrives late (the DB update will be blocked by the unique constraint anyway).

## 4. Web UI wiring (React SPA)

- **Placement in the dashboard**
- Extend [`src/components/Home.tsx`](src/components/Home.tsx) to include a new card component, e.g. `LiveIncidentsCard`, in the main dashboard grid alongside `CrimeDataCard` and `WeatherAlertsCard`.
- Optionally add a dedicated route (e.g. `/app/incidents`) wired via [`src/routes/AppRoutes.tsx`](src/routes/AppRoutes.tsx) to a `LiveIncidentsPage` for a larger map/list view, but keep Phase 1 minimal by starting with a compact card + modal.
- **New components**
- `LiveIncidentsCard` (e.g. [`src/components/LiveIncidentsCard.tsx`](src/components/LiveIncidentsCard.tsx)):
    - Shows:
    - A neutral title like **"Reported incidents near you (unverified)"**.
    - List of the most recent 3–5 incidents: each item shows category, short description, **time ago**, approximate area (e.g. rounded lat/lng or nearest locality/postcode), and like count.
    - A prominent disclaimer: **"Community-reported incidents only. These reports are unverified and not confirmed crimes."**
    - Includes a "View all" / "Report an incident" CTA that opens a modal.
- `ReportIncidentModal` (e.g. [`src/components/ReportIncidentModal.tsx`](src/components/ReportIncidentModal.tsx)):
    - Fields: `category` (dropdown from fixed enum), description (short textarea with counter), and location.
    - Location:
    - Prefer using the user’s current approximate location (via existing postcode / geocoding flows or browser geolocation if available), **rounded to a coarse grid** (e.g. 3 decimal places ≈ 100–150m) before storing.
    - Show only area names / partial postcode in the UI; no full street addresses.
    - Submit handler calls `createIncident` service and optimistically adds to the local list.
- **Like / engagement UI**
- Incident item component:
    - Like button with count (e.g. "Helpful" pill). On click, calls `likeIncident` and updates the local optimistic count, disabling on second click based on local `hasLiked` state.
    - No usernames or avatars are shown.
- Ensure wording avoids definitive crime language and avoids suggesting reports are validated.

## 5. Mobile UI wiring (Expo app)

- **Use existing tabs & routing**
- Reuse the existing but currently empty `alerts` tab at `[ExpoApp/app/appFlow/(userDrawer)/(userTabs)/alerts.tsx](ExpoApp/app/appFlow/\\(userDrawer)/(userTabs)/alerts.tsx)` as the primary "What’s happening now" screen.
- Keep the bottom tab structure in `[ExpoApp/app/appFlow/(userDrawer)/(userTabs)/_layout.tsx](ExpoApp/app/appFlow/\\(userDrawer)/(userTabs)/_layout.tsx) `and configure the `alerts` tab label copy to something like **"Now"** or **"Live"** once the UI is implemented.
- **New screen behaviour for `alerts.tsx`**
- Fetch user’s coarse location using existing services (e.g. the same flow as `[ExpoApp/app/appFlow/(userDrawer)/(userTabs)/home.tsx](ExpoApp/app/appFlow/\\(userDrawer)/(userTabs)/home.tsx)` that resolves a postcode / lat/lng).
- Call `getActiveIncidentsNearby` with this location and subscribe via `subscribeToIncidents`.
- Display a vertically scrolling list of incidents with:
    - Category badge, short description, time ago, approximate area label, like count, and a like button.
    - A clear, repeated disclaimer at the top: **"Community-reported incidents only. These reports are unverified and not confirmed crimes."**
- **Reporting flow on mobile**
- Add a FAB or header button on the `alerts` screen that navigates to a new reporting screen, e.g. [`ExpoApp/app/appFlow/hometab/reportIncident.tsx`](ExpoApp/app/appFlow/hometab/reportIncident.tsx) or a sibling under `(userTabs)`.
- The reporting screen mirrors the web modal:
    - Required category dropdown
    - Description input (character-limited, with sanitisation and inline warnings)
    - Location auto-filled from current approximate GPS (rounded) but visible as an area name/postcode only.
- On submit:
    - Call `createIncident` service.
    - Navigate back to `alerts` and optimistically insert the new incident at the top of the list.
- **Mobile realtime & behaviour parity**
- Maintain the same filters (`is_active`, `expires_at > now()`, proximity) so the feed matches web.
- Ensure likes are single-tap only; disable or visually mark an incident as liked after the first like based on `incident_likes` query or local state.

## 6. Safety, input sanitisation, and wording

- **Client-side sanitisation helper**
- Implement a shared utility (e.g. [`src/lib/incidentSanitizer.ts`](src/lib/incidentSanitizer.ts) and a mobile equivalent) that:
    - Trims whitespace and collapses multiple spaces.
    - Enforces a strict character limit (e.g. max 200 chars) and blocks submission if exceeded.
    - Strips email addresses, phone numbers, and URLs using regex to reduce PII.
    - Rejects descriptions containing obvious name-like patterns when combined with accusatory verbs (e.g. `"killed", "robbed", "attacked"`) as a conservative first pass, showing user-facing guidance instead.
- Validate again on the server-side path (e.g. optional Postgres trigger or plpgsql function called via RPC) to avoid storing unsanitised text; for Phase 1 keep server rules simple (length + basic PII strip).
- **Neutral, clear copy**
- Across both web and mobile:
    - Use terms: **"Reported incident"**, **"Community report"**, never "crime" or "offender" in this feature.
    - Prominently show a disclaimer banner near the feed and in the report form.
    - Avoid any suspect identification fields; no free-text titles that could encourage naming individuals.
- **Location privacy**
- Never display or store full street addresses for community incidents:
    - Only store lat/lng plus geohash; derive display strings from approximate area names / partial postcodes.
    - Round lat/lng client-side before sending, to avoid precise household-level coordinates.

## 7. Internal analytics & reporting

- **Internal-only access to archived data**
- For internal dashboards or analytics (future work), query `incidents` where `is_active = false AND archived_at IS NOT NULL` via service-role or backend-only contexts.
- No front-end (web or mobile) call paths will request archived incidents; all existing and new UI helpers only select active incidents.
- **Basic metrics (future-friendly)**
- Design the schema with these simple analytics in mind:
    - Aggregations by `category`, `geohash prefix`, and time window.