import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  Info,
  FileText,
  Scale,
  LogOut,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useAuth } from '../auth/AuthProvider';
import { signOut } from '../supabase/authService';
import { getUserProfile } from '../supabase/db';
import type { UserProfile } from '../supabase/database.types';

interface SettingOption {
  id: string;
  label: string;
  icon: React.ElementType;
  action: 'link' | 'button' | 'danger';
  to?: string;
  onClick?: () => void;
  description?: string;
  comingSoon?: boolean;
}

export function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await getUserProfile();
      if (data) {
        setUserProfile(data);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await signOut();
      navigate('/login', { replace: true });
    }
  };

  const handleDeleteAccount = () => {
    window.alert('Account deletion will be available soon. Please contact info@overwatch-app.com for assistance.');
  };

  const getDisplayName = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`;
    }
    if (userProfile?.first_name) {
      return userProfile.first_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getInitials = () => {
    if (userProfile?.first_name) {
      const firstInitial = userProfile.first_name.charAt(0).toUpperCase();
      const lastInitial = userProfile?.last_name?.charAt(0).toUpperCase() || '';
      return firstInitial + lastInitial;
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const settingsOptions: SettingOption[] = [
    {
      id: 'edit-profile',
      label: 'Edit Profile',
      icon: User,
      action: 'link',
      to: '/settings/edit-profile',
      description: 'Update your name and profile information',
    },
    {
      id: 'analytics-privacy',
      label: 'Analytics & Privacy',
      icon: Shield,
      action: 'link',
      to: '/settings/analytics-privacy',
      description: 'Manage data collection preferences',
    },
    {
      id: 'about-app',
      label: 'About App',
      icon: Info,
      action: 'link',
      to: '/settings/about',
      description: 'Version info and app details',
    },
    {
      id: 'privacy-policy',
      label: 'Privacy Policy',
      icon: FileText,
      action: 'link',
      to: '/privacy',
      description: 'Read our privacy policy',
    },
    {
      id: 'terms-of-use',
      label: 'Terms of Use',
      icon: Scale,
      action: 'link',
      to: '/terms',
      description: 'View terms and conditions',
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: LogOut,
      action: 'button',
      onClick: handleSignOut,
      description: 'Sign out of your account',
    },
    {
      id: 'delete-account',
      label: 'Delete Account',
      icon: Trash2,
      action: 'danger',
      onClick: handleDeleteAccount,
      description: 'Permanently delete your account',
    },
  ];

  const renderSettingItem = (option: SettingOption) => {
    const content = (
      <>
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            option.action === 'danger' 
              ? 'bg-brand-error/20' 
              : 'bg-brand-primary/20'
          }`}>
            <option.icon className={`h-5 w-5 ${
              option.action === 'danger' 
                ? 'text-brand-error' 
                : 'text-brand-primary'
            }`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`font-medium ${
                option.action === 'danger' 
                  ? 'text-brand-error' 
                  : 'text-brand-text'
              }`}>
                {option.label}
              </span>
              {option.comingSoon && (
                <span className="text-xs bg-brand-primary/20 text-brand-primary px-2 py-0.5 rounded-full">
                  Coming Soon
                </span>
              )}
            </div>
            {option.description && (
              <p className="text-sm text-brand-textGrey mt-0.5">
                {option.description}
              </p>
            )}
          </div>
        </div>
        <ChevronRight className={`h-5 w-5 ${
          option.action === 'danger' 
            ? 'text-brand-error/50' 
            : 'text-brand-textGrey'
        }`} />
      </>
    );

    const baseClasses = "flex items-center justify-between p-4 rounded-xl transition-all duration-200";
    const hoverClasses = option.action === 'danger' 
      ? 'hover:bg-brand-error/10' 
      : 'hover:bg-brand-inputBackground';

    if (option.action === 'link' && option.to && !option.comingSoon) {
      return (
        <Link
          key={option.id}
          to={option.to}
          className={`${baseClasses} ${hoverClasses}`}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        key={option.id}
        onClick={option.onClick}
        disabled={option.comingSoon}
        className={`${baseClasses} ${hoverClasses} w-full text-left ${
          option.comingSoon ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      >
        {content}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* User Profile Header */}
        <div className="card mb-8">
          {loading ? (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-brand-inputBackground animate-pulse"></div>
              <div className="flex-1">
                <div className="h-6 bg-brand-inputBackground rounded w-32 mb-2 animate-pulse"></div>
                <div className="h-4 bg-brand-inputBackground rounded w-48 animate-pulse"></div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {getInitials()}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-brand-text">
                  {getDisplayName()}
                </h1>
                <p className="text-brand-textGrey text-sm">
                  {user?.email || 'No email'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Settings List */}
        <div className="card p-2">
          <div className="divide-y divide-gray-800">
            {settingsOptions.map((option) => (
              <div key={option.id} className="first:pt-0 last:pb-0">
                {renderSettingItem(option)}
              </div>
            ))}
          </div>
        </div>

        {/* App Version */}
        <div className="text-center mt-8 text-sm text-brand-textGrey">
          <p>Circle Overwatch Web v1.0.0</p>
          <p className="mt-1">© 2025 Circle Overwatch</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}






















