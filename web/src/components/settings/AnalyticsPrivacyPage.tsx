import { Link } from 'react-router-dom';
import { ChevronRight, Shield, Info } from 'lucide-react';
import { Header } from '../Header';
import { Footer } from '../Footer';

export function AnalyticsPrivacyPage() {
  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-brand-text mb-2">Analytics & Privacy</h1>
        <p className="text-brand-textGrey mb-8">
          Control how your data is used to improve Circle Overwatch
        </p>

        {/* Main Content */}
        <div className="space-y-6">
          {/* What We Collect */}
          <div className="card">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-brand-secondary/20 flex items-center justify-center flex-shrink-0">
                <Info className="h-6 w-6 text-brand-secondary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-brand-text mb-2">What We Collect</h2>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-brand-text font-medium mb-2">When Analytics is Enabled:</h3>
                <ul className="list-disc list-inside space-y-1 text-brand-textGrey text-sm">
                  <li>Pages you visit and features you use</li>
                  <li>Time spent on different sections</li>
                  <li>Browser type and device information</li>
                  <li>General location (city/region level only)</li>
                  <li>Error messages and app performance data</li>
                </ul>
              </div>

              <div>
                <h3 className="text-brand-text font-medium mb-2">What We Never Collect:</h3>
                <ul className="list-disc list-inside space-y-1 text-brand-textGrey text-sm">
                  <li>Your saved locations or addresses</li>
                  <li>Personal messages or communication</li>
                  <li>Financial information</li>
                  <li>Precise GPS coordinates</li>
                  <li>Information that can personally identify you</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Privacy Resources */}
          <div className="card">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-green-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-brand-text mb-2">Privacy Resources</h2>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                to="/privacy"
                className="block p-4 rounded-lg bg-brand-inputBackground hover:bg-brand-inputBackground/80 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-brand-text font-medium">Privacy Policy</h3>
                    <p className="text-brand-textGrey text-sm mt-1">
                      Read our complete privacy policy
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-brand-textGrey" />
                </div>
              </Link>

              <Link
                to="/terms"
                className="block p-4 rounded-lg bg-brand-inputBackground hover:bg-brand-inputBackground/80 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-brand-text font-medium">Terms of Service</h3>
                    <p className="text-brand-textGrey text-sm mt-1">
                      View our terms and conditions
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-brand-textGrey" />
                </div>
              </Link>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
