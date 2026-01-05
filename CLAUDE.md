# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

LiveSite is a serverless web application for displaying real-time programming contest standings. It consists of:
- **Frontend**: React/Redux SPA hosted on Firebase
- **Client**: Python CLI tool (`livecli`) that scrapes contest data and uploads to Firebase/GCS
- Built for ICPC contests in Japan and Asia Pacific

## Documentation

Comprehensive guides are in the `doc/` directory:
- **[doc/SETUP.md](doc/SETUP.md)** - Local development setup (no cloud dependencies)
- **[doc/DEPLOYMENT.md](doc/DEPLOYMENT.md)** - Production deployment to Firebase
- **[doc/REVEAL.md](doc/REVEAL.md)** - Award ceremony reveal animation
- **[doc/ADVANCED.md](doc/ADVANCED.md)** - Advanced topics (custom scrapers)
- **[doc/examples/](doc/examples/)** - Sample contest.yaml and teams.yaml files

## Common Commands

### Frontend Development

```bash
# Install dependencies (first time setup)
cd frontend
npm install

# Run local development server with Firebase emulators
npm run serve
# Starts Firebase emulators (database at localhost:9000, hosting at localhost:5000)
# Loads demo data from frontend/public/demodata/

# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run format
npm run format:check

# Run tests (smoke tests via Cypress)
npm test

# Deploy to Firebase
npm run deploy
```

### Python Client Development

```bash
cd client

# Install dependencies (use venv)
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run livecli commands
python livecli.py setup                    # Authenticate with Google OAuth
python livecli.py verify-credentials       # Check permissions
python livecli.py upload <files...>        # Upload contest data to production

# Local scraping (writes to frontend/public/.dev/)
python livecli.py scrape domjudge --scoreboard-url=<url> --local

# Production scraping (uploads to GCS)
python livecli.py scrape domjudge --scoreboard-url=<url> --interval-seconds=10
```

### Utility Scripts

```bash
cd scripts

# Generate reveal data for awards ceremony
./make_reveal.py standings.json > reveal.json

# Create initial empty standings
./make_init_standings.py

# Generate teams.json from CSV
./make_teams_from_csv.py teams.csv > teams.json

# Extract standings from logs
./extract_standings.py

# Replay contest from logs
./play_logs.py
```

## Architecture

### System Overview

LiveSite uses Firebase as a pub/sub system pointing to GCS-hosted JSON files:

```
Contest Admin Machine          Firebase Realtime DB       Viewer Browsers
┌──────────────────┐          ┌──────────────────┐      ┌─────────────┐
│  livecli scrape  │──┐       │ /feeds/          │      │  React SPA  │
│  (Python)        │  │       │   contest: URL   │◄─────│  (Firebase  │
└──────────────────┘  │       │   standings: URL │      │   listeners)│
                      │       │   teams: URL     │      └─────────────┘
                      ▼       └──────────────────┘              │
           Google Cloud Storage                                 │
           ┌────────────────────┐                               │
           │ contest.123.json   │◄──────────────────────────────┘
           │ standings.123.json │        (axios fetch)
           │ teams.123.json     │
           └────────────────────┘
```

### Data Flow

1. **Setup**: Admin runs `livecli setup` to authenticate with Google OAuth
2. **Upload**: Admin uploads initial contest.json, teams.json, standings.json
   - Files uploaded to GCS (gzipped for bandwidth)
   - Firebase DB updated with public URLs
3. **Live Contest**: `livecli scrape` polls scoreboard every 10s
   - Compares with last standings
   - If changed: Upload to GCS → Update Firebase DB URLs
4. **Frontend**: React app subscribes to Firebase DB via `onValue()` listeners
   - When URL changes: Fetch JSON from GCS via axios
   - Diff standings to compute events (AC/WA/pending)
   - Animate rank changes and problem status updates

### Frontend Architecture

**Key Technologies**: React, Redux, TypeScript, Firebase Realtime Database, Material Design Bootstrap

**Component Organization**:
- `components/data/DataModel.tsx` - Firebase listener & axios fetcher (core data sync)
- `components/standings/` - Main standings table with animations
- `components/teams/` - Team info pages
- `components/front/` - Landing page
- `components/settings/` - User settings
- `components/common/` - Shared utilities (ClockText, AnimatingTable, etc.)

