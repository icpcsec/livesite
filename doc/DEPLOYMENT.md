# LiveSite Production Deployment Guide

This guide covers deploying LiveSite to production for a live contest.

## Table of Contents

- [Firebase Setup](#firebase-setup)
- [Deploying the Frontend](#deploying-the-frontend)
- [Setting Up Credentials](#setting-up-credentials)
- [Uploading Contest Data](#uploading-contest-data)
- [Running the Live Scraper](#running-the-live-scraper)
- [During the Contest](#during-the-contest)
- [Post-Contest Procedures](#post-contest-procedures)

## Firebase Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the wizard
3. Enable **Firebase Realtime Database** and **Firebase Hosting**
4. Create a **Google Cloud Storage bucket** in the same project

### Step 2: Get Firebase Configuration

1. In Firebase Console, go to Project Settings
2. Scroll down to "Your apps" section
3. Click the web app icon `</>` to create a web app
4. Copy the `firebaseConfig` object

### Step 3: Configure Firebase Settings

You must configure Firebase via environment variables before building.

1. Create your environment file:
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. Edit `.env` with your Firebase configuration:
   ```bash
   FIREBASE_API_KEY=your-actual-api-key
   FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   GA_ID=UA-XXXXXXXXX-X  # Optional, leave empty to disable
   ```

3. The build automatically uses `.env` if it exists, otherwise falls back to `.env.defaults`.

Advanced: For multiple environments, create separate files (e.g., `.env.production`, `.env.staging`) and specify at build time:
```bash
npm run build -- --env envFile=.env.production
```

### Step 4: Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### Step 5: Initialize Firebase

```bash
cd frontend
firebase use <your-project-id>
firebase projects:list  # Verify correct project
```

### Step 6: Set Up Database Security Rules

Ensure your Firebase Realtime Database rules allow public reads:

```json
{
  "rules": {
    ".read": true,
    ".write": "root.child('auth').child(auth.uid).val() === true"
  }
}
```

Deploy the rules:
```bash
firebase deploy --only database
```

### Step 7: Configure CORS for Cloud Storage

```bash
cat > cors.json << 'EOF'
[
  {
    "origin": ["*"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set cors.json gs://your-bucket-name
```

## Deploying the Frontend

### Build and Deploy

```bash
cd frontend

# Build for production
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

After deployment, you'll get a URL like:
```
https://your-project-id.firebaseapp.com
```

## Setting Up Credentials

On the machine that will run the scraper (your laptop, a server, etc.):

```bash
cd client
source venv/bin/activate

# Set up Google Cloud credentials
python livecli.py setup

# Verify credentials work
python livecli.py verify-credentials
# Should output: OK
```

This creates `~/.config/livecli/config.json` with your credentials.

**Important**: Keep credentials out of version control. Never commit `~/.config/livecli/config.json` or service account keys.

## Uploading Contest Data

Before the contest starts, upload your contest metadata and team information:

```bash
cd client
source venv/bin/activate

# Upload to production
python livecli.py upload contest.yaml teams.yaml
```

This will:
1. Convert YAML to JSON
2. Upload to Google Cloud Storage with timestamped filenames
3. Update Firebase Realtime Database with the GCS URLs

Verify by opening your LiveSite URL in a browser. You should see:
- Contest title and info on the front page
- Team list (if teamPage feature is enabled)

## Running the Live Scraper

### Pre-Contest Testing

Test the scraper before the contest:

```bash
cd client
source venv/bin/activate

# Test scraping without uploading
curl https://your-domjudge.example.com/public > test-scoreboard.html
python livecli.py scrape domjudge --test-with-local-file test-scoreboard.html
```

### Starting the Scraper

The scraper automatically starts/stops based on contest times:
- Starts scraping: `start_time - 10 minutes`
- Stops scraping: `end_time + 10 minutes`

```bash
cd client
source venv/bin/activate

python livecli.py scrape domjudge \
  --scoreboard-url="https://your-domjudge.example.com/public" \
  --interval-seconds=10 \
  --log-dir=logs-contest
```

**Important Flags**:
- `--scoreboard-url`: **Public scoreboard URL** (the one with freeze applied!)
- `--interval-seconds`: Scraping interval (10-15 seconds recommended)
- `--log-dir`: Directory to save scraping logs (for backup and debugging)

## Common Issues During Contest

**Standings not updating?**
- Check scraper is still running
- Check logs: `ls -ltr logs-contest/` (should see recent files)
- Verify Firebase: `curl https://your-project-id.firebaseio.com/feeds.json`

**Need to change contest times?**

Update contest.yaml and re-upload:
```bash
vim contest.yaml
python livecli.py upload contest.yaml
```

## Post-Contest Procedures

### Step 1: Wait for Final Judgments

After contest ends:
1. **Wait** for all submissions to be judged
2. The scraper will continue for 10 minutes then stop uploading
3. After that, it automatically stops uploading (but keeps scraping to logs)

### Step 2: Stop the Scraper

Stop the scraper with Ctrl+C.

### Step 3: Backup Scraper Logs

You may want to save scraper logs for backup and reveal generation.

The logs are in the `logs-contest/` directory where you ran the scraper.

### Step 4: Generate Reveal Data

See [REVEAL.md](REVEAL.md) for detailed instructions on creating the award ceremony reveal animation.

## Updating Contest Data Mid-Contest

If you need to update contest metadata or team info during the contest:

```bash
# Edit your files
vim contest.yaml
vim teams.yaml

# Re-upload
python livecli.py upload contest.yaml teams.yaml
```

**Note**: Updating contest.yaml times will affect when the scraper starts/stops, but won't restart a running scraper. You may need to restart the scraper if you change times significantly.

## Next Steps

- [REVEAL.md](REVEAL.md) - Set up award ceremony reveal
