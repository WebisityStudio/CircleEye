# Circle Overwatch - Web & Mobile Alignment

This document summarizes the changes made to align the web app with the mobile app.

## ✅ Completed Changes

### 1. Branding & Theme Alignment
- **Tailwind Config**: Extended with brand colors from the mobile app palette
  - `brand-primary`, `brand-secondary`, `brand-background`, `brand-text`, etc.
- **Global CSS**: Added Nunito font family (from Google Fonts) matching the mobile app
- **Brand Assets**: Copied logos from the mobile app assets to `public/brand/`
- **BrandLogo Component**: Created reusable logo component with responsive variants

### 2. Navigation & Layout
- **Header**: Refactored with BrandLogo, responsive nav, user greeting, brand colors
- **Footer**: Updated with BrandLogo, Circle Overwatch branding, mobile app badges
- **Routing**: Updated to show landing page at `/`, dashboard at `/app`, settings at `/settings`

### 3. Landing Page
- **New LandingPage**: Public marketing page with:
  - Hero section with Circle Overwatch branding
  - Feature grid showcasing capabilities
  - Mobile app promotion with store badges
  - CTAs for sign up/sign in

### 4. Settings Page
- **SettingsPage**: Mirrors mobile app settings structure with:
  - User profile header
  - Settings options (Edit Profile, Privacy, Terms, Logout, etc.)
  - Coming Soon states for future features
  - Consistent styling with mobile app

### 5. API & Environment Variables
- **`.env.example`**: Created with all VITE_* env vars
- **Updated Code**:
  - `src/lib/crime.ts`: Uses **Google Maps Geocoding API** for postcode lookups and `VITE_POLICE_API_BASE` for crime data
  - `src/components/WeatherAlertsCard.tsx`: Uses `VITE_ENV_AGENCY_FLOOD_ENDPOINT`
  - `src/lib/threat.ts`: Prepared for `VITE_GOVUK_THREAT_ENDPOINT`
  - `src/supabase/client.ts`: Already uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### 6. Additional Pages
- **TermsOfService**: New page with Circle Overwatch terms
- **PrivacyPolicy**: Updated with Header/Footer and brand colors

## 🎨 Brand Colors (Tailwind)

```css
brand-primary: #1785d1       /* Primary theme color */
brand-secondary: #1bbce6     /* Secondary theme color */
brand-background: #141414    /* Dark background */
brand-text: #f8f8f8          /* Primary text */
brand-textGrey: #8d8d8d      /* Secondary text */
brand-inputBackground: #1d1d1d
brand-darkBlue: #18487f
```

## 📱 Shared Assets

Logo files in `public/brand/`:
- `Logo_white-ovewatch.png` - Full logo (desktop)
- `Logo_mark_blueCUKG.png` - Logo mark (mobile)
- `AppStore.png` - App Store badge
- `google-play-download-android-app-logo.svg` - Google Play badge

## 🔑 API Configuration

### Google Maps API (Required for Postcodes)
The app uses **Google Maps Geocoding API** for UK postcode lookups instead of Postcodes.io.

**Setup Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Create a new project or select existing one
3. Enable the **Geocoding API**
4. Create an API key under "Credentials"
5. **Restrict the API key** for security:
   - Application restrictions: Set HTTP referrers (websites) - add your domain(s)
   - API restrictions: Select "Restrict key" and enable only "Geocoding API"
6. Add the key to your `.env` file as `VITE_GOOGLE_MAPS_API_KEY`

### Other APIs
- **Police.uk API**: No authentication required (public data)
- **Environment Agency**: No authentication required (open data)
- **Supabase**: Get credentials from your Supabase project dashboard

## 🚀 Next Steps

1. Copy `.env.example` to `.env`
2. Add your **Google Maps API key** (required for postcode lookups)
3. Add your **Supabase credentials**
4. Run `npm install` to ensure all dependencies are installed
5. Run `npm run dev` to start the development server
6. Visit `http://localhost:5173` to see the new landing page

## 📂 New/Modified Files

**New:**
- `src/components/BrandLogo.tsx`
- `src/components/LandingPage.tsx`
- `src/components/SettingsPage.tsx`
- `src/components/TermsOfService.tsx`
- `.env.example`

**Modified:**
- `tailwind.config.js` - Brand colors and fonts
- `src/index.css` - Nunito font import and utilities
- `src/components/Header.tsx` - Branding and navigation
- `src/components/Footer.tsx` - Branding and mobile app badges
- `src/components/Home.tsx` - Brand colors
- `src/components/PrivacyPolicy.tsx` - Header/Footer and brand colors
- `src/routes/AppRoutes.tsx` - New routes
- `src/App.tsx` - Use full routing
- `src/lib/crime.ts` - **Google Maps Geocoding API** for postcodes
- `src/lib/threat.ts` - Environment variables
- `src/components/WeatherAlertsCard.tsx` - Environment variables and brand colors

**Assets:**
- `public/brand/` - Logo and store badge images

## 🔐 Security Note

Remember that `VITE_GOOGLE_MAPS_API_KEY` is exposed to the client side. Always:
- Restrict the key by HTTP referrer in Google Cloud Console
- Limit to only the APIs you need (Geocoding API only)
- Monitor usage in Google Cloud Console
- Consider using a backend proxy for production if you need additional security