**Redux State**:
- `feeds` - Raw contest/standings/teams data from JSON
- `events` - Derived AC/WA/pending events (computed by diffing standings)
- `settings` - User preferences (persisted to localStorage)
- `reveal` - Award ceremony mode state

**Routes**:
- `/` - Front page
- `/standings` - Main standings table
- `/team/:id` - Team details
- `/settings` - User preferences
- `/reveal` - Award ceremony mode

### Python Client Architecture

**Core Components**:
- `livecli/commands/` - CLI command implementations (setup, upload, scrape, verify-credentials)
- `livecli/scrapers/` - Scoreboard parsers (base class in `base.py`, DOMjudge implementation in `domjudge.py`)
- `livecli/clients.py` - Firebase/GCS upload logic (DevClient for local, ProdClient for production)

**Adding Custom Scrapers**:
See [doc/ADVANCED.md](doc/ADVANCED.md) for how to implement support for other contest systems beyond DOMjudge.

**Client Types**:
- **DevClient**: Writes to `frontend/public/.dev/` and updates local Firebase emulator
- **ProdClient**: Uploads to GCS and updates production Firebase DB

**Scraper Loop**:
1. Fetch contest info from Firebase to check timing
2. If within contest window (start - 10min to end + 10min):
   - HTTP GET scoreboard URL
   - Parse HTML with Beautiful Soup
   - Convert to standardized JSON format
   - Compare with last standings
   - If changed: Upload to GCS → Update Firebase DB
3. Wait for interval (default 10s), repeat

### Data Model

**contest.json**:
```typescript
{
  title: string;
  times: { start: number; end: number; freeze: number; scale?: number };
  frontPageHtml: string;
  problemLink?: string;
}
```

**teams.json**:
```typescript
{
  [teamId: string]: {
    name: string;
    university: string;
    country: string;
    members: Array<{ name: string; topcoderId?: string; ... }>;
    photo?: string;
  }
}
```

**standings.json**:
```typescript
{
  problems: Array<{ label: string; title: string; color?: string }>;
  entries: Array<{
    teamId: string;
    rank: string;
    solved: number;
    penalty: number;
    problems: Array<{
      solved: boolean;
      attempts: number;
      pendings: number;  // Frozen submissions
      penalty: number;
      isFirst: boolean;  // First AC flag
    }>;
    revealState?: "pending" | "finalized";
  }>;
}
```

## Firebase Configuration

**Realtime Database Rules** (`frontend/database.rules.json`):
- Read: Public (no auth required)
- Write: Requires authenticated UID in `/auth/{uid} = true`

**Database Schema**:
```
/feeds/
  contest: "https://storage.googleapis.com/bucket/contest.123.json"
  standings: "https://storage.googleapis.com/bucket/standings.123.json"
  teams: "https://storage.googleapis.com/bucket/teams.123.json"
```

**Hosting**: All routes rewritten to `/index.html` for SPA support

## Development vs Production

**Local Development**:
- Firebase emulators (hosting + database)
- Data stored in `frontend/public/.dev/`
- Demo data loaded from `frontend/public/demodata/`
- Database: `localhost:9000`, Hosting: `localhost:5000`

**Production**:
- Firebase Hosting serves static files
- Firebase Realtime DB stores feed URLs
- GCS bucket stores actual JSON feeds (gzipped)
- livecli runs on contest admin's machine

## Important Notes

- **DOMjudge Team Naming**: Team names in DOMjudge must follow format `{id}: {name}` (e.g., `01: TeamA`, `02: TeamB`) for proper scraping
- **Event Detection**: The frontend computes AC/WA events by diffing consecutive standings snapshots (see `reducers/events.ts`)
- **Animation Timing**: Contest times support a `scale` parameter to speed up/slow down animations
- **Scoreboard Freeze**: Submissions during freeze show as "pending" until manually revealed
- **Credentials**: OAuth credentials stored in `~/.config/livecli/config.json` (never commit!)
- **Environment Config**: Firebase and site settings configured via `.env` file (see [doc/DEPLOYMENT.md](doc/DEPLOYMENT.md)). Defaults in `.env.defaults`, override by creating `.env` from `.env.example`
- **TypeScript Config**: Build outputs to `frontend/out/`, uses ES6 target with React JSX
- **No Backend**: Entirely serverless - no Node.js server, only static hosting + Firebase services
- **Local vs Production**: Use `--local` flag with scraper for local development, omit for production uploads to GCS
