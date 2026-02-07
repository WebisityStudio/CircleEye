import type { AuthError, Session, User } from '@supabase/supabase-js';
import { supabase } from './client';

export type AuthResponse = { user: User | null; error: AuthError | null };

export async function ensureUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('user_profiles')
    .upsert({ id: user.id, email: user.email ?? '' }, { onConflict: 'id' });
}

async function enforceDeviceLimitNonFatal() {
  try {
    await supabase.functions.invoke('enforce-device-limit', { method: 'POST' });
  } catch {
    // non-fatal
  }
}

export async function signUpWithEmail(email: string, password: string): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (!error) {
    await ensureUserProfile();
    await enforceDeviceLimitNonFatal();
  }
  return { user: data.user ?? null, error };
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (!error) {
    await ensureUserProfile();
    await enforceDeviceLimitNonFatal();
  }
  return { user: data.user ?? null, error };
}

export async function signInWithGoogle(): Promise<{ error: AuthError | null }> {
  const redirectTo = `${window.location.origin}/auth/callback`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });
  return { error };
}

export async function sendEmailOtp(email: string): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });
  return { error };
}

export async function verifyEmailOtp(email: string, token: string): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (!error) {
    await ensureUserProfile();
    await enforceDeviceLimitNonFatal();
  }
  return { user: data.user ?? null, error };
}

export async function updatePassword(password: string): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.updateUser({ password });
  return { error };
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  // Clear crime data from localStorage
  try {
    localStorage.removeItem('crimeData_postcode');
    localStorage.removeItem('crimeData_crimeData');
    localStorage.removeItem('crimeData_emergencyServices');
  } catch (e) {
    console.error('Failed to clear localStorage:', e);
  }
  
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session ?? null, error };
}






















