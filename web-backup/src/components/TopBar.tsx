import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

const formatDateTime = (value: Date) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(value);

export function TopBar() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return (
    <header className="bg-[#1a1a2e] border-b border-white/10">
      <div className="mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandLogo variant="full" linkTo="/dashboard" />

        <div className="flex items-center gap-3 sm:gap-4 text-white">
          <p className="text-xs sm:text-sm text-white/80">{formatDateTime(now)}</p>
          <Link
            to="/settings"
            aria-label="Open settings"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
