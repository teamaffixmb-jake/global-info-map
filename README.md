# Global Data Screensaver

A dynamic, real-time map visualization displaying 13 types of global events. Built with React and Vite.

## Features

### Data Visualization
- **Earthquakes**: Live USGS data (magnitude 2.5+ from last 24 hours)
- **Volcanic Activity**: Active volcanoes with alert levels
- **Hurricanes**: Tropical storms with category ratings
- **Tornadoes**: Recent tornado reports with EF scale
- **Aurora Activity**: Northern/Southern lights with KP index
- **Wind Patterns**: Directional wind visualization
- **Precipitation**: Real-time rain/snow data
- **Rocket Launches**: Launch sites and mission details
- **Active Conflicts**: Conflict zones with intensity levels
- **Protests/Demonstrations**: Global protest activity
- **Social Unrest**: Areas with social tension
- **Disease Outbreaks**: Active disease hotspots
- **ISS Tracking**: International Space Station position

### Interactive Features
- **Event Log**: Real-time logging of all detected events with severity filtering
- **Clickable Events**: Click events in the log to zoom to location on map
- **Severity Filtering**: Filter events by severity level (Low/Medium/High/Critical)
- **Animations**: Visual indicators for new and recent events
- **Auto-updates**: Refreshes every 60 seconds
- **Minimizable Panels**: Collapsible legend and event log
- **Transparent UI**: Semi-transparent panels with frosted glass effect
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
- Click events in the Event Log to zoom to their location
- Use the severity filter in the Event Log to control which events are shown
- Minimize/maximize panels by clicking their headers or toggle buttons

## Project Structure

```
src/
  components/
    Header.jsx                  # Header with counts and timestamp
    Legend.jsx                  # Map legend (minimizable)
    EventLog.jsx                # Event log with severity filtering
    Map.jsx                     # Main map container
    EarthquakeMarkers.jsx       # Earthquake marker rendering
    VolcanicMarkers.jsx         # Volcanic activity markers
    HurricaneMarkers.jsx        # Hurricane markers
    TornadoMarkers.jsx          # Tornado markers
    AuroraMarkers.jsx           # Aurora activity markers
    WindPatternMarkers.jsx      # Wind pattern visualization
    PrecipitationMarkers.jsx    # Precipitation markers
    RocketLaunchMarkers.jsx     # Rocket launch markers
    ConflictMarkers.jsx         # Conflict zone markers
    ProtestMarkers.jsx          # Protest markers
    SocialUnrestMarkers.jsx     # Social unrest markers
    DiseaseOutbreakMarkers.jsx  # Disease outbreak markers
    ISSMarker.jsx               # ISS marker rendering
  utils/
    api.js             # API calls and sample data generators
    animations.js      # Animation functions
    helpers.js         # Utility functions
    severity.js        # Severity calculation and filtering
  App.jsx              # Main application component
  main.jsx             # Application entry point
```

## Technologies

- React 18
- Vite
- Leaflet.js
- Vanilla JavaScript (no build process needed for core functionality)

