const ALLOWED_PREFIXES = [
  'https://maps.googleapis.com/maps/api/geocode/json',
  'https://maps.googleapis.com/maps/api/place',
];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

function isAllowedTarget(target: URL): boolean {
  const normalized = `${target.origin}${target.pathname}`;
  return ALLOWED_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function isIPv4(hostname: string): boolean {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return false;
  return hostname.split('.').every((part) => {
    const num = Number(part);
    return num >= 0 && num <= 255;
  });
}

function isPrivateIPv4(hostname: string): boolean {
  const [a, b] = hostname.split('.').map(Number);
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  return false;
}

function isPrivateIPv6(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (lower === '::1') return true;
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // ULA
  if (lower.startsWith('fe80')) return true; // link-local
  return false;
}

function isBlockedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (lower === 'localhost' || lower.endsWith('.local')) return true;
  if (lower === 'metadata.google.internal' || lower === 'metadata') return true;
  if (isIPv4(lower)) return isPrivateIPv4(lower);
  if (lower.includes(':')) return isPrivateIPv6(lower);
  return false;
}

function response(message: string, status: number): Response {
  return new Response(message, { status, headers: CORS_HEADERS });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'GET') {
    return response('Method not allowed', 405);
  }

  const url = new URL(req.url);
  const targetParam = url.searchParams.get('url');
  if (!targetParam) {
    return response('Missing url parameter', 400);
  }

  let target: URL;
  try {
    target = new URL(targetParam);
  } catch {
    return response('Invalid url parameter', 400);
  }

  if (target.protocol !== 'https:') {
    return response('Blocked protocol', 400);
  }

  if (isBlockedHost(target.hostname)) {
    return response('Blocked host', 403);
  }

  if (!isAllowedTarget(target)) {
    return response('Blocked target', 403);
  }

  const upstream = await fetch(target.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  const headers = new Headers(CORS_HEADERS);
  const contentType = upstream.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);

  return new Response(upstream.body, { status: upstream.status, headers });
});
