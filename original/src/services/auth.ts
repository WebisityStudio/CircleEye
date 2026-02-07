import { supabase } from '../config/supabase';
import type { UserProfile } from '../types/user';

/**
 * Sign up with email and password
 */
export async function signUp(
  email: string,
  password: string,
  fullName: string
): Promise<UserProfile> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) throw error;
  if (!data.user) throw new Error('Signup failed');

  // Create user profile
  const profile = await ensureUserProfile(data.user.id, email, fullName);
  return profile;
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<UserProfile> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  if (!data.user) throw new Error('Sign in failed');

  const profile = await getUserProfile(data.user.id);
  return profile;
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get current session
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

/**
 * Get user profile from database
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Ensure user profile exists
 */
export async function ensureUserProfile(
  userId: string,
  email: string,
  fullName?: string
): Promise<UserProfile> {
  // Try to get existing profile
  const { data: existing } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (existing) return existing;

  // Create new profile
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      id: userId,
      email,
      full_name: fullName || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, 'full_name' | 'company_name' | 'phone'>>
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(
  callback: (event: string, session: unknown) => void
) {
  return supabase.auth.onAuthStateChange(callback);
}
