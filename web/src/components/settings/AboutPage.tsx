import { Link } from 'react-router-dom';
import { Info, FileText, Scale, ExternalLink } from 'lucide-react';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { BrandLogo } from '../BrandLogo';

export function AboutPage() {

  const appName = 'Circle Overwatch Web';
  const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';

  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-brand-text mb-8">About App</h1>

        {/* App Info Card */}
        <div className="card mb-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-4">
              <BrandLogo variant="mark" />
            </div>
            <h2 className="text-2xl font-bold text-brand-text mb-2">{appName}</h2>
            <p className="text-brand-textGrey text-sm">
              Real-time safety intelligence for the United Kingdom
            </p>
          </div>

          <div className="border-t border-gray-800 pt-6">
            <p className="text-brand-textGrey text-sm leading-relaxed text-center max-w-md mx-auto">
              Circle Overwatch is your all-in-one safety and awareness platform. Get local crime insights,
              weather alerts, terrorism threat levels, and quick access to assistance—right when you need it.
            </p>
          </div>
        </div>

        {/* Version Info */}
        <div className="card mb-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-brand-inputBackground">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-brand-primary" />
              <span className="text-brand-text font-medium">Version</span>
            </div>
            <span className="text-brand-textGrey">{appVersion}</span>
          </div>
        </div>

        {/* Features */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-brand-text mb-4">Key Features</h3>
          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 flex-shrink-0"></div>
              <p className="text-brand-textGrey text-sm">
                <span className="text-brand-text font-medium">Crime Alerts:</span> Real-time street-level
                crime data from Police.uk API
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 flex-shrink-0"></div>
              <p className="text-brand-textGrey text-sm">
                <span className="text-brand-text font-medium">Weather Warnings:</span> Live flood alerts and
                severe weather warnings from official sources
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 flex-shrink-0"></div>
              <p className="text-brand-textGrey text-sm">
                <span className="text-brand-text font-medium">Threat Level Updates:</span> Official UK
                terrorism threat level from MI5, updated in real-time
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 flex-shrink-0"></div>
              <p className="text-brand-textGrey text-sm">
                <span className="text-brand-text font-medium">Location Tracking:</span> Monitor multiple
                postcodes with personalized risk assessments
              </p>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-brand-text mb-4">Legal & Privacy</h3>
          <div className="space-y-2">
            <Link
              to="/privacy"
              className="flex items-center justify-between p-4 rounded-lg bg-brand-inputBackground hover:bg-brand-inputBackground/80 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-brand-primary" />
                <span className="text-brand-text font-medium">Privacy Policy</span>
              </div>
              <ExternalLink className="h-4 w-4 text-brand-textGrey group-hover:text-brand-text transition-colors" />
            </Link>

            <Link
              to="/terms"
              className="flex items-center justify-between p-4 rounded-lg bg-brand-inputBackground hover:bg-brand-inputBackground/80 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Scale className="h-5 w-5 text-brand-primary" />
                <span className="text-brand-text font-medium">Terms of Service</span>
              </div>
              <ExternalLink className="h-4 w-4 text-brand-textGrey group-hover:text-brand-text transition-colors" />
            </Link>
          </div>
        </div>

        {/* Data Sources */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-brand-text mb-4">Data Sources</h3>
          <div className="space-y-2 text-sm text-brand-textGrey">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-brand-primary"></div>
              <span>MI5 & Counter-Terrorism</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-brand-primary"></div>
              <span>Home Office Crime Statistics</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-brand-primary"></div>
              <span>Met Office & Environment Agency</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-brand-primary"></div>
              <span>Police.uk Street-level Crime API</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-brand-primary"></div>
              <span>Public News Channels</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-sm text-brand-textGrey">
          <p>© 2025 Circle Overwatch. All rights reserved.</p>
          <p className="mt-2">Built with care for community safety</p>
        </div>

      </main>

      <Footer />
    </div>
  );
}
