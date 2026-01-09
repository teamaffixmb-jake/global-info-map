# How to Use Global Data Screensaver

## For End Users

### Option 1: Install Globally (Recommended)

```bash
npm install -g global-data-screensaver
```

Then run it with:

```bash
global-data-screensaver
```

This will:
1. Start a local development server
2. Automatically open your browser to `http://localhost:5173`
3. Display the interactive globe with real-time data

**Stop it**: Press `Ctrl+C` in the terminal

### Option 2: Run with npx (No Installation)

```bash
npx global-data-screensaver
```

This downloads and runs it temporarily without installing globally.

### Option 3: Clone and Run (For Developers)

```bash
git clone https://github.com/teamaffixmb-jake/global-info-map.git
cd global-info-map
npm install
npm run dev
```

## What Happens When You Run It?

1. **Server starts** on `http://localhost:5173`
2. **Browser opens** automatically
3. **Data loads** from real-time APIs:
   - Earthquakes (USGS)
   - Volcanoes (USGS)
   - Hurricanes (NOAA)
   - ISS Location (Open Notify)
   - Wind Patterns (Open-Meteo)

4. **Interactive controls** appear:
   - Autopilot modes (Rotate, Wander, ISS)
   - Auto-Switch for random mode cycling
   - Event log and legend
   - Severity filters

## System Requirements

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- Modern web browser with WebGL 2.0 support
- Internet connection (for real-time data APIs)

## Troubleshooting

### Port 5173 already in use

Kill the process using that port:

```bash
# Linux/Mac
lsof -ti:5173 | xargs kill -9

# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

Or the CLI will automatically try the next available port.

### Browser doesn't open automatically

Manually open: http://localhost:5173

### "Module not found" errors

Make sure you're using Node.js v18+:

```bash
node --version
```

Update if needed: https://nodejs.org/

## Features to Try

- 🌍 **Rotate the globe** - Click and drag
- 🔍 **Zoom** - Scroll wheel
- 📍 **Click markers** - View event details
- ✈️ **Autopilot** - Enable screensaver mode
- 🎲 **Wander** - Auto-visit high-severity events
- 🛰️ **ISS Tracking** - Follow the space station in orbit
- 🔀 **Auto-Switch** - Random mode changes every 30s-3min

## Stopping the Server

Press `Ctrl+C` in the terminal where it's running.

## Questions?

- GitHub Issues: https://github.com/teamaffixmb-jake/global-info-map/issues
- npm Package: https://www.npmjs.com/package/global-data-screensaver

