# Global Data Screensaver

A real-time global data visualization application that displays earthquakes, volcanic activity, hurricanes, tornadoes, aurora activity, weather patterns, rocket launches, conflicts, protests, social unrest, and disease outbreaks on an interactive map.

## 🏗️ Architecture Overview

This project uses a **unified DataPoint architecture** where all data types flow through a single processing pipeline. This design provides:

- **Persistent tracking** of events by unique IDs
- **Efficient updates** - markers update in place rather than being recreated
- **Unified processing** - all data types handled consistently
- **Easy extensibility** - adding new data types is straightforward

### Key Design Principles

1. **Single Source of Truth**: All data is converted to `DataPoint` objects
2. **Immutable Updates**: Markers are compared by ID and only updated when changed
3. **Separation of Concerns**: Data fetching, conversion, rendering, and event logging are separate
4. **Fallback Strategy**: Sample data generators provide resilience when APIs fail

---

## 📁 Project Structure

```
src/
├── App.jsx                    # Main application component
├── main.jsx                   # React entry point
├── components/
│   ├── Map.jsx               # Map initialization and MarkerManager integration
│   ├── Legend.jsx            # Data legend with counts and minimizable UI
│   └── EventLog.jsx          # Event logging with severity filtering
├── models/
│   └── DataPoint.js          # Unified data model with ID prefixes
├── utils/
│   ├── api.js                # Data fetching with fallback generators
│   ├── converters.js         # Raw data → DataPoint conversion
│   ├── MarkerManager.js      # Unified marker rendering pipeline
│   ├── severity.js           # Severity calculation for all data types
│   ├── helpers.js            # Color/size/formatting utilities
│   └── animations.js         # Marker animation functions
```

---

## 🔄 Data Flow

```
1. App.jsx calls API fetch functions (utils/api.js)
   ↓
2. Raw API data or sample data returned
   ↓
3. Converters (utils/converters.js) transform raw data → DataPoints
   ↓
4. DataPoints passed to MarkerManager (utils/MarkerManager.js)
   ↓
5. MarkerManager compares with existing markers by ID
   ↓
6. Updates existing markers OR adds new markers OR removes old markers
   ↓
7. New events logged to EventLog if severity threshold met
```

---

## 🧩 Core Components

### 1. DataPoint Model (`src/models/DataPoint.js`)

**Purpose**: Unified data structure for all event types.

**Key Fields**:
- `id` - Unique identifier with type prefix (e.g., `"eqk-us6000m9z1"`, `"vol-kilauea"`)
- `type` - Event type from `DataSourceType` enum
- `lat`, `lon` - Coordinates
- `title` - Display title
- `description` - Detailed description
- `severity` - Severity level (1-4: LOW, MEDIUM, HIGH, CRITICAL)
- `timestamp` - Event timestamp
- `emoji` - Display emoji
- `metadata` - Type-specific additional data
- `lastUpdated` - When this data was last updated

**ID Prefixes**:
- `eqk` - Earthquakes
- `iss` - International Space Station (single ID)
- `vol` - Volcanoes
- `hur` - Hurricanes
- `tor` - Tornadoes
- `aur` - Aurora activity
- `wnd` - Wind patterns
- `prc` - Precipitation
- `rkt` - Rocket launches
- `cfl` - Conflicts
- `prt` - Protests
- `unr` - Social unrest
- `dis` - Disease outbreaks

**Key Methods**:
- `hasChanged(other)` - Compare with another DataPoint to detect changes
- `isNew()` - Check if event occurred within last 10 minutes
- `isRecent()` - Check if event occurred within last hour

---

### 2. Converters (`src/utils/converters.js`)

**Purpose**: Transform raw API data into standardized DataPoint objects.

Each data source has a dedicated converter function:
- `earthquakeToDataPoint(eq)`
- `issToDataPoint(iss)`
- `volcanoToDataPoint(volcano)`
- `hurricaneToDataPoint(hurricane)`
- etc.

