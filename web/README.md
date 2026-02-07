UK Risk Monitor (CircleOverwatch)

Overview
- React + Vite web platform for UK risk intelligence.
- Tracks: terrorism threat level, postcode-based crime stats, flood/weather alerts, and public news flashes.
- Dark theme with black background and orange accents.
- HubSpot chat widget integration (no auth yet).

Getting Started
- Install deps: npm install
- Copy .env.example to .env and set values as needed
- Run dev server: npm run dev

Configuration
- HubSpot chat: set VITE_HUBSPOT_PORTAL_ID in .env
- News feeds (optional): set VITE_NEWS_RSS_URLS with comma-separated RSS URLs
- RSS proxy (optional, recommended for CORS): set VITE_RSS_PROXY, e.g. https://api.allorigins.win/raw?url=

Data Sources
- Terrorism threat level: public/threat-level.json (manual, official MI5/Home Office wording)
- Crime by postcode: api.postcodes.io + data.police.uk street-level crimes
- Weather/Flood alerts: Environment Agency flood monitoring (live JSON)
- Newsflash: generic RSS ingestion (requires proxy/CORS-friendly feeds)

Notes
- Auth is not configured per request. All data is public/read-only.
- Met Office NSWWS can be added (CAP feeds) if required.
- For production, use a backend proxy for RSS to avoid CORS and rate limits.

## Chrome DevTools MCP Integration

This project includes Chrome DevTools Model Context Protocol (MCP) server integration for enhanced AI-assisted debugging and development.

### Setup
1. The MCP server is configured in `.mcp-config.json`
2. Run the Chrome DevTools MCP server: `npm run mcp:chrome-devtools`
3. Configure your AI coding assistant to use the MCP server

### Available Tools
- **Performance tracing**: Analyze website performance with real browser data
- **Network debugging**: Inspect network requests and CORS issues
- **Console debugging**: Analyze console logs and errors
- **DOM inspection**: Debug styling and layout issues
- **User simulation**: Navigate, fill forms, and test user flows

### Example Prompts for AI Assistants
- "Verify in the browser that your change works as expected"
- "A few images on localhost:8080 are not loading. What's happening?"
- "Why does submitting the form fail after entering an email address?"
- "The page on localhost:8080 looks strange and off. Check what's happening there."
- "Localhost:8080 is loading slowly. Make it load faster."

For more details, see the [Chrome DevTools MCP documentation](https://developer.chrome.com/blog/chrome-devtools-mcp).

