# Global Data Screensaver

A dynamic, real-time map visualization displaying global events including earthquakes, wildfires, and ISS tracking. Built with React and Vite.

## Features

- **Real-time Earthquake Data**: Live data from USGS (magnitude 2.5+ from last 24 hours)
- **Wildfire Tracking**: Simulated fire data in typical fire-prone regions
- **ISS Tracking**: International Space Station position tracking
- **Animations**: Visual indicators for new and recent events
- **Auto-updates**: Refreshes every 60 seconds
- **Dark Theme**: Beautiful dark map interface perfect for screensaver use

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## Usage

- Open the app in your browser
- Press F11 for fullscreen mode (perfect for screensaver)
- The map automatically updates every 60 seconds
- Click on markers to see detailed information

## Project Structure

```
src/
  components/
    Header.jsx          # Header with counts and timestamp
    Legend.jsx          # Map legend
    Map.jsx             # Main map container
    EarthquakeMarkers.jsx  # Earthquake marker rendering
    FireMarkers.jsx     # Fire marker rendering
    ISSMarker.jsx       # ISS marker rendering
  utils/
    api.js             # API calls and sample data generators
    animations.js      # Animation functions
    helpers.js         # Utility functions
  App.jsx              # Main application component
  main.jsx             # Application entry point
```

## Technologies

- React 18
- Vite
- Leaflet.js
- Vanilla JavaScript (no build process needed for core functionality)

