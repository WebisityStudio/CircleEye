# Settings Page Implementation Plan

## Overview
This plan outlines the implementation of functional settings features in the web app to match the mobile app functionality. Currently, most settings items show "Coming Soon" - we need to implement the actual features.

## Current State Analysis

### Web App Settings (src/components/SettingsPage.tsx)
- ✅ Settings page layout exists with all menu items
- ✅ Privacy Policy and Terms of Use links work
- ✅ Logout functionality works
- ✅ Delete Account placeholder exists
- ❌ Edit Profile - Coming Soon
- ❌ Refer a Friend - Coming Soon
- ❌ Analytics & Privacy - Coming Soon
- ❌ Notification Settings - Coming Soon
- ❌ About App - Coming Soon

### Mobile App Settings Features Found
Based on exploration of the mobile app codebase, the following features are implemented:

1. **Edit Profile** (`settingsTab/editProfile.tsx`)
   - First Name, Last Name fields
   - Company Name (optional)
   - Phone Number (optional)
   - Stores in `user_profiles` table
   - Fields: `first_name`, `last_name`, `company_name`, `phone_number`, `profile_image_url`

2. **Notification Settings** (`settingsTab/notificationSetting.tsx`)
   - Toggle for Weather Warning notifications
   - Toggle for Crime Reference notifications
   - Stores in `user_preferences` table with keys:
     - `notifications.weather_warning`
     - `notifications.crime_reference`
   - Also updates `notification_permission` in `user_profiles`

3. **Analytics & Privacy** (`settingsTab/analyticsSettings.tsx`)
   - Toggle to enable/disable Firebase Analytics
   - Stored in local device preferences (AsyncStorage)
   - Web equivalent would use localStorage

4. **Refer a Friend** (`settingsTab/referFriend.tsx`)
   - Shows referral link
   - Copy to clipboard functionality
   - Share via social media (adapted for web)

5. **About App** (`settingsTab/aboutApp.tsx`)
   - App name and version
   - Description
   - Links to Privacy Policy and Terms of Use

### Database Schema Available

**user_profiles table:**
- `id` (user auth id)
- `email`
- `first_name`
- `last_name`
- `company_name`
- `phone_number`
- `profile_image_url`
- `notification_permission` (boolean)
- `selected_language`
- `selected_video_language`
- `user_role`
- Other fields...

**user_preferences table:**
- `id`
- `user_id`
- `preference_key` (string)
- `preference_value` (string)
- `preference_type` (string)
- `category` (string)
- `description`

### Existing DB Functions in Web App (src/supabase/db.ts)
✅ `getUserProfile(userId)` - Get user profile
✅ `updateUserProfile(userId, updates)` - Update user profile
✅ `upsertUserProfile(profile)` - Upsert user profile
✅ `getUserPreferences(userId, category?)` - Get preferences
✅ `getUserPreference(userId, key)` - Get single preference
✅ `setUserPreference(preference)` - Set/update preference
✅ `updateUserPreference(id, updates)` - Update preference

## Implementation Plan

### Phase 1: Create Individual Settings Pages

#### 1.1 Edit Profile Page
**File:** `src/components/settings/EditProfilePage.tsx`

**Features:**
- Form with fields:
  - First Name (required)
  - Last Name (required)
  - Company Name (optional)
  - Phone Number (optional)
- Validation for required fields
- Load existing profile data on mount
- Save button that updates `user_profiles` table
- Success notification on save
- Back button to return to settings

**Route:** `/settings/edit-profile`

**Database Operations:**
- Load: `getUserProfile(userId)`
- Save: `updateUserProfile(userId, { first_name, last_name, company_name, phone_number })`

#### 1.2 Notification Settings Page
**File:** `src/components/settings/NotificationSettingsPage.tsx`

**Features:**
- Toggle switches for:
  - Weather Warnings
  - Crime Alerts
- Description text explaining what notifications do
- Save button to persist changes
- Load current preferences on mount
- Success notification on save

**Route:** `/settings/notifications`

**Database Operations:**
- Load: `getUserPreferences(userId)` filtering for notification keys
- Save:
  - `setUserPreference({ user_id, preference_key: 'notifications.weather_warning', preference_value: 'true/false', preference_type: 'boolean' })`
  - `setUserPreference({ user_id, preference_key: 'notifications.crime_reference', preference_value: 'true/false', preference_type: 'boolean' })`
  - `updateUserProfile(userId, { notification_permission: anyEnabled })`

#### 1.3 Analytics & Privacy Page
**File:** `src/components/settings/AnalyticsPrivacyPage.tsx`

**Features:**
- Toggle switch for analytics
- Explanation text about what data is collected
- Uses localStorage (web-specific) instead of database
- Instant save on toggle
- Link to Privacy Policy

**Route:** `/settings/analytics-privacy`

**Storage:**
- localStorage key: `circleoverwatch_analytics_enabled`
- Default: `true`

#### 1.4 Refer a Friend Page
**File:** `src/components/settings/ReferFriendPage.tsx`

**Features:**
- Display referral link (configurable URL)
- Copy to clipboard button
- Share button using Web Share API (if supported)
- Fallback to copy if Web Share API not available
- Social media share buttons (optional)

**Route:** `/settings/refer-friend`

**Referral Link Format:**
`https://circleoverwatch.com/signup?ref={userId}`

#### 1.5 About App Page
**File:** `src/components/settings/AboutPage.tsx`

**Features:**
- App name: "Circle Overwatch Web"
- App version: "1.0.0" (from package.json)
- Description of the app
- Links to:
  - Privacy Policy
  - Terms of Use
- Copyright information

**Route:** `/settings/about`

### Phase 2: Update Main Settings Page

