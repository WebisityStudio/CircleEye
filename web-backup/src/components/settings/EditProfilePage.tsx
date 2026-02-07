import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2, Phone, Save } from 'lucide-react';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { useAuth } from '../../auth/AuthProvider';
import { getUserProfile, updateUserProfile } from '../../supabase/db';

export function EditProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState('');

  const loadProfile = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await getUserProfile();

      if (error) throw error;

      if (data) {
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setCompanyName(data.company_name || '');
        setPhoneNumber(data.phone_number || '');
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

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

  const handleSave = async () => {
    if (!user) return;
    if (!validateForm()) return;

    try {
      setSaving(true);
      setSuccessMessage('');

      const { error } = await updateUserProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        company_name: companyName.trim() || null,
        phone_number: phoneNumber.trim() || null,
      });

      if (error) throw error;

      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => {
        navigate('/settings');
      }, 1500);
    } catch (err) {
      console.error('Error updating profile:', err);
      setErrors({ general: 'Failed to update profile. Please try again.' });
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
        <h1 className="text-3xl font-bold text-brand-text mb-2">Edit Profile</h1>
        <p className="text-brand-textGrey mb-8">Update your personal information</p>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/30">
            <p className="text-green-400 text-sm">{successMessage}</p>
          </div>
        )}

        {/* General Error Message */}
        {errors.general && (
          <div className="mb-6 p-4 rounded-lg bg-brand-error/20 border border-brand-error/30">
            <p className="text-brand-error text-sm">{errors.general}</p>
          </div>
        )}

        {/* Form */}
        <div className="card">
          <div className="space-y-6">
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
          </div>

          {/* Save Button */}
          <div className="mt-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Save className="h-5 w-5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}


