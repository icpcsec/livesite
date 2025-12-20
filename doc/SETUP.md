# LiveSite Local Setup Guide

This guide helps you set up and run LiveSite locally without any cloud dependencies. Perfect for testing and development.

## Prerequisites

- **Node.js** and npm
- **Python 3**
- **Git**

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/icpcsec/livesite.git
cd livesite
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Install Python Client Dependencies

```bash
cd ../client
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Preparing Contest Data

Create your contest configuration files. Examples are in `doc/examples/`.

### contest.yaml

```yaml
frontPageHtml: |
  <h1 class="page-header">Your Contest Name</h1>
  <p>Contest information goes here</p>

times:
  start:  "2025-03-15 10:00:00+09:00"
  freeze: "2025-03-15 14:00:00+09:00"
  end:    "2025-03-15 15:00:00+09:00"

title: "Your Contest Name 2025"
```

### teams.yaml

```yaml
{
  "1": {
    "name": "TeamA",
    "university": "Example University",
    "universityEn": "Example University",
    "members": [],
    "photo": "/images/default-photo-regional.png"
  },
  "2": {
    "name": "TeamB",
    "university": "Another University",
    "universityEn": "Another University",
    "members": [],
    "photo": "/images/default-photo-regional.png"
  }
}
```

**⚠️ IMPORTANT**: In DOMjudge, team names must be formatted as `{id}: {name}` (e.g., `01: TeamA`, `02: TeamB`)

## Running Locally

### Start the Development Server

```bash
cd frontend
npm run serve
```

This starts:
- Firebase emulators (database at localhost:9000, hosting at localhost:5000)
- Frontend with demo data from `frontend/public/demodata/`

Open http://localhost:5000 in your browser.

### Load Your Contest Data

Put your data files in `frontend/public/`:

```bash
cp contest.yaml frontend/public/
cp teams.yaml frontend/public/
```

Then update the local Firebase database to point to them:

```bash
curl -X PUT -d '"/contest.yaml"' http://localhost:9000/feeds/contest.json
curl -X PUT -d '"/teams.yaml"' http://localhost:9000/feeds/teams.json
```

Refresh your browser to see your contest data.

## Testing with DOMjudge

### Run the Scraper Locally

```bash
cd client
source venv/bin/activate

# Test scraping with a local HTML file
curl https://your-domjudge.example.com/public > scoreboard.html
python livecli.py scrape domjudge --test-with-local-file scoreboard.html > standings.json
```

### Run Live Scraper to Local

```bash
python livecli.py scrape domjudge \
  --scoreboard-url="https://your-domjudge.example.com/public" \
  --interval-seconds=10 \
  --log-dir=logs-test \
  --local
```

The `--local` flag makes it write to `frontend/public/.dev/` and update the local Firebase emulator.

### Verify Everything Works

1. Start the frontend: `cd frontend && npm run serve`
2. In another terminal, start the scraper (command above)
3. Open http://localhost:5000
4. Submit a test solution in DOMjudge
5. Within 10 seconds, you should see updates in LiveSite

## Testing Reveal Animation

Generate test reveal data:

```bash
cd scripts
python make_reveal.py \
  --frozen-standings=standings.frozen.json \
  --final-standings=standings.final.json \
  --output-json=reveal.json
```

Copy it to public directory:
```bash
cp reveal.json ../frontend/public/
```

Open http://localhost:5000/reveal and upload the file.

## Next Steps

- [DEPLOYMENT.md](DEPLOYMENT.md) - Deploy to production for a live contest

## Common Issues

### Port already in use

If ports 5000 or 9000 are already in use:
```bash
lsof -i :5000
lsof -i :9000
# Kill the process using the port
```

### Frontend shows "Loading..."

Check browser console for errors. Make sure:
- Firebase emulator is running
- JSON files are accessible in `frontend/public/`

### Team names not matching

Ensure DOMjudge team names follow the `{id}: {name}` format (e.g., `01: TeamA`)
