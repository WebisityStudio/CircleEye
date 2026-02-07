import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';
import { hasUserResponded, setConsent } from '../services/cookieConsent';
import { initializeGA } from '../utils/analytics';

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(() => !hasUserResponded());

  const handleAccept = () => {
    setConsent('accepted');
    initializeGA();
    setIsVisible(false);
  };

  const handleReject = () => {
    setConsent('rejected');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gray-900 border-t border-brand-primary shadow-2xl">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="h-5 w-5 text-brand-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-brand-text text-sm">
                We use cookies for analytics to improve your experience.{' '}
                <Link
                  to="/privacy"
                  className="text-brand-primary hover:underline"
                >
                  Learn more
                </Link>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handleReject}
              className="px-4 py-2 text-sm text-brand-textGrey hover:text-brand-text transition-colors"
            >
              Reject
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
