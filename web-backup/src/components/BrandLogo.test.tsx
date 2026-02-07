import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';

describe('BrandLogo', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <BrandLogo variant="full" />
      </BrowserRouter>
    );
  });

  it('renders with mark variant', () => {
    render(
      <BrowserRouter>
        <BrandLogo variant="mark" />
      </BrowserRouter>
    );
  });

  it('renders link with correct href when linkTo is provided', () => {
    render(
      <BrowserRouter>
        <BrandLogo variant="full" linkTo="/dashboard" />
      </BrowserRouter>
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/dashboard');
  });
});
