import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  variant?: 'full' | 'mark';
  className?: string;
  linkTo?: string;
  showText?: boolean;
}

export function BrandLogo({ 
  variant = 'full', 
  className = '', 
  linkTo = '/',
  showText = true 
}: BrandLogoProps) {
  const logoContent = (
    <div className={`flex items-center gap-3 ${className}`}>
      {variant === 'full' ? (
        <>
          {/* Full logo for desktop */}
          <img 
            src="/brand/Logo_white-ovewatch.png" 
            alt="Circle Overwatch" 
            className="h-10 w-auto hidden sm:block"
          />
          {/* Mark only for mobile */}
          <img 
            src="/brand/Logo_mark_CUKG.png" 
            alt="Circle Overwatch" 
            className="h-10 w-auto sm:hidden"
          />
        </>
      ) : (
        <img 
          src="/brand/Logo_mark_CUKG.png" 
          alt="Circle Overwatch" 
          className="h-10 w-auto"
        />
      )}
      {showText && variant === 'mark' && (
        <div className="hidden sm:block">
          <h1 className="text-xl font-bold text-brand-text">Circle Overwatch</h1>
          <p className="text-xs text-brand-textGrey">Protecting your community</p>
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="flex items-center hover:opacity-90 transition-opacity">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}





