**File:** `src/components/SettingsPage.tsx`

**Changes:**
- Remove `comingSoon: true` from relevant settings
- Update `to` paths to point to new pages:
  - Edit Profile: `/settings/edit-profile`
  - Refer a Friend: `/settings/refer-friend`
  - Analytics & Privacy: `/settings/analytics-privacy`
  - Notification Settings: `/settings/notifications`
  - About App: `/settings/about`
- Remove the disabled state and opacity for these items

### Phase 3: Update Routing

**File:** `src/routes/AppRoutes.tsx`

**Add new routes:**
```tsx
<Route path="/settings/edit-profile" element={<RequireAuth><EditProfilePage /></RequireAuth>} />
<Route path="/settings/notifications" element={<RequireAuth><NotificationSettingsPage /></RequireAuth>} />
<Route path="/settings/analytics-privacy" element={<RequireAuth><AnalyticsPrivacyPage /></RequireAuth>} />
<Route path="/settings/refer-friend" element={<RequireAuth><ReferFriendPage /></RequireAuth>} />
<Route path="/settings/about" element={<RequireAuth><AboutPage /></RequireAuth>} />
```

### Phase 4: Create Shared Components (if needed)

#### 4.1 Settings Page Wrapper
**File:** `src/components/settings/SettingsPageWrapper.tsx`

**Purpose:** Consistent layout for all settings sub-pages
- Header with back button
- Title
- Content area
- Optional Save button

#### 4.2 Form Components
Reuse existing components or create:
- Input fields (likely already exist)
- Toggle switches
- Buttons

## Design Consistency

### UI/UX Patterns
1. **Color Scheme:** Use existing Tailwind brand colors
   - `brand-primary` - Primary actions, highlights
   - `brand-background` - Page background
   - `brand-inputBackground` - Form inputs, cards
   - `brand-text` - Primary text
   - `brand-textGrey` - Secondary text
   - `brand-error` - Error states, delete actions

2. **Layout:**
   - Max width container (max-w-2xl)
   - Consistent padding (px-4 sm:px-6 lg:px-8)
   - Card-based design with `.card` class
   - Responsive design (mobile-first)

3. **Form Validation:**
   - Required field indicators
   - Inline error messages
   - Disabled save button until valid

4. **Feedback:**
   - Success notifications after saves
   - Loading states during API calls
   - Error handling with user-friendly messages

### Accessibility
- Proper form labels
- Keyboard navigation
- Focus states
- ARIA attributes where needed
- Color contrast compliance

## Technical Considerations

### State Management
- Use React hooks (useState, useEffect)
- Leverage AuthContext for user data
- Local state for form data
- Consider React Hook Form for complex forms (EditProfile)

### Error Handling
- Try-catch blocks for async operations
- User-friendly error messages
- Fallback UI for failed loads
- Retry mechanisms where appropriate

### Performance
- Lazy load settings pages (React.lazy)
- Debounce save operations if needed
- Optimize re-renders
- Cache user preferences

### Security
- Validate user ownership (user can only edit their own profile)
- Sanitize inputs
- RLS (Row Level Security) policies in Supabase should be verified
- CSRF protection (handled by Supabase SDK)

## Testing Strategy

### Manual Testing Checklist
1. **Edit Profile:**
   - [ ] Load existing data correctly
   - [ ] Validate required fields
   - [ ] Save updates successfully
   - [ ] Show success message
   - [ ] Navigate back to settings

2. **Notification Settings:**
   - [ ] Load current preferences
   - [ ] Toggle switches work
   - [ ] Save preferences
   - [ ] Reflect changes in notification behavior

3. **Analytics & Privacy:**
   - [ ] Toggle works
   - [ ] Persists to localStorage
   - [ ] Loads saved preference

4. **Refer a Friend:**
   - [ ] Display correct referral link
   - [ ] Copy to clipboard works
   - [ ] Share functionality (if supported)

5. **About App:**
   - [ ] Display correct version
   - [ ] Links work
   - [ ] Information is accurate

### Integration Testing
- Ensure all routes work
- Test navigation flow
- Verify database operations
- Test with different user states

## Deployment Considerations

### Environment Variables
Add to `.env` and `.env.example`:
```
VITE_APP_VERSION=1.0.0
VITE_REFERRAL_BASE_URL=https://circleoverwatch.com/signup
```

### Database Migrations
No new tables needed, but verify:
- RLS policies allow users to read/write their own preferences
- RLS policies allow users to update their own profiles

### Documentation
- Update README with new features
- Document preference keys used
- Add JSDoc comments to functions

## Timeline Estimate

1. **Phase 1:** Create settings pages (4-6 hours)
   - Edit Profile: 1.5 hours
   - Notification Settings: 1 hour
   - Analytics & Privacy: 0.5 hours
   - Refer a Friend: 1 hour
   - About App: 0.5 hours

2. **Phase 2:** Update main settings page (0.5 hours)

3. **Phase 3:** Update routing (0.5 hours)

4. **Phase 4:** Testing & polish (2 hours)

**Total:** ~7-9 hours

## Success Criteria

- ✅ All "Coming Soon" badges removed from working features
- ✅ Users can edit their profile information
- ✅ Users can configure notification preferences
- ✅ Users can control analytics preferences
- ✅ Users can access referral functionality
- ✅ Users can view app information
- ✅ All features persist data correctly
- ✅ UI is consistent with existing design
- ✅ Mobile responsive
- ✅ No console errors
- ✅ Proper error handling throughout

## Future Enhancements (Out of Scope)

- Profile image upload
- Email notification preferences
- Theme/appearance settings
- Language selection
- More granular privacy controls
- Referral rewards tracking
- In-app feedback form
