import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { useAuthStore } from '../src/stores/authStore';
import { supabase } from '../src/config/supabase';
import { getUserProfile, ensureUserProfile } from '../src/services/auth';
import { COLORS } from '../src/config/constants';

export default function RootLayout() {
  const { setUser, setLoading, setError } = useAuthStore();

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const profile = await getUserProfile(session.user.id).catch(() =>
            ensureUserProfile(session.user.id, session.user.email || '')
          );
          setUser(profile, session.access_token);
        } else {
          setUser(null, null);
        }
      } catch (error) {
        console.error('Session check error:', error);
        setError('Failed to check authentication');
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await getUserProfile(session.user.id).catch(() =>
            ensureUserProfile(session.user.id, session.user.email || '')
          );
          setUser(profile, session.access_token);
        } else if (event === 'SIGNED_OUT') {
          setUser(null, null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setLoading, setError]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.textOnPrimary,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: COLORS.background,
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Circle Eye',
          }}
        />
        <Stack.Screen
          name="auth/login"
          options={{
            title: 'Sign In',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="auth/register"
          options={{
            title: 'Create Account',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="inspection/new"
          options={{
            title: 'New Inspection',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="inspection/[sessionId]"
          options={{
            title: 'Live Inspection',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="history/index"
          options={{
            title: 'Inspection History',
          }}
        />
        <Stack.Screen
          name="history/[sessionId]"
          options={{
            title: 'Inspection Report',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
