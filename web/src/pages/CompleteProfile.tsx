import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2, Phone, ArrowRight } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { useAuth } from '../auth/AuthProvider';
import { getUserProfile, updateUserProfile } from '../supabase/db';

export function CompleteProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  const checkExistingProfile = useCallback(async () => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      const { data } = await getUserProfile();

      // If profile already has first_name and last_name, redirect to dashboard
      if (data?.first_name && data?.last_name) {
        navigate('/dashboard', { replace: true });
        return;
      }
    } catch (err) {
      console.error('Error checking profile:', err);
    } finally {
      setIsCheckingProfile(false);
    }
  }, [user, navigate]);

  useEffect(() => {
    checkExistingProfile();
  }, [checkExistingProfile]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (phoneNumber && !/^[\d\s\-+()]+$/.test(phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!validateForm()) return;

    try {
      setSaving(true);

      const { error } = await updateUserProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        company_name: companyName.trim() || null,
        phone_number: phoneNumber.trim() || null,
      });

      if (error) throw error;

      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Error updating profile:', err);
      setErrors({ general: 'Failed to save profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (isCheckingProfile) {
    return (
      <>
        <SEO title="Complete Profile" noindex />
        <div className="min-h-screen bg-brand-background flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-brand-textGrey">Loading...</div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Complete Profile" noindex />
      <div className="min-h-screen bg-brand-background flex flex-col">
        <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="card">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center mx-auto mb-4">
                <User className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-brand-text mb-2">Complete Your Profile</h1>
              <p className="text-brand-textGrey">
                Tell us a bit about yourself to get started with Circle Overwatch
              </p>
            </div>

            {/* General Error Message */}
            {errors.general && (
              <div className="mb-6 p-4 rounded-lg bg-brand-error/20 border border-brand-error/30">
                <p className="text-brand-error text-sm">{errors.general}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-brand-text mb-2">
                  First Name <span className="text-brand-error">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-brand-textGrey" />
                  </div>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      setErrors({ ...errors, firstName: '' });
                    }}
                    className={`w-full pl-12 pr-4 py-3 bg-brand-inputBackground border ${
                      errors.firstName ? 'border-brand-error' : 'border-transparent'
                    } rounded-lg text-brand-text placeholder-brand-textGrey focus:outline-none focus:ring-2 focus:ring-brand-primary/50`}
                    placeholder="Enter your first name"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-brand-error">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-brand-text mb-2">
                  Last Name <span className="text-brand-error">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-brand-textGrey" />
                  </div>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      setErrors({ ...errors, lastName: '' });
                    }}
                    className={`w-full pl-12 pr-4 py-3 bg-brand-inputBackground border ${
                      errors.lastName ? 'border-brand-error' : 'border-transparent'
                    } rounded-lg text-brand-text placeholder-brand-textGrey focus:outline-none focus:ring-2 focus:ring-brand-primary/50`}
                    placeholder="Enter your last name"
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-brand-error">{errors.lastName}</p>
                )}
              </div>

              {/* Company Name */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-brand-text mb-2">
                  Company Name <span className="text-brand-textGrey text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-brand-textGrey" />
                  </div>
                  <input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-brand-inputBackground border border-transparent rounded-lg text-brand-text placeholder-brand-textGrey focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                    placeholder="Enter your company name"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-brand-text mb-2">
                  Phone Number <span className="text-brand-textGrey text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-brand-textGrey" />
                  </div>
                  <input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      setErrors({ ...errors, phoneNumber: '' });
                    }}
                    className={`w-full pl-12 pr-4 py-3 bg-brand-inputBackground border ${
                      errors.phoneNumber ? 'border-brand-error' : 'border-transparent'
                    } rounded-lg text-brand-text placeholder-brand-textGrey focus:outline-none focus:ring-2 focus:ring-brand-primary/50`}
                    placeholder="Enter your phone number"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-brand-error">{errors.phoneNumber}</p>
                )}
              </div>

              {/* Info Box */}
              <div className="p-4 rounded-lg bg-brand-primary/10 border border-brand-primary/20">
                <p className="text-brand-textGrey text-sm">
                  This information helps us personalize your experience and allows emergency
                  services to contact you if needed. You can update it anytime in Settings.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-lg"
              >
                {saving ? 'Saving...' : 'Continue to Dashboard'}
                {!saving && <ArrowRight className="h-5 w-5" />}
              </button>
            </form>
          </div>
        </div>
      </main>

        <Footer />
      </div>
    </>
  );
}


