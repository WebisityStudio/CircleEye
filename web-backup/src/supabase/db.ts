import { supabase } from './client';
import type {
  CrimeAlert,
  CrimeAlertInsert,
  CrimeAlertUpdate,
  WeatherAlert,
  UserLocation,
  UserLocationInsert,
  UserLocationUpdate,
  Notification,
  NotificationInsert,
  NotificationUpdate,
  UserPreference,
  UserPreferenceInsert,
  UserPreferenceUpdate,
  UserProfile,
  UserProfileInsert,
  UserProfileUpdate,
} from './database.types';

async function requireUserId(): Promise<{ userId: string | null; error: Error | null }> {
  const { data, error } = await supabase.auth.getUser();
  if (error) return { userId: null, error };
  if (!data.user) return { userId: null, error: new Error('Not authenticated') };
  return { userId: data.user.id, error: null };
}

// ============================================================================
// CRIME ALERTS
// ============================================================================

export async function getCrimeAlerts(options?: {
  limit?: number;
  postcode?: string;
  isActive?: boolean;
}) {
  let query = supabase
    .from('crime_alerts')
    .select('*')
    .order('alert_date', { ascending: false });

  if (options?.postcode) {
    query = query.eq('postcode', options.postcode);
  }
  if (options?.isActive !== undefined) {
    query = query.eq('is_active', options.isActive);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  return { data: data as CrimeAlert[] | null, error };
}

export async function getCrimeAlertById(id: string) {
  const { data, error } = await supabase
    .from('crime_alerts')
    .select('*')
    .eq('id', id)
    .single();
  return { data: data as CrimeAlert | null, error };
}

export async function createCrimeAlert(alert: CrimeAlertInsert) {
  const { data, error } = await supabase
    .from('crime_alerts')
    .insert(alert)
    .select()
    .single();
  return { data: data as CrimeAlert | null, error };
}

export async function updateCrimeAlert(id: string, updates: CrimeAlertUpdate) {
  const { data, error } = await supabase
    .from('crime_alerts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data: data as CrimeAlert | null, error };
}

export async function deleteCrimeAlert(id: string) {
  const { error } = await supabase
    .from('crime_alerts')
    .delete()
    .eq('id', id);
  return { error };
}

// ============================================================================
// WEATHER ALERTS
// ============================================================================
// NOTE (CO-SEC-001): Weather alerts are API-only (no client INSERT/UPDATE/DELETE).

export async function getWeatherAlerts(options?: {
  limit?: number;
  postcode?: string;
  isActive?: boolean;
}) {
  let query = supabase
    .from('weather_alerts')
    .select('*')
    .order('valid_from', { ascending: false });

  if (options?.postcode) {
    query = query.eq('postcode', options.postcode);
  }
  if (options?.isActive !== undefined) {
    query = query.eq('is_active', options.isActive);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  return { data: data as WeatherAlert[] | null, error };
}

export async function getWeatherAlertById(id: string) {
  const { data, error } = await supabase
    .from('weather_alerts')
    .select('*')
    .eq('id', id)
    .single();
  return { data: data as WeatherAlert | null, error };
}

// ============================================================================
// USER LOCATIONS
// ============================================================================

export async function getUserLocations() {
  const { userId, error: authError } = await requireUserId();
  if (authError || !userId) return { data: null, error: authError };

  const { data, error } = await supabase
    .from('user_locations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data: data as UserLocation[] | null, error };
}

export async function getUserLocationById(id: string) {
  const { userId, error: authError } = await requireUserId();
  if (authError || !userId) return { data: null, error: authError };

  const { data, error } = await supabase
    .from('user_locations')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
  return { data: data as UserLocation | null, error };
}

export async function createUserLocation(location: UserLocationInsert) {
  const { userId, error: authError } = await requireUserId();
  if (authError || !userId) return { data: null, error: authError };

  const insertData: UserLocationInsert = { ...location, user_id: userId };

  const { data, error } = await supabase
    .from('user_locations')
    .insert(insertData)
    .select()
    .single();
  return { data: data as UserLocation | null, error };
}

export async function updateUserLocation(id: string, updates: UserLocationUpdate) {
  const { userId, error: authError } = await requireUserId();
  if (authError || !userId) return { data: null, error: authError };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user_id: userIdIgnored, ...safeUpdates } = updates;

  const { data, error } = await supabase
    .from('user_locations')
    .update(safeUpdates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  return { data: data as UserLocation | null, error };
}

export async function deleteUserLocation(id: string) {
  const { userId, error: authError } = await requireUserId();
  if (authError || !userId) return { error: authError };

  const { error } = await supabase
    .from('user_locations')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  return { error };
}

export async function setCurrentLocation(locationId: string) {
  const { userId, error: authError } = await requireUserId();
  if (authError || !userId) return { data: null, error: authError };

  // First, unset all current locations for this user
  await supabase
    .from('user_locations')
    .update({ is_current_location: false })
    .eq('user_id', userId);

  // Then set the specified location as current
  const { data, error } = await supabase
    .from('user_locations')
    .update({ is_current_location: true })
    .eq('id', locationId)
    .eq('user_id', userId)
    .select()
    .single();
  return { data: data as UserLocation | null, error };
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export async function getNotifications(options?: {
  limit?: number;
  unreadOnly?: boolean;
}) {
  const { userId, error: authError } = await requireUserId();
  if (authError || !userId) return { data: null, error: authError };

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (options?.unreadOnly) {
    query = query.eq('is_read', false);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  return { data: data as Notification[] | null, error };
}

export async function getNotificationById(id: string) {
  const { userId, error: authError } = await requireUserId();
  if (authError || !userId) return { data: null, error: authError };

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
  return { data: data as Notification | null, error };
}

export async function createNotification(notification: NotificationInsert) {
  const { userId, error: authError } = await requireUserId();
  if (authError || !userId) return { data: null, error: authError };

  const insertData: NotificationInsert = { ...notification, user_id: userId };

  const { data, error } = await supabase
    .from('notifications')
    .insert(insertData)
    .select()
    .single();
  return { data: data as Notification | null, error };
}

export async function updateNotification(id: string, updates: NotificationUpdate) {
  const { userId, error: authError } = await requireUserId();
  if (authError || !userId) return { data: null, error: authError };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user_id: userIdIgnored, ...safeUpdates } = updates;

  const { data, error } = await supabase
    .from('notifications')
    .update(safeUpdates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  return { data: data as Notification | null, error };
}

export async function markNotificationAsRead(id: string) {
  const { userId, error: authError } = await requireUserId();
  if (authError || !userId) return { data: null, error: authError };

  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  return { data: data as Notification | null, error };
}

export async function markAllNotificationsAsRead() {
  const { userId, error: authError } = await requireUserId();
  if (authError || !userId) return { error: authError };

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('is_read', false);
  return { error };
}

export async function deleteNotification(id: string) {
  const { userId, error: authError } = await requireUserId();
  if (authError || !userId) return { error: authError };

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  return { error };
}

// ============================================================================
// USER PREFERENCES
// ============================================================================

export async function getUserPreferences(category?: string) {
  const { userId, error: authError } = await requireUserId();
  if (authError || !userId) return { data: null, error: authError };

  let query = supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  return { data: data as UserPreference[] | null, error };
}

export async function getUserPreference(key: string) {
  const { userId, error: authError } = await requireUserId();
  if (authError || !userId) return { data: null, error: authError };

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .eq('preference_key', key)
    .single();
  return { data: data as UserPreference | null, error };
}

export async function setUserPreference(preference: Omit<UserPreferenceInsert, 'user_id'>) {
  const { userId, error: authError } = await requireUserId();
  if (authError || !userId) return { data: null, error: authError };

  const insertData: UserPreferenceInsert = { ...preference, user_id: userId };

  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(insertData, { onConflict: 'user_id,preference_key' })
    .select()
    .single();
  return { data: data as UserPreference | null, error };
}

export async function updateUserPreference(id: string, updates: UserPreferenceUpdate) {
  const { userId, error: authError } = await requireUserId();
  if (authError || !userId) return { data: null, error: authError };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user_id: userIdIgnored, ...safeUpdates } = updates;

  const { data, error } = await supabase
    .from('user_preferences')
    .update(safeUpdates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  return { data: data as UserPreference | null, error };
}

export async function deleteUserPreference(id: string) {
  const { userId, error: authError } = await requireUserId();
  if (authError || !userId) return { error: authError };

  const { error } = await supabase
    .from('user_preferences')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  return { error };
}

// ============================================================================
// USER PROFILES
// ============================================================================

export async function getUserProfile() {
  const { userId, error: authError } = await requireUserId();
  if (authError || !userId) return { data: null, error: authError };

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data: data as UserProfile | null, error };
}

export async function createUserProfile(profile: UserProfileInsert) {
  const { userId, error: authError } = await requireUserId();
  if (authError || !userId) return { data: null, error: authError };

  const insertData: UserProfileInsert = { ...profile, id: userId };

  const { data, error } = await supabase
    .from('user_profiles')
    .insert(insertData)
    .select()
    .single();
  return { data: data as UserProfile | null, error };
}

export async function updateUserProfile(updates: UserProfileUpdate) {
  const { userId, error: authError } = await requireUserId();
  if (authError || !userId) return { data: null, error: authError };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: idIgnored, email: emailIgnored, ...safeUpdates } = updates;

  // First check if profile exists
  const { data: existing } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', userId)
    .single();

  // If no profile exists, create one (this happens with OAuth sign-ins)
  if (!existing) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        email: user?.email || '',
        ...safeUpdates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    return { data: data as UserProfile | null, error };
  }

  // Otherwise, update existing profile
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ ...safeUpdates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  return { data: data as UserProfile | null, error };
}

export async function upsertUserProfile(profile: UserProfileInsert) {
  const { userId, error: authError } = await requireUserId();
  if (authError || !userId) return { data: null, error: authError };

  const upsertData: UserProfileInsert = { ...profile, id: userId };

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(upsertData, { onConflict: 'id' })
    .select()
    .single();
  return { data: data as UserProfile | null, error };
}

// ============================================================================
// ADMIN FUNCTIONS
// ============================================================================

export async function getAllUserProfiles(options?: {
  limit?: number;
  offset?: number;
  searchQuery?: string;
}) {
  const { userId, error: authError } = await requireUserId();
  if (authError || !userId) return { data: null, count: 0, error: authError };

  let query = supabase
    .from('user_profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (options?.searchQuery) {
    query = query.or(`email.ilike.%${options.searchQuery}%,first_name.ilike.%${options.searchQuery}%,last_name.ilike.%${options.searchQuery}%,phone_number.ilike.%${options.searchQuery}%`);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
  } else if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, count, error } = await query;
  return { data: data as UserProfile[] | null, count: count || 0, error };
}
