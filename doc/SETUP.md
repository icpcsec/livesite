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
pip install -r requirements.txt -c constraints.txt
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

**⚠️ IMPORTANT**: In DOMjudge, team names must be formatted as `{id}: {name}` (e.g., `01: TeamA`, `02: TeamB`) if you use the default scraper.

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

Prepare your contest and team data. In another terminal:

```bash
cd client
source venv/bin/activate

./livecli.py upload contest.yaml --local
./livecli.py upload teams.yaml --local
```

This does two things internally:
1. Converts and saves the files under `frontend/public/.dev/` as JSON
2. Updates the local Firebase database to point to these files

In your browser, the contest data will automatically update.

### Load Initial Standings

Initially, no standings data is available. We recommend creating an "empty" standings file using:

```bash
cd scripts
python make_init_standings.py < ../doc/examples/teams.yaml > standings.init.json
```

Then upload the initial standings:

```bash
cd ../client
./livecli.py upload ../scripts/standings.init.json --local
```

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

This scrapes the DOMjudge server every 10 seconds and updates the standings.

Open http://localhost:5000 to verify that standings update automatically when submissions are made in DOMjudge.

## Testing Reveal Animation

Generate test reveal data:

```bash
cd scripts
python make_reveal.py \
  --frozen-standings=standings.frozen.json \
  --final-standings=standings.final.json \
  --output-json=reveal.json
```

Open http://localhost:5000/reveal and upload the generated `reveal.json` using the file picker on the page.

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
