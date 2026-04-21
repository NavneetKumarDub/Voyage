# Voyage

Mood-based, comic-style travel planning built with React and Vite.

Live Demo: https://voyage-sable.vercel.app

Voyage turns a mood prompt into a one-day travel story with stop-by-stop panels, maps, weather context, voice narration, and optional cloud sync.

## What This Project Does

- Generates a mood-driven itinerary (AI first, local fallback when AI is unavailable)
- Renders the plan as comic panels with transitions and stylized narration
- Supports map/location context and weather-aware planning
- Includes journey tracking, saved comics, and share/invite flows
- Offers Google sign-in + Firestore sync when Firebase is configured
- Works in local-only mode with localStorage when Firebase is not configured

## Tech Stack

- React 18
- Vite 5
- React Router
- Tailwind CSS
- Framer Motion
- Leaflet + React Leaflet
- Firebase Auth + Firestore
- Groq API (itinerary generation)

## Quick Start

### 1) Install dependencies

```bash
npm install
```

### 2) Create local environment file

Create a file named `.env.local` in the project root.

Use this template:

```dotenv
# Required for AI itinerary generation
VITE_GROQ_API_KEY=your_groq_api_key

# Optional: enables authentication and cloud sync
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3) Run development server

```bash
npm run dev
```

Open the local URL shown in the terminal (usually http://localhost:5173).

## Available Scripts

```bash
npm run dev      # Start local dev server
npm run build    # Create production build in dist/
npm run preview  # Preview the production build locally
```

## Environment Behavior

- If `VITE_GROQ_API_KEY` is missing, Voyage uses local fallback itinerary data.
- If Firebase variables are missing, auth + cloud features are disabled and the app continues in local-only mode.
- Minimum Firebase readiness check uses API key, project ID, and app ID.

## Project Structure

```text
src/
  components/   # Reusable UI blocks (comic panels, map, nav, sharing, etc.)
  context/      # Global app state (auth and voyage state)
  data/         # Presets and fallback data
  hooks/        # Custom hooks (for example, local storage helpers)
  pages/        # Route-level screens
  services/     # API and integration layer (Groq, Firebase, weather, location)
  styles/       # Comic-specific styling
```

## Core Flow

1. User picks mood, city, and persona preferences.
2. App generates itinerary through Groq API (or fallback data).
3. Weather data is fetched and merged into the trip context.
4. User is navigated to comic view and can refine, narrate, save, or share.
5. If authenticated, data syncs to Firestore and invitations/journeys update in realtime.

## Feature Highlights

- Mood-based itinerary generation
- Refine itinerary using natural-language prompts
- Comic-style journey rendering with panel storytelling
- Reader/editor modes
- Voice narration support
- Trip invitations and collaborative journey participation
- Journey progress tracking and history
- Saved gallery and photo album workflows

## Build For Production

```bash
npm run build
```

Production files are generated in `dist/`.

## Security Notes

- Never commit `.env.local`.
- Treat API keys as secrets and rotate any key that has been exposed.
- Use Firebase security rules appropriate for your deployment.

## Known Limitations

- No backend server in this repository; external APIs are called from the client.
- AI output quality depends on provider uptime and response quality.
- Geolocation/map/weather behavior may vary by browser and permissions.

## Troubleshooting

### Blank or fallback-only itinerary

- Verify `VITE_GROQ_API_KEY` is present and valid.
- Check browser devtools network tab for failed API requests.

### Auth/sign-in not available

- Ensure Firebase environment variables are set correctly.
- Confirm Firebase project has Google sign-in enabled.

### Map or location issues

- Confirm browser location permissions are granted.
- Retry after refreshing with network enabled.

## Contributing

1. Create a feature branch.
2. Make focused changes.
3. Build and verify locally.
4. Open a pull request with a clear summary.

## License

No license file is currently defined in this repository.