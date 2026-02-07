import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { AppRoutes } from './routes/AppRoutes';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { getConsentStatus } from './services/cookieConsent';
import { initializeGA } from './utils/analytics';

function App() {
  useEffect(() => {
    // Initialize GA if user previously accepted cookies
    if (getConsentStatus() === 'accepted') {
      initializeGA();
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <CookieConsentBanner />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
