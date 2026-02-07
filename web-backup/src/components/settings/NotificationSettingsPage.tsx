import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Bell, Cloud, Shield } from 'lucide-react';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { useAuth } from '../../auth/AuthProvider';
import { getUserPreferences, setUserPreference, updateUserProfile } from '../../supabase/db';

const NOTIFICATION_PREF_KEYS = {
  WEATHER_WARNING: 'notifications.weather_warning',
  CRIME_REFERENCE: 'notifications.crime_reference',
} as const;

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  preferenceKey: string;
  icon: React.ElementType;
  enabled: boolean;
}

export function NotificationSettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: '1',
      label: 'Weather Warnings',
      description: 'Get notified about severe weather alerts and flood warnings in your area',
      preferenceKey: NOTIFICATION_PREF_KEYS.WEATHER_WARNING,
      icon: Cloud,
      enabled: false,
    },
    {
      id: '2',
      label: 'Crime Alerts',
      description: 'Receive notifications about crime incidents near your saved locations',
      preferenceKey: NOTIFICATION_PREF_KEYS.CRIME_REFERENCE,
      icon: Shield,
      enabled: false,
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadPreferences = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await getUserPreferences();

      if (error) throw error;

      if (data) {
        const prefMap = new Map(
          data.map((pref) => [pref.preference_key, pref.preference_value])
        );

        setSettings((current) =>
          current.map((setting) => {
            const rawValue = prefMap.get(setting.preferenceKey);
            if (rawValue == null) return setting;

            const strValue = typeof rawValue === 'string' ? rawValue.trim() : String(rawValue);
            const boolValue = strValue === 'true' || strValue === '1' || strValue.toLowerCase() === 'yes';

            return { ...setting, enabled: boolValue };
          })
        );
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
      setErrorMessage('Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const handleToggle = (id: string) => {
    setSettings((current) =>
      current.map((setting) =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      setSuccessMessage('');
      setErrorMessage('');

      const hasAnyEnabled = settings.some((setting) => setting.enabled);

      const preferenceWrites = settings.map((setting) =>
        setUserPreference({
          preference_key: setting.preferenceKey,
          preference_value: String(setting.enabled),
          preference_type: 'boolean',
          category: 'notifications',
        })
      );

      const profileWrite = updateUserProfile({
        notification_permission: hasAnyEnabled,
      });

      await Promise.all([...preferenceWrites, profileWrite]);

      setSuccessMessage('Notification settings saved successfully!');
      setTimeout(() => {
        navigate('/settings');
      }, 1500);
    } catch (err) {
      console.error('Error saving preferences:', err);
      setErrorMessage('Failed to save notification settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-brand-textGrey">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-brand-text mb-2">Notification Settings</h1>
        <p className="text-brand-textGrey mb-8">
          Manage your notification preferences and stay informed about important alerts
        </p>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/30">
            <p className="text-green-400 text-sm">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-lg bg-brand-error/20 border border-brand-error/30">
            <p className="text-brand-error text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Notification Settings */}
        <div className="card space-y-4">
          {settings.map((setting) => (
            <div
              key={setting.id}
              className="flex items-start gap-4 p-4 rounded-lg bg-brand-inputBackground hover:bg-brand-inputBackground/80 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-primary/20 flex items-center justify-center">
                <setting.icon className="h-5 w-5 text-brand-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-brand-text font-medium mb-1">{setting.label}</h3>
                <p className="text-brand-textGrey text-sm">{setting.description}</p>
              </div>

              <button
                onClick={() => handleToggle(setting.id)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-brand-background ${
                  setting.enabled ? 'bg-brand-primary' : 'bg-gray-600'
                }`}
                role="switch"
                aria-checked={setting.enabled}
                aria-label={`Toggle ${setting.label}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    setting.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 rounded-lg bg-brand-primary/10 border border-brand-primary/20">
          <div className="flex gap-3">
            <Bell className="h-5 w-5 text-brand-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-brand-text font-medium mb-1">About Notifications</h4>
              <p className="text-brand-textGrey text-sm">
                Notifications help you stay informed about potential risks in your area.
                Enable the alerts that matter most to you. You can change these settings at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Save className="h-5 w-5" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}


