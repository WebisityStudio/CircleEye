import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { sendEmailOtp } from '../supabase/authService';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';

export function ForgotPassword() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <>
      <SEO title="Reset Password" noindex />
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
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-brand-text mb-2">Reset your password</h1>
              <p className="text-brand-textGrey">We will email you a 6-digit verification code.</p>
            </div>

            {err && (
              <div className="bg-brand-error/10 border border-brand-error/50 rounded-lg p-3 mb-6">
                <p className="text-brand-error text-sm">{err}</p>
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const emailValue = (formData.get('email') as string || email).trim();
                if (!emailValue) {
                  setErr('Email is required');
                  return;
                }
                setBusy(true);
                setErr(null);
                try {
                  const { error } = await sendEmailOtp(emailValue);
                  if (error) throw error;
                  nav(`/forgot-password/verify?email=${encodeURIComponent(emailValue)}`);
                } catch (e: unknown) {
                  const message = e instanceof Error ? e.message : 'Unable to send code';
                  setErr(message);
                } finally {
                  setBusy(false);
                }
              }}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-brand-text mb-2">Email</label>
                <input
                  name="email"
                  defaultValue={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  className="input-field w-full"
                  placeholder="you@example.com"
                />
              </div>

              <button
                disabled={busy}
                type="submit"
                className="btn-primary w-full py-3"
              >
                {busy ? 'Sending code...' : 'Send verification code'}
              </button>
            </form>

            <p className="mt-8 text-center text-brand-textGrey">
              Remember your password?{' '}
              <Link to="/login" className="text-brand-primary hover:text-brand-secondary font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

        <Footer />
      </div>
    </>
  );
}
