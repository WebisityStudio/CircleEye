# Circle Eye 👁️

**Point your camera. Walk your site. Get your risk assessment. Done.**

A real-time AI-powered site inspection app that uses Google Gemini's Live API to provide instant safety and risk assessment feedback as you walk through construction sites, warehouses, or any facility.

## Features

- **Live AI Analysis**: Real-time safety and risk detection as you walk
- **Voice Interaction**: Hands-free operation with voice commands
- **Instant Reports**: Professional PDF reports generated automatically
- **GDPR Compliant**: Video streams are processed in real-time, never stored
- **Inspector Accountability**: Reports include inspector details and acknowledgment

## Tech Stack

- **Frontend**: React Native with Expo
- **Navigation**: Expo Router
- **Backend**: Supabase (Auth, Database, Storage)
- **AI**: Google Gemini Live API
- **State Management**: Zustand
- **PDF Generation**: Expo Print

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- Supabase account
- Google AI (Gemini) API key

### Installation

1. Clone the repository:
   ```bash
   cd CircleAIInspector
   npm install
   ```

2. Create a Supabase project at [supabase.com](https://supabase.com)

3. Run the database migration:
   - Go to Supabase Dashboard → SQL Editor
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Run the migration

4. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
   ```

5. Start the development server:
   ```bash
   npm start
   ```

6. Scan the QR code with Expo Go app (iOS/Android) or press `a` for Android emulator / `i` for iOS simulator

## Project Structure

```
CircleEye/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout
│   ├── index.tsx           # Home screen
│   ├── auth/               # Authentication screens
│   ├── inspection/         # Inspection screens
│   └── history/            # History & reports screens
├── src/
│   ├── components/         # Reusable UI components
│   ├── config/             # App configuration
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API and external services
│   ├── stores/             # Zustand state stores
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── supabase/
│   └── migrations/         # Database migrations
└── assets/                 # Images and static assets
```

## Key Files

| File | Description |
|------|-------------|
| `src/services/geminiLive.ts` | Gemini Live API WebSocket client |
| `src/services/sessions.ts` | Inspection session management |
| `src/services/location.ts` | GPS and reverse geocoding |
| `src/utils/reportExport.ts` | PDF report generation |
| `app/inspection/[sessionId].tsx` | Live inspection camera screen |

## How It Works

1. **User signs in** and taps "Start Inspection"
2. **GPS location** is captured and reverse geocoded
3. **User enters site name** and starts inspection
4. **Camera streams** to Gemini Live API via WebSocket
5. **AI speaks findings** in real-time as hazards are detected
6. **User can ask questions** using voice
7. **Session ends** and PDF report is generated
8. **Report is shared** via email or saved locally

## Database Schema

- `user_profiles` - User account information
- `inspection_sessions` - Inspection session records
- `session_findings` - Individual findings from inspections
- `inspection_reports` - Generated report metadata

## Security & Privacy

- **Authentication**: Supabase Auth with JWT
- **Row Level Security**: Users can only access their own data
- **GDPR Compliant**: Video is streamed, not stored
- **Inspector Accountability**: Reports include inspector name/email

## Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production
```

## Contributing

This project is developed for Circle UK Group. For contributions, please contact the development team.

## License

Proprietary - Circle UK Group

---

👁️ **Circle Eye** - Built with Gemini AI by Circle UK Group