**Responsibilities**:
1. Extract or generate unique IDs
2. Calculate severity using severity.js functions
3. Map raw fields to DataPoint structure
4. Preserve metadata for type-specific rendering

**Helper Function**:
- `convertBatch(rawData, converter)` - Convert arrays of raw data

---

### 3. MarkerManager (`src/utils/MarkerManager.js`)

**Purpose**: Unified pipeline for processing and rendering all marker types.

**Core Functionality**:

```javascript
class MarkerManager {
    // Map of ID → {marker, dataPoint}
    markers: Map<string, {marker, dataPoint}>
    
    // Process array of DataPoints
    processDataPoints(dataPoints)
    
    // Compare by ID and update/add/remove as needed
    processDataPoint(dataPoint)
    
    // Create type-specific Leaflet markers
    createMarker(dataPoint)
}
```

**Key Features**:
- **Efficient Updates**: Only modifies changed markers
- **ID Tracking**: Maintains map of ID → marker for quick lookups
- **Event Logging**: Automatically logs new/updated events based on severity
- **Type-Specific Rendering**: Each data type has custom marker styling
- **Animation Support**: Integrates with animations.js for new events

**Marker Creation Methods**:
- `createEarthquakeMarker()` - Circle markers with magnitude-based sizing
- `createVolcanoMarker()` - Triangle markers with alert-based coloring
- `createHurricaneMarker()` - Circle markers with category-based sizing
- `createISSMarker()` - Animated icon marker
- etc.

---

### 4. API Layer (`src/utils/api.js`)

**Purpose**: Fetch data from external APIs with fallback to sample data.

**Structure**:
```javascript
// Sample data generator (always works)
export function generateSampleEarthquakes() { ... }

// API fetch function (tries real API, falls back to sample)
export async function fetchEarthquakes() {
    try {
        const response = await fetch(USGS_API);
        return { success: true, data: response };
    } catch (error) {
        return { success: false, data: generateSampleEarthquakes() };
    }
}
```

**Available Fetchers**:
- `fetchEarthquakes()` - USGS Earthquake API
- `fetchISS()` - ISS Position API
- `fetchVolcanic()` - Sample data (real API not yet integrated)
- `fetchHurricanes()` - Sample data
- `fetchTornadoes()` - Sample data
- etc.

---

### 5. Severity System (`src/utils/severity.js`)

**Purpose**: Calculate severity levels for event filtering.

**Severity Levels**:
```javascript
SEVERITY = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4
}
```

**Calculation Functions**:
Each data type has a dedicated severity calculator based on its characteristics:
- `getEarthquakeSeverity(magnitude)` - Based on Richter scale
- `getHurricaneSeverity(category)` - Based on Saffir-Simpson scale
- `getTornadoSeverity(intensity)` - Based on Enhanced Fujita scale
- `getVolcanicSeverity(alertLevel)` - Based on alert status
- etc.

**Usage in Event Log**:
The EventLog component filters events based on a user-selected severity threshold, showing only events meeting or exceeding that level.

---

### 6. React Components

#### App.jsx
**Role**: Main application orchestrator

**Responsibilities**:
- Fetch data from all sources in parallel
- Convert raw data to DataPoints
- Manage global state (events, severity threshold, map controller)
- Pass data to child components

**Key State**:
- `dataPoints` - All current DataPoints
- `events` - Event log entries
- `severityThreshold` - Minimum severity to display
- `markerManagerRef` - Reference to MarkerManager instance

#### Map.jsx
**Role**: Map initialization and marker management

**Responsibilities**:
- Initialize Leaflet map (once on mount)
- Create MarkerManager instance
- Provide map controller for event log interactions
- Process DataPoints through MarkerManager

**Important**: Uses multiple `useEffect` hooks with specific dependencies to prevent map flickering.

#### Legend.jsx
**Role**: Display legend and data counts

