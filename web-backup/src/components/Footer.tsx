import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, AlertCircle, Smartphone } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { clearConsent } from '../services/cookieConsent';

export function Footer() {
  return (
    <footer className="bg-brand-background border-t border-brand-primary/20 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <BrandLogo variant="mark" linkTo="/" showText={true} />
            </div>
            <p className="text-brand-textGrey text-sm max-w-md mb-6">
              Circle Overwatch provides real-time monitoring and assessment of security threats, 
              crime patterns, and weather risks across the United Kingdom. Stay informed and 
              protect your community with data sourced from official government agencies.
            </p>
            
            {/* Mobile App Badges */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-brand-textGrey mb-2">
                <Smartphone className="h-4 w-4 text-brand-primary" />
                <span>Available on mobile</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#"
                  className="inline-flex items-center gap-3 px-4 py-3 bg-brand-inputBackground/50 border border-brand-primary/10 rounded-xl hover:bg-brand-inputBackground hover:border-brand-primary/20 transition-all group"
                  title="Download on App Store"
                >
                  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs text-brand-textGrey">Download on</div>
                    <div className="text-sm font-semibold text-brand-text">App Store</div>
                  </div>
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=uk.co.circleoverwatch.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-4 py-3 bg-brand-inputBackground/50 border border-brand-primary/10 rounded-xl hover:bg-brand-inputBackground hover:border-brand-primary/20 transition-all group"
                  title="Get it on Google Play"
                >
                  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs text-brand-textGrey">Get it on</div>
                    <div className="text-sm font-semibold text-brand-text">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div>
            <h4 className="text-brand-text font-semibold mb-4">Emergency Contacts</h4>
            <div className="space-y-3">
              <div className="flex items-center text-brand-textGrey">
                <Phone className="h-4 w-4 mr-2 text-brand-primary" />
                <span className="text-sm">Emergency: 999</span>
              </div>
              <div className="flex items-center text-brand-textGrey">
                <Phone className="h-4 w-4 mr-2 text-brand-primary" />
                <span className="text-sm">Anti-Terror Hotline: 0800 789 321</span>
              </div>
              <div className="flex items-center text-brand-textGrey">
                <Mail className="h-4 w-4 mr-2 text-brand-primary" />
                <span className="text-sm">info@overwatch-app.com</span>
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div>
            <h4 className="text-brand-text font-semibold mb-4">Data Sources</h4>
            <ul className="space-y-2 text-sm text-brand-textGrey">
              <li>• MI5 & Counter-Terrorism</li>
              <li>• Home Office Crime Statistics</li>
              <li>• Met Office & Environment Agency</li>
              <li>• Police.uk Street-level Crime API</li>
              <li>• Public News Channels</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 text-sm text-brand-textGrey">
            <span>© 2025 Circle Overwatch. All rights reserved.</span>
            <Link 
              to="/privacy" 
              className="hover:text-brand-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="hover:text-brand-primary transition-colors"
            >
              Terms of Service
            </Link>
            <button
              onClick={() => {
                clearConsent();
                window.location.reload();
              }}
              className="hover:text-brand-primary transition-colors"
            >
              Cookie Settings
            </button>
          </div>

          <div className="flex items-center">
            <div className="flex items-center text-sm text-brand-textGrey">
              <AlertCircle className="h-4 w-4 mr-2 text-green-500" />
              <span>System Status: Operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
