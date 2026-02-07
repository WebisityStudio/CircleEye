# Security Fix Plan: CO-SEC-002 (External Proxy / SSRF)

**Scope:** External proxy usage in mobile/web clients and Supabase Edge Function `external-proxy`.  
**Goal:** Prevent SSRF/open proxy abuse by allowlisting destinations and enforcing auth.

---

## 1) Decisions Required

- Confirm the **only** proxy destinations needed (expected: Google Maps Geocoding + Places).
- Confirm whether the proxy should be **web-only** (recommended) or also used by native.

---

## 2) Fix Strategy (Phased)

### Phase A - Server-side (required)
1. **Edge Function allowlist**
   - Allow only known `https://` endpoints.
   - Deny private, loopback, and link-local IP ranges.
2. **Authentication**
   - Require JWT (`verify_jwt = true`) and reject unauthenticated calls.
3. **Rate limiting / abuse controls**
   - Add basic per-user/IP rate limiting (if supported by your edge layer).

### Phase B - Client-side (defense in depth)
4. **Allowlist in client proxy helper**
   - Only route proxy requests for known endpoints.
   - Use proxy **only on web** (native apps can call APIs directly).

---

## 3) Edge Function Example (reference)

```ts
// supabase/functions/external-proxy/index.ts
const ALLOWED = [
  'https://maps.googleapis.com/maps/api/geocode/json',
  'https://maps.googleapis.com/maps/api/place',
];

function isAllowed(url: string): boolean {
  return ALLOWED.some((allowed) => url.startsWith(allowed));
}

function isPrivateHost(hostname: string): boolean {
  // Block localhost and common private ranges; expand as needed
  if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
  return (
    hostname.startsWith('10.') ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('172.16.') ||
    hostname.startsWith('172.17.') ||
    hostname.startsWith('172.18.') ||
    hostname.startsWith('172.19.') ||
    hostname.startsWith('172.2') || // covers 172.20-172.29
    hostname.startsWith('172.30.') ||
    hostname.startsWith('172.31.')
  );
}

Deno.serve(async (req) => {
  const target = new URL(req.url).searchParams.get('url');
  if (!target) return new Response('Missing url', { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return new Response('Invalid url', { status: 400 });
  }

  if (parsed.protocol !== 'https:') {
    return new Response('Blocked protocol', { status: 400 });
  }

  if (isPrivateHost(parsed.hostname)) {
    return new Response('Blocked host', { status: 403 });
  }

  if (!isAllowed(parsed.origin + parsed.pathname)) {
    return new Response('Blocked target', { status: 403 });
  }

  const res = await fetch(parsed.toString(), {
    method: req.method,
    headers: { 'Accept': 'application/json' },
  });

  return new Response(res.body, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('content-type') ?? 'application/json' },
  });
});
```

---

## 4) Verification Checklist

- Proxy denies `http://` (non-https) targets.
- Proxy denies `localhost`, `127.0.0.1`, `10.*`, `172.16-31.*`, `192.168.*`.
- Proxy allows only the exact allowlisted endpoints.
- Client proxy helper refuses non-allowlisted URLs and falls back to direct fetch.

---

## 5) Rollback Plan

- Revert the edge function to the previous version.
- Remove client allowlist gating if it blocks a required endpoint.

