import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { RequireAuth } from './RequireAuth';
import { RedirectIfAuthenticated } from './RedirectIfAuthenticated';
import { Login } from '../pages/Login';
import { Signup } from '../pages/Signup';
import { ForgotPassword } from '../pages/ForgotPassword';
import { VerifyOTP } from '../pages/VerifyOTP';
import { ResetPassword } from '../pages/ResetPassword';
import { AuthCallback } from '../pages/AuthCallback';
import { NowMapPage } from '../pages/NowMapPage';
import { Home } from '../components/Home';
import { PrivacyPolicy } from '../components/PrivacyPolicy';
import { LandingPage } from '../components/LandingPage';
import { SettingsPage } from '../components/SettingsPage';
import { TermsOfService } from '../components/TermsOfService';
import { EditProfilePage } from '../components/settings/EditProfilePage';
import { NotificationSettingsPage } from '../components/settings/NotificationSettingsPage';
import { AnalyticsPrivacyPage } from '../components/settings/AnalyticsPrivacyPage';
import { ReferFriendPage } from '../components/settings/ReferFriendPage';
import { AboutPage } from '../components/settings/AboutPage';
import { NewsPage } from '../components/NewsPage';
import { WeatherAlertsPage } from '../components/WeatherAlertsPage';
import { AdminUsersPage } from '../components/AdminUsersPage';
import { RequireAdmin } from './RequireAdmin';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={
        <RedirectIfAuthenticated>
          <Login />
        </RedirectIfAuthenticated>
      } />
      <Route path="/signup" element={
        <RedirectIfAuthenticated>
          <Signup />
        </RedirectIfAuthenticated>
      } />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/forgot-password/verify" element={<VerifyOTP />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />

      {/* Protected routes */}
      <Route
        path="/app"
        element={
          <RequireAuth>
            <NowMapPage />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Home />
          </RequireAuth>
        }
      />
      <Route
        path="/settings"
        element={
          <RequireAuth>
            <SettingsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/settings/edit-profile"
        element={
          <RequireAuth>
            <EditProfilePage />
          </RequireAuth>
        }
      />
      <Route
        path="/settings/notifications"
        element={
          <RequireAuth>
            <NotificationSettingsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/settings/analytics-privacy"
        element={
          <RequireAuth>
            <AnalyticsPrivacyPage />
          </RequireAuth>
        }
      />
      <Route
        path="/settings/refer-friend"
        element={
          <RequireAuth>
            <ReferFriendPage />
          </RequireAuth>
        }
      />
      <Route
        path="/settings/about"
        element={
          <RequireAuth>
            <AboutPage />
          </RequireAuth>
        }
      />
      <Route
        path="/news"
        element={
          <RequireAuth>
            <NewsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/weather-alerts"
        element={
          <RequireAuth>
            <WeatherAlertsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RequireAdmin>
            <AdminUsersPage />
          </RequireAdmin>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
