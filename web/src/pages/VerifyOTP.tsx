import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { sendEmailOtp, verifyEmailOtp } from '../supabase/authService';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';

export function VerifyOTP() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const email = (searchParams.get('email') ?? '').trim();
  const [token, setToken] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(300);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [secondsLeft]);

  const timeLabel = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [secondsLeft]);

  const canResend = secondsLeft <= 0 && !resendBusy && !!email;
  const canVerify = token.length === 6 && !busy && !!email;

  return (
    <>
      <SEO title="Verify Code" noindex />
      <div className="min-h-screen bg-brand-background flex flex-col">
        <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 text-brand-textGrey hover:text-brand-text mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Reset
          </Link>

          <div className="card">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-brand-text mb-2">Enter verification code</h1>
              <p className="text-brand-textGrey">
                {email ? `We sent a 6-digit code to ${email}.` : 'Enter the code from your email.'}
              </p>
            </div>

            {!email && (
              <div className="bg-brand-error/10 border border-brand-error/50 rounded-lg p-3 mb-6">
                <p className="text-brand-error text-sm">
                  Missing email address. Please start the reset again.
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
                if (!email) {
                  setErr('Missing email address');
                  return;
                }
                if (token.length !== 6) {
                  setErr('Enter the 6-digit code');
                  return;
                }
                setBusy(true);
                setErr(null);
                try {
                  const { error } = await verifyEmailOtp(email, token);
                  if (error) throw error;
                  nav('/reset-password');
                } catch (e: unknown) {
                  const message = e instanceof Error ? e.message : 'Invalid code';
                  setErr(message);
                } finally {
                  setBusy(false);
                }
              }}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-brand-text mb-2">Verification code</label>
                <input
                  name="token"
                  value={token}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setToken(digits);
                  }}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  className="input-field w-full text-center tracking-[0.6em] text-lg"
                  placeholder="000000"
                />
              </div>

              <button
                disabled={!canVerify}
                type="submit"
                className="btn-primary w-full py-3"
              >
                {busy ? 'Verifying...' : 'Verify code'}
              </button>
            </form>

            <div className="mt-6 space-y-4 text-center">
              <p className="text-xs text-brand-textGrey">
                {secondsLeft > 0 ? `Resend available in ${timeLabel}` : 'Did not get the code?'}
              </p>
              <button
                type="button"
                disabled={!canResend}
                onClick={async () => {
                  if (!email) return;
                  setResendBusy(true);
                  setErr(null);
                  try {
                    const { error } = await sendEmailOtp(email);
                    if (error) throw error;
                    setSecondsLeft(300);
                  } catch (e: unknown) {
                    const message = e instanceof Error ? e.message : 'Unable to resend code';
                    setErr(message);
                  } finally {
                    setResendBusy(false);
                  }
                }}
                className="btn-secondary w-full"
              >
                {resendBusy ? 'Resending...' : 'Resend code'}
              </button>
            </div>

            <p className="mt-8 text-center text-brand-textGrey">
              Back to{' '}
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
