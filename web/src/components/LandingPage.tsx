import { Link } from 'react-router-dom';
import { Shield, Cloud, MapPin, Bell, TrendingUp, Users, Smartphone, ArrowRight, Check } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { SEO } from './SEO';
import { CookieConsentBanner } from './CookieConsentBanner';

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://www.circleoverwatch.com/',
    },
  ],
};

const FEATURES = [
  {
    icon: Shield,
    title: 'Crime Alerts',
    description: 'Real-time street-level crime data from Police.uk API. Stay informed about incidents in your area.',
    color: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
  },
  {
    icon: Cloud,
    title: 'Weather Warnings',
    description: 'Live flood alerts and severe weather warnings from the Environment Agency and Met Office.',
    color: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
  },
  {
    icon: MapPin,
    title: 'Location Tracking',
    description: 'Monitor multiple postcodes and receive personalized risk assessments for each location.',
    color: 'bg-purple-500/20',
    iconColor: 'text-purple-400',
  },
  {
    icon: Bell,
    title: 'Threat Level Updates',
    description: 'Official UK terrorism threat level from MI5, updated in real-time with expert analysis.',
    color: 'bg-red-500/20',
    iconColor: 'text-red-400',
  },
  {
    icon: TrendingUp,
    title: 'Risk Analytics',
    description: 'Comprehensive risk scoring combining crime, weather, and threat data for your areas.',
    color: 'bg-green-500/20',
    iconColor: 'text-green-400',
  },
  {
    icon: Users,
    title: 'Community Safety',
    description: 'Protect your family, business, and community with actionable intelligence.',
    color: 'bg-brand-primary/20',
    iconColor: 'text-brand-primary',
  },
];

export function LandingPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      <CookieConsentBanner />
      <SEO
        title="Real-time UK Threat Intelligence"
        description="Monitor terrorism threats, crime patterns, weather warnings, and security alerts across the United Kingdom in real-time."
        canonical="/"
        jsonLd={BREADCRUMB_SCHEMA}
      />
      <Header variant="landing" />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-transparent to-brand-secondary/5" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-darkBlue/20 via-transparent to-transparent" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
            <div className="text-center max-w-4xl mx-auto">
              {/* Logo mark */}
              <div className="flex justify-center mb-8">
                <img
                  src="/brand/Logo_mark_CUKG.png"
                  alt="Circle Overwatch"
                  className="h-20 w-auto"
                />
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-brand-text mb-6 leading-tight">
                Stay Ahead of
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
                  Every Threat
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-brand-textGrey mb-10 max-w-2xl mx-auto">
                Real-time crime, weather, and security intelligence for the United Kingdom.
                Protect what matters most with Circle Overwatch.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/signup"
                  className="btn-primary text-lg px-8 py-3 flex items-center justify-center gap-2"
                >
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/login"
                  className="btn-secondary text-lg px-8 py-3"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-brand-inputBackground/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4">
                Comprehensive Risk Intelligence
              </h2>
              <p className="text-lg text-brand-textGrey max-w-2xl mx-auto">
                Everything you need to monitor threats and protect your community, all in one platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((feature, index) => (
                <div
                  key={index}
                  className="card hover:border-brand-primary/30 transition-all duration-300 group"
                >
                  <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-7 w-7 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-brand-text mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-brand-textGrey text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mobile App Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="card border-brand-primary/20 overflow-hidden">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="p-8 md:p-12">
                  <div className="flex items-center gap-3 mb-6">
                    <Smartphone className="h-8 w-8 text-brand-primary" />
                    <span className="text-sm font-semibold text-brand-primary uppercase tracking-wide">
                      Mobile App
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4">
                    Circle Overwatch on the Go
                  </h2>
                  <p className="text-brand-textGrey mb-8">
                    Get instant push notifications for crime alerts, weather warnings, and threat level changes.
                    Monitor your saved locations from anywhere with our native iOS and Android apps.
                  </p>

                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <Check className="h-5 w-5 text-brand-primary" strokeWidth={2} />
                      </div>
                      <span className="text-brand-textGrey">
                        <strong className="text-brand-text">Real-time Push Notifications</strong> - Instant alerts for crime, weather warnings, and threat level changes
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <Check className="h-5 w-5 text-brand-primary" strokeWidth={2} />
                      </div>
                      <span className="text-brand-textGrey">
                        <strong className="text-brand-text">Multi-location Monitoring</strong> - Track all your saved locations from anywhere
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <Check className="h-5 w-5 text-brand-primary" strokeWidth={2} />
                      </div>
                      <span className="text-brand-textGrey">
                        <strong className="text-brand-text">Native Experience</strong> - Fast, reliable apps built specifically for iOS and Android
                      </span>
                    </li>
                  </ul>

                  <div className="flex flex-wrap gap-4">
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
                <div className="flex items-center justify-center p-8">
                  <img
                    src="/icons/Logo_mark_CUKG.png"
                    alt="Circle Overwatch App"
                    className="w-64 h-64 rounded-3xl border-4 border-white shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-brand-darkBlue to-brand-primary">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Start Protecting Your Community Today
            </h2>
            <p className="text-xl text-white/80 mb-10">
              Join thousands of UK residents who trust Circle Overwatch for real-time safety intelligence.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-white text-brand-darkBlue px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Create Free Account
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
