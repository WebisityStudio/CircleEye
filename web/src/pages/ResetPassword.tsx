import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { updatePassword } from '../supabase/authService';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { useAuth } from '../auth/AuthProvider';

export function ResetPassword() {
  const { user, loading } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const sessionMissing = !loading && !user;
  const canSubmit = !busy && !done && !sessionMissing;

  return (
    <>
      <SEO title="New Password" noindex />
      <div className="min-h-screen bg-brand-background flex flex-col">
        <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-brand-textGrey hover:text-brand-text mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>

          <div className="card">
            {done ? (
              <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-brand-text">Password updated</h1>
                <p className="text-brand-textGrey">
                  Your password has been reset. Sign in with your new password.
                </p>
                <Link to="/login" className="btn-primary w-full py-3 inline-block text-center">
                  Go to sign in
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-brand-text mb-2">Choose a new password</h1>
                  <p className="text-brand-textGrey">Create a password you have not used before.</p>
                </div>

                {sessionMissing && (
                  <div className="bg-brand-error/10 border border-brand-error/50 rounded-lg p-3 mb-6">
                    <p className="text-brand-error text-sm">
                      Your reset session has expired. Please start the reset again.
                    </p>
                  </div>
                )}

                {err && (
                  <div className="bg-brand-error/10 border border-brand-error/50 rounded-lg p-3 mb-6">
                    <p className="text-brand-error text-sm">{err}</p>
                  </div>
                )}

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const passwordValue = formData.get('password') as string || password;
                    const confirmPasswordValue = formData.get('confirmPassword') as string || confirmPassword;

                    if (sessionMissing) {
                      setErr('Your reset session has expired');
                      return;
                    }
                    if (passwordValue.length < 6) {
                      setErr('Password must be at least 6 characters');
                      return;
                    }
                    if (passwordValue !== confirmPasswordValue) {
                      setErr('Passwords do not match');
                      return;
                    }

                    setBusy(true);
                    setErr(null);
                    try {
                      const { error } = await updatePassword(passwordValue);
                      if (error) throw error;
                      setDone(true);
                    } catch (e: unknown) {
                      const message = e instanceof Error ? e.message : 'Unable to update password';
                      setErr(message);
                    } finally {
                      setBusy(false);
                    }
                  }}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-sm font-medium text-brand-text mb-2">New password</label>
                    <input
                      name="password"
                      defaultValue={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      required
                      className="input-field w-full"
                      placeholder="Enter a new password"
                    />
                    <p className="text-xs text-brand-textGrey mt-1">At least 6 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-text mb-2">Confirm password</label>
                    <input
                      name="confirmPassword"
                      defaultValue={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      type="password"
                      required
                      className="input-field w-full"
                      placeholder="Repeat new password"
                    />
                  </div>

                  <button
                    disabled={!canSubmit}
                    type="submit"
                    className="btn-primary w-full py-3"
                  >
                    {busy ? 'Updating...' : 'Update password'}
                  </button>
                </form>
              </>
            )}

            {!done && (
              <p className="mt-8 text-center text-brand-textGrey">
                Back to{' '}
                <Link to="/login" className="text-brand-primary hover:text-brand-secondary font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </div>
      </main>

        <Footer />
      </div>
    </>
  );
}
