import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { ensureUserProfile } from '../supabase/authService';
import { SEO } from '../components/SEO';

export function AuthCallback() {
  const nav = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        await ensureUserProfile();
        try {
          await supabase.functions.invoke('enforce-device-limit', { method: 'POST' });
        } catch {
          // non-fatal
        }

        nav('/dashboard', { replace: true });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'OAuth callback failed';
        setError(message);
        nav('/login', { replace: true });
      }
    })();
  }, [nav]);

  if (error) return <div style={{ padding: 24 }}>Error: {error}</div>;
  return (
    <>
      <SEO title="Signing In" noindex />
      <div style={{ padding: 24 }}>Completing sign-in…</div>
    </>
  );
}






















