# LiveSite Documentation

Guides for setting up and running LiveSite for your programming contest.

## Guides

- **[SETUP.md](SETUP.md)** - Local setup and testing (no cloud required)
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment and running live contests
- **[REVEAL.md](REVEAL.md)** - Award ceremony reveal animation
- **[ADVANCED.md](ADVANCED.md)** - Advanced topics (custom scrapers, etc.)
- **[examples/](examples/)** - Sample configuration files

## Quick Start

1. New to LiveSite? → [SETUP.md](SETUP.md)
2. Ready for production? → [DEPLOYMENT.md](DEPLOYMENT.md)
3. Need reveal animation? → [REVEAL.md](REVEAL.md)

## Important

⚠️ Update `frontend/src/siteconfig.ts` with your Firebase config before deployment.

⚠️ DOMjudge team names must use format: `{id}: {name}` (e.g., `01: TeamA`)
