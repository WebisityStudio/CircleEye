import { useState } from 'react';
import { Copy, Share2, Check, Users, Gift } from 'lucide-react';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { useAuth } from '../../auth/AuthProvider';

export function ReferFriendPage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const referralBaseUrl = import.meta.env.VITE_REFERRAL_BASE_URL || 'https://circleoverwatch.com/signup';
  const referralLink = `${referralBaseUrl}?ref=${user?.id || 'invite'}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Join Circle Overwatch',
      text: `Stay informed about safety threats in your area. Join me on Circle Overwatch!`,
      url: referralLink,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-brand-text mb-2">Refer a Friend</h1>
        <p className="text-brand-textGrey mb-8">
          Share Circle Overwatch with friends and family to help them stay safe
        </p>

        {/* Hero Card */}
        <div className="card mb-6">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center mx-auto mb-4">
              <Users className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-brand-text mb-3">
              Help Others Stay Safe
            </h2>
            <p className="text-brand-textGrey text-sm leading-relaxed max-w-md mx-auto">
              Share your unique referral link with friends, family, and community members.
              Together, we can create a safer, more informed community.
            </p>
          </div>
        </div>

        {/* Referral Link Card */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-brand-text mb-4">Your Referral Link</h3>

          <div className="flex gap-3 mb-4">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-brand-inputBackground rounded-lg border border-brand-primary/20">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 bg-transparent text-brand-text text-sm focus:outline-none"
              />
            </div>

            <button
              onClick={handleCopyLink}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                copied
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-brand-primary hover:bg-brand-primary/80 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5" />
                  Copy
                </>
              )}
            </button>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="w-full btn-secondary flex items-center justify-center gap-2"
          >
            <Share2 className="h-5 w-5" />
            Share via...
          </button>
        </div>

        {/* Benefits Card */}
        <div className="card mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-brand-secondary/20 flex items-center justify-center flex-shrink-0">
              <Gift className="h-6 w-6 text-brand-secondary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-brand-text mb-2">Why Share?</h3>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-brand-primary text-xs font-bold">1</span>
              </div>
              <div>
                <h4 className="text-brand-text font-medium mb-1">Keep Loved Ones Safe</h4>
                <p className="text-brand-textGrey text-sm">
                  Help your friends and family stay informed about safety threats in their area
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-brand-primary text-xs font-bold">2</span>
              </div>
              <div>
                <h4 className="text-brand-text font-medium mb-1">Build Community Awareness</h4>
                <p className="text-brand-textGrey text-sm">
                  A more informed community is a safer community for everyone
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-brand-primary text-xs font-bold">3</span>
              </div>
              <div>
                <h4 className="text-brand-text font-medium mb-1">Easy to Use</h4>
                <p className="text-brand-textGrey text-sm">
                  They'll get instant access to real-time crime, weather, and threat level data
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="card">
          <h3 className="text-lg font-semibold text-brand-text mb-4">How It Works</h3>

          <ol className="space-y-3 text-sm text-brand-textGrey">
            <li className="flex gap-3">
              <span className="font-semibold text-brand-primary">1.</span>
              <span>Copy your unique referral link or share it directly</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-brand-primary">2.</span>
              <span>Your friend clicks the link and signs up for Circle Overwatch</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-brand-primary">3.</span>
              <span>They get access to all safety features immediately</span>
            </li>
          </ol>
        </div>

      </main>

      <Footer />
    </div>
  );
}
