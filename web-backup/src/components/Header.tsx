import React, { useState, useEffect, useCallback } from 'react';
import { LogOut, Menu, X, Settings, LayoutDashboard, MapPin, ExternalLink } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { signOut } from '../supabase/authService';
import { BrandLogo } from './BrandLogo';
import { getUserProfile } from '../supabase/db';
import type { UserProfile } from '../supabase/database.types';

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const loadUserProfile = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await getUserProfile();
      if (data) {
        setUserProfile(data);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user, loadUserProfile]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const isActive = (path: string) => location.pathname === path;

  const getDisplayName = () => {
    if (userProfile?.first_name) {
      return userProfile.first_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const navLinks = user ? [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/app', label: 'Report an Incident', icon: MapPin },
    { to: '/settings', label: 'Settings', icon: Settings },
  ] : [];

  const SAFE_CIRCLE_URL = 'https://circleukgroup.co.uk/safe-circle';

  return (
    <header className="bg-brand-background border-b border-brand-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <BrandLogo variant="full" linkTo={user ? "/dashboard" : "/"} />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 text-base font-semibold transition-colors ${
                  isActive(link.to)
                    ? 'text-brand-primary'
                    : 'text-brand-textGrey hover:text-brand-text'
                }`}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            ))}
            <a
              href={SAFE_CIRCLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-base font-semibold text-brand-textGrey hover:text-brand-text transition-colors"
            >
              <ExternalLink className="h-5 w-5" />
              Business Risk Management Hub
            </a>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* System Status */}
            <div className="hidden lg:flex items-center text-sm text-brand-textGrey">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              System Online
            </div>

            {/* User info & actions */}
            {user ? (
              <>
                <span className="hidden sm:block text-sm text-brand-textGrey">
                  Hi, {getDisplayName()}
                </span>
                <button
                  onClick={handleSignOut}
                  className="hidden sm:flex items-center gap-2 btn-secondary text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-brand-textGrey hover:text-brand-text transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary text-sm"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-brand-textGrey hover:text-brand-text"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? 'bg-brand-primary/10 text-brand-primary'
                      : 'text-brand-textGrey hover:bg-brand-inputBackground hover:text-brand-text'
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}
              <a
                href={SAFE_CIRCLE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-brand-textGrey hover:bg-brand-inputBackground hover:text-brand-text transition-colors"
              >
                <ExternalLink className="h-5 w-5" />
                Business Risk Management Hub
              </a>

              {user ? (
                <>
                  <div className="px-3 py-2 text-sm text-brand-textGrey">
                    Signed in as: {user.email}
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-brand-error hover:bg-brand-inputBackground"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm font-medium text-brand-textGrey hover:text-brand-text"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mx-3 btn-primary text-sm text-center"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

