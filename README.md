# LiveSite

**A real-time, serverless web application for programming contest spectators.**

LiveSite provides an animated, responsive standings viewer for programming contests. Originally created for ICPC contests in Japan and Asia Pacific.

🌐 **Live Examples:**
- [ICPC Asia Regional Contest (Japan)](https://icpcsec.firebaseapp.com/)
- [ICPC Asia Pacific Championship Contest](https://icpcapac.firebaseapp.com/)

## Features

- ✨ **Animated Standings**: Real-time updates with smooth rank changes and problem status animations
- 🏆 **Award Ceremony Mode**: Progressive reveal animation for result announcements
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🔥 **Serverless Architecture**: Runs entirely on Firebase (Hosting + Realtime Database + GCS)
- 🎨 **Customizable**: Dark mode, team photos, country flags, and more
- 📊 **Scoreboard Freeze**: Shows pending submissions during frozen period
- 🚀 **Easy Setup**: Automated scraping from DOMjudge scoreboards

## How It Works

LiveSite uses a unique architecture that eliminates the need for dedicated servers:

```
┌─────────────┐       ┌──────────────┐       ┌──────────────┐
│  DOMjudge   │──────▶│   Scraper    │──────▶│   Firebase   │
│  Contest    │       │  (Python)    │       │  + GCS       │
└─────────────┘       └──────────────┘       └──────┬───────┘
                                                    │
                                                    ▼
                                             ┌──────────────┐
                                             │  Viewers     │
                                             │  (React SPA) │
                                             └──────────────┘
```

1. **Python scraper** polls DOMjudge scoreboard every 10 seconds
2. **Firebase Realtime Database** stores URLs to contest data (pub/sub)
3. **Google Cloud Storage** hosts the actual JSON files (standings, teams, contest info)
4. **React frontend** subscribes to Firebase and displays animated standings

## Quick Start

### 1. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Python client (for scraping)
cd ../client
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Run Local Development Server

```bash
cd frontend
npm run serve
```

This starts Firebase emulators and opens http://localhost:5000 with demo data.

### 3. Test with Your Contest Data

See the **[Setup Guide](doc/SETUP.md)** for detailed instructions on preparing your contest data and connecting to DOMjudge.

## Documentation

Comprehensive guides are available in the `doc/` directory:

- **[SETUP.md](doc/SETUP.md)** - Local setup and testing (no cloud required)
- **[DEPLOYMENT.md](doc/DEPLOYMENT.md)** - Production deployment to Firebase
- **[REVEAL.md](doc/REVEAL.md)** - Award ceremony reveal animation setup
- **[examples/](doc/examples/)** - Sample configuration files

## Key Requirements

### Prerequisites

- **Node.js** and npm
- **Python 3** (for client scraper)
- **Google Account** with Firebase/GCP project (for production)
- **DOMjudge** or compatible contest system

### Important Configuration

⚠️ **Before deployment**, you must update `frontend/src/siteconfig.ts` with your Firebase project configuration. See [DEPLOYMENT.md](doc/DEPLOYMENT.md#firebase-setup) for details.

### DOMjudge Team Naming Convention

When using the default scraper, team names in DOMjudge must follow this format: `{id}: {name}`

Examples:
- ✅ `01: TeamA`
- ✅ `02: Awesome Coders`
- ✅ `10: Team Ten`
- ❌ `TeamA` (missing ID)
- ❌ `Team 01` (ID not before colon)

This allows the scraper to link teams between DOMjudge and your team data. See [SETUP.md](doc/SETUP.md#preparing-contest-data) for more details.

## Architecture Overview

### Frontend (React/Redux)
- **React** with TypeScript
- **Redux** for state management
- **Firebase Realtime Database** for live data sync
- **Material Design Bootstrap** for UI

### Client (Python)
- **Beautiful Soup** for HTML parsing
- **Google Cloud SDK** for Firebase/GCS integration
- **Scrapers** for DOMjudge

### Data Flow
1. Scraper fetches HTML from DOMjudge
2. Parses and converts to JSON
3. Uploads to Google Cloud Storage
4. Updates Firebase Database with GCS URL
5. Frontend receives update via Firebase listener
6. Diffs standings to compute events (AC/WA/pending)
7. Animates UI changes

## Common Commands

```bash
# Frontend development
cd frontend
npm run serve          # Start dev server with emulators
npm run build          # Build for production
npm run lint           # Lint TypeScript/React code
npm test               # Run smoke tests

# Python client
cd client
python livecli.py setup                           # Authenticate with Google
python livecli.py upload contest.yaml teams.yaml  # Upload contest data
python livecli.py scrape domjudge --scoreboard-url=...  # Scrape DOMjudge

# Firebase deployment
cd frontend
firebase deploy --only hosting   # Deploy frontend
firebase deploy --only database  # Deploy database rules
```

## Sample Contest Data

Example configuration files are provided in `doc/examples/`:
- `contest.yaml` - Contest metadata and front page HTML
- `teams.yaml` - Team information with members and photos

## Contributing

Contributions are welcome! You can help by:

- **Reporting issues**: Found a bug or have a feature request? [Open an issue](https://github.com/icpcsec/livesite/issues)
- **Contributing code**:
  1. Fork the repository
  2. Create a feature branch
  3. Make your changes
  4. Test thoroughly (local dev + production if possible)
  5. Submit a pull request