**Features**:
- Shows real-time counts for each data type
- Minimizable UI
- Last update timestamp
- Color/symbol key for all data types

#### EventLog.jsx
**Role**: Display event log with filtering

**Features**:
- Shows last 100 events
- Auto-scrolls only if already at bottom
- Severity filtering dropdown
- Click to zoom to event location
- Minimizable transparent panel

---

## 🎨 Styling & UI

### Color Scheme
- Background: Dark theme (`#111827`)
- Panels: Semi-transparent with backdrop blur
- Markers: Color-coded by severity/intensity

### Marker Styles
- **Earthquakes**: Circle markers, size by magnitude, color by magnitude
- **Volcanoes**: Triangle markers, color by alert level
- **Hurricanes**: Circle markers, size by category
- **Tornadoes**: Animated funnel icons, color by EF scale
- **Aurora**: Translucent circles, green/cyan colors
- **ISS**: Animated satellite icon
- etc.

### Animations
- **Bounce**: New events bounce to draw attention
- **Pulse**: Very recent events pulse continuously
- **Rotate**: ISS icon rotates continuously

---

## 🔧 Adding a New Data Type

Follow these steps to add a new data type to the visualization:

### 1. Update DataPoint Model (`models/DataPoint.js`)

```javascript
// Add to DataSourceType enum
export const DataSourceType = {
    // ... existing types
    NEWTYPE: 'newtype'
};

// Add ID prefix
export const DataSourcePrefix = {
    // ... existing prefixes
    [DataSourceType.NEWTYPE]: 'new'
};
```

### 2. Create Sample Data Generator (`utils/api.js`)

```javascript
export function generateSampleNewType() {
    return [
        {
            id: 'sample-1',
            lat: 40.7128,
            lon: -74.0060,
            // ... other fields
        }
    ];
}

export async function fetchNewType() {
    try {
        // Try real API
        const response = await fetch('API_URL');
        return { success: true, data: await response.json() };
    } catch (error) {
        return { success: false, data: generateSampleNewType() };
    }
}
```

### 3. Create Converter (`utils/converters.js`)

```javascript
export function newTypeToDataPoint(item) {
    const id = `${DataSourcePrefix[DataSourceType.NEWTYPE]}-${item.id}`;
    const severity = getNewTypeSeverity(item.someProperty);
    
    return new DataPoint(
        id,
        DataSourceType.NEWTYPE,
        item.lat,
        item.lon,
        item.title,
        item.description,
        severity,
        item.timestamp,
        '🆕', // emoji
        { /* metadata */ }
    );
}
```

### 4. Add Severity Calculator (`utils/severity.js`)

```javascript
export function getNewTypeSeverity(property) {
    if (property >= HIGH_THRESHOLD) return SEVERITY.CRITICAL;
    if (property >= MEDIUM_THRESHOLD) return SEVERITY.HIGH;
    if (property >= LOW_THRESHOLD) return SEVERITY.MEDIUM;
    return SEVERITY.LOW;
}
```

### 5. Add Marker Creator (`utils/MarkerManager.js`)

```javascript
// Add case to createMarker() switch statement
case DataSourceType.NEWTYPE:
    return this.createNewTypeMarker(dataPoint);

// Implement marker creation method
createNewTypeMarker(dataPoint) {
    const color = getNewTypeColor(dataPoint.metadata.property);
    const circle = L.circleMarker([dataPoint.lat, dataPoint.lon], {
        radius: 10,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.6
    });
    
    circle.bindPopup(`
        <strong>${dataPoint.emoji} ${dataPoint.title}</strong><br>
        ${dataPoint.description}
    `);
    
    return circle;
}
```

### 6. Add Helper Functions (`utils/helpers.js`)

```javascript
export function getNewTypeColor(property) {
    if (property >= HIGH) return '#ff0000';
    if (property >= MEDIUM) return '#ff9900';
    return '#ffcc00';
}
```

### 7. Update App.jsx

