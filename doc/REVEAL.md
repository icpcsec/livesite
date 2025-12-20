# LiveSite Reveal Animation Guide

The reveal animation provides a dramatic way to announce final contest results during an award ceremony, progressively revealing team rankings with animations.

## Overview

The reveal mode works by:
1. Starting with the frozen (pre-reveal) scoreboard
2. Progressively revealing rankings from bottom to top
3. Showing rank changes, new AC submissions, and final standings
4. Providing a polished presentation for award ceremonies

## Table of Contents

- [Preparing Reveal Data](#preparing-reveal-data)
- [Testing the Reveal Animation](#testing-the-reveal-animation)
- [Presenting at the Ceremony](#presenting-at-the-ceremony)
- [Customization Options](#customization-options)
- [Tips for a Great Presentation](#tips-for-a-great-presentation)

## Preparing Reveal Data

### Step 1: Download Standings from DOMjudge

You need two standings files:
1. **Frozen standings**: The last standings before scoreboard unfreeze
2. **Final standings**: The standings after revealing all frozen submissions

**Download Frozen Standings**:
1. Go to DOMjudge **public scoreboard** (the one teams see)
2. Right-click → Save Page As → `standings.frozen.html`

**Download Final Standings**:
1. Go to DOMjudge **jury scoreboard** (with freeze revealed)
2. Right-click → Save Page As → `standings.final.html`

### Step 2: Convert HTML to JSON

Convert the downloaded HTML files to LiveSite JSON format:

```bash
cd client
source venv/bin/activate

# Convert frozen standings
python livecli.py scrape domjudge \
  --test-with-local-file standings.frozen.html \
  > standings.frozen.json

# Convert final standings
python livecli.py scrape domjudge \
  --test-with-local-file standings.final.html \
  > standings.final.json
```

Verify the JSON looks correct:
```bash
cat standings.frozen.json | jq '.entries | length'  # Should show number of teams
cat standings.final.json | jq '.entries | length'   # Should match
```

### Step 3: Generate reveal.json

Use the `make_reveal.py` script to generate reveal data:

```bash
cd scripts

python make_reveal.py \
  --frozen-standings=../client/standings.frozen.json \
  --final-standings=../client/standings.final.json \
  --output-json=reveal.json
```

This creates `reveal.json` with step-by-step reveal instructions.

**What the script does**:
- Compares frozen vs. final standings
- Identifies teams with rank changes
- Identifies newly revealed AC submissions
- Generates reveal steps (usually revealing teams from bottom to top)

## Running the Reveal Animation

1. Open the reveal page: `https://your-livesite-url/reveal`
2. Upload `reveal.json` by dragging and dropping it onto the page, or clicking the upload area
3. The animation loads and shows the frozen scoreboard

**Controls**:
- **Space bar** or **Click**: Advance to next reveal step
- **Left Arrow**: Go back one step
- **Right Arrow**: Jump forward one step
- **R**: Reset to beginning
- **Esc**: Exit fullscreen

**Tips for Award Ceremony**:
- Enable dark mode first: Go to Settings → Dark Mode (saved to localStorage)
- Press **F11** for fullscreen presentation
- Test the controls before the ceremony starts