```javascript
// Add to fetch array in loadData()
const [/* ... */, newTypeResult] = await Promise.all([
    // ... existing fetches
    fetchNewType()
]);

// Add to DataPoint conversion
const allDataPoints = [
    // ... existing conversions
    ...convertBatch(newTypeResult.data, newTypeToDataPoint)
];
```

### 8. Update Legend (`components/Legend.jsx`)

Add section showing the new data type with visual example and count.

---

## 🚀 Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Server
The app runs at `http://localhost:5173/` with hot module reload.

### Key Dependencies
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Leaflet** - Interactive maps
- **Leaflet React** - React integration for Leaflet

---

## 🐛 Common Issues & Solutions

### Map Flickering
**Cause**: Dependencies in Map.jsx useEffect causing constant reinitialization  
**Solution**: Use `useCallback` for functions passed as props, split effects by concern

### CORS Errors
**Cause**: External APIs blocking browser requests  
**Solution**: Fallback to sample data generators (already implemented)

### Markers Not Updating
**Cause**: MarkerManager not receiving updated DataPoints  
**Solution**: Check that converters are creating stable IDs

### Event Log Not Showing Events
**Cause**: Severity threshold too high  
**Solution**: Lower severity threshold in EventLog dropdown

---

## 📊 Performance Considerations

### Efficient Marker Updates
- Markers are tracked by ID in a `Map<string, object>`
- Only changed markers are updated (compare by `DataPoint.hasChanged()`)
- Old markers are removed when IDs disappear from data

### Memory Management
- Event log keeps only last 100 events
- Marker cleanup in useEffect return functions
- Clear intervals for animations on marker removal

### Data Refresh
- Auto-refresh every 60 seconds
- All API calls made in parallel with `Promise.all()`
- Non-blocking updates with React state

---

## 🎯 Future Enhancements

### Potential Improvements
1. **TypeScript Migration** - Add type safety
2. **Real API Integration** - Replace sample data with real APIs
3. **Backend Proxy** - Solve CORS issues with proxy server
4. **WebSocket Updates** - Real-time data streaming
5. **Historical Data** - Track and visualize event history
6. **Storm Tracking** - Show hurricane/tornado paths over time
7. **User Preferences** - Save settings (severity, visible layers)
8. **Mobile Optimization** - Improve touch interactions
9. **Offline Mode** - Cache data for offline viewing
10. **Export Functionality** - Export event data or screenshots

---

## 📝 Code Style Guide

### Naming Conventions
- **Components**: PascalCase (e.g., `EventLog.jsx`)
- **Utilities**: camelCase (e.g., `converters.js`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DATA_SOURCE_TYPE`)
- **CSS Classes**: kebab-case (e.g., `event-log`)

### File Organization
- One component per file
- Group related utilities in same file
- Keep files under 700 lines when possible
- Extract reusable logic to utility functions

### React Patterns
- Use functional components with hooks
- Use `useCallback` for functions passed as props
- Use `useRef` for values that don't trigger re-renders
- Split complex effects into multiple focused effects

---

## 🤝 Contributing

When contributing to this project:

1. **Understand the architecture** - Read this README fully
2. **Follow the data flow** - Raw data → DataPoint → MarkerManager → Render
3. **Test with sample data** - Ensure fallbacks work
4. **Add severity calculations** - New data types need severity functions
5. **Update documentation** - Keep this README current
6. **Consider performance** - Avoid unnecessary re-renders

---

## 📄 License

This project is open source and available for educational and demonstration purposes.

---

## 🙏 Credits

- **Earthquake Data**: USGS Earthquake Hazards Program
- **ISS Position**: wheretheiss.at API
- **Map Tiles**: CartoDB Dark Matter
- **Leaflet**: Open-source mapping library
- **Vite + React**: Modern web development tools

---

**Last Updated**: January 2026  
**Maintainer**: Add your name here  
**Version**: 2.0.0 (DataPoint Architecture)
