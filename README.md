# Global Data Screensaver

A real-time global data visualization application built with **React + TypeScript** that displays earthquakes, volcanic activity, hurricanes, tornadoes, aurora activity, weather patterns, rocket launches, conflicts, protests, social unrest, and disease outbreaks on an interactive map.

## 🏗️ Architecture Overview

This project uses a **unified DataPoint architecture** where all data types flow through a single processing pipeline. This design provides:

- **Type-safe data processing** with TypeScript
- **Persistent tracking** of events by unique IDs
- **Efficient updates** - markers update in place rather than being recreated
- **Unified processing** - all data types handled consistently
- **Easy extensibility** - adding new data types is straightforward

### Key Design Principles

1. **Single Source of Truth**: All data is converted to `DataPoint` objects
2. **Type Safety**: Full TypeScript coverage with strict type checking
3. **Immutable Updates**: Markers are compared by ID and only updated when changed
4. **Separation of Concerns**: Data fetching, conversion, rendering, and event logging are separate
5. **Fallback Strategy**: Sample data generators provide resilience when APIs fail

---

## 📁 Project Structure

```
src/
├── App.tsx                    # Main application component
├── main.tsx                   # React entry point
├── components/
│   ├── Map.tsx               # Map initialization and MarkerManager integration
│   ├── Legend.tsx            # Data legend with counts and minimizable UI
│   └── EventLog.tsx          # Event logging with severity filtering
├── models/
│   └── DataPoint.ts          # Unified data model with TypeScript types
├── utils/
│   ├── api.ts                # Data fetching with typed responses
│   ├── converters.ts         # Raw data → DataPoint conversion with types
│   ├── MarkerManager.ts      # Unified marker rendering pipeline
│   ├── severity.ts           # Severity calculation with enums
│   ├── helpers.ts            # Color/size/formatting utilities
│   └── animations.ts         # Marker animation functions
```

---

## 🔄 Data Flow

```
1. App.tsx calls API fetch functions (utils/api.ts)
   ↓
2. Typed API responses returned (APIResponse<T>)
   ↓
3. Converters (utils/converters.ts) transform raw data → DataPoints
   ↓
4. DataPoints passed to MarkerManager (utils/MarkerManager.ts)
   ↓
5. MarkerManager compares with existing markers by ID
   ↓
6. Updates existing markers OR adds new markers OR removes old markers
   ↓
7. New events logged to EventLog if severity threshold met
```

---

## 🧩 Core Components

### 1. DataPoint Model (`src/models/DataPoint.ts`)

**Purpose**: Unified, type-safe data structure for all event types.

**Key Features**:
- **TypeScript Enums**: `DataSourceType` enum for all event types
- **Type Discrimination**: Separate metadata interfaces for each data type
- **Generic Types**: `DataPoint<T extends DataPointMetadata>`

**Key Fields**:
```typescript
class DataPoint<T extends DataPointMetadata> {
    id: string;                    // Unique identifier with type prefix
    type: DataSourceType;          // Event type from enum
    lat: number;                   // Latitude
    lon: number;                   // Longitude
    title: string;                 // Display title
    description: string;           // Detailed description
    severity: number;              // 1-4: LOW, MEDIUM, HIGH, CRITICAL
    timestamp: number;             // Event timestamp
    emoji: string;                 // Display emoji
    metadata: T;                   // Type-specific additional data
    lastUpdated: number;           // Last update timestamp
}
```

**Metadata Types**:
- `EarthquakeMetadata` - magnitude, depth, place, url
- `ISSMetadata` - altitude, velocity
- `VolcanoMetadata` - elevation, country, alertLevel, lastEruption
- `HurricaneMetadata` - category, windSpeed, pressure, direction
- And more...

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
- `hasChanged(other: DataPoint | null): boolean` - Compare with another DataPoint
- `isNew(): boolean` - Check if event occurred within last 10 minutes
- `isRecent(): boolean` - Check if event occurred within last hour
- `getAge(): number` - Get age in milliseconds

---

### 2. Converters (`src/utils/converters.ts`)

**Purpose**: Transform raw API data into standardized, typed DataPoint objects.

**Type Definitions**:
Each data source has defined raw types:
```typescript
interface RawEarthquake {
    id?: string;
    geometry: { coordinates: [number, number, number?] };
    properties: {
        mag: number;
        place: string;
        time: number;
        url?: string;
    };
}

// ... similar interfaces for all data types
```

**Converter Functions**:
- `earthquakeToDataPoint(eq: RawEarthquake): DataPoint<EarthquakeMetadata>`
- `issToDataPoint(iss: RawISS): DataPoint<ISSMetadata>`
- `volcanoToDataPoint(volcano: RawVolcano): DataPoint<VolcanoMetadata>`
- `hurricaneToDataPoint(hurricane: RawHurricane): DataPoint<HurricaneMetadata>`
- etc.

**Responsibilities**:
1. Extract or generate unique IDs
2. Calculate severity using severity.ts functions
3. Map raw fields to DataPoint structure
4. Preserve metadata for type-specific rendering

**Helper Function**:
```typescript
export function convertBatch<T>(
    rawData: T[] | null | undefined, 
    converter: (item: T) => DataPoint
): DataPoint[]
```

---

### 3. MarkerManager (`src/utils/MarkerManager.ts`)

**Purpose**: Unified, type-safe pipeline for processing and rendering all marker types.

**Core Functionality**:

```typescript
export class MarkerManager {
    private map: L.Map;
    private addEventCallback: AddEventCallback | null;
    private severityThreshold: number;
    private markers: Map<string, MarkerEntry>;
    private loggedEventIds: Set<string>;
    
    // Process array of DataPoints
    processDataPoints(dataPoints: DataPoint[]): void
    
    // Compare by ID and update/add/remove as needed
    private processDataPoint(dataPoint: DataPoint): void
    
    // Create type-specific Leaflet markers
    private createMarker(dataPoint: DataPoint): L.Marker | L.CircleMarker | null
}
```

**Type Definitions**:
```typescript
export type AddEventCallback = (
    type: string,
    emoji: string,
    title: string,
    message: string,
    lat: number,
    lon: number,
    data: { markerId?: string; [key: string]: any },
    severity: number
) => void;

interface MarkerEntry {
    marker: L.Marker | L.CircleMarker;
    dataPoint: DataPoint;
}
```

**Key Features**:
- **Efficient Updates**: Only modifies changed markers
- **ID Tracking**: Maintains map of ID → marker for quick lookups
- **Event Logging**: Automatically logs new/updated events based on severity
- **Type-Specific Rendering**: Each data type has custom marker styling
- **Animation Support**: Integrates with animations.ts for new events

---

### 4. API Layer (`src/utils/api.ts`)

**Purpose**: Fetch data from external APIs with typed responses and fallback to sample data.

**Type Definition**:
```typescript
export interface APIResponse<T> {
    success: boolean;
    data: T;
}
```

**Structure**:
```typescript
// Sample data generator (always works)
export function generateSampleEarthquakes(): RawEarthquake[] { ... }

// API fetch function (tries real API, falls back to sample)
export async function fetchEarthquakes(): Promise<APIResponse<RawEarthquake[]>> {
    try {
        const response = await fetch(USGS_API);
        return { success: true, data: response };
    } catch (error) {
        return { success: false, data: generateSampleEarthquakes() };
    }
}
```

**Available Fetchers**:
- `fetchEarthquakes(): Promise<APIResponse<RawEarthquake[]>>`
- `fetchISS(): Promise<APIResponse<RawISS>>`
- `fetchVolcanic(): Promise<APIResponse<RawVolcano[]>>`
- `fetchHurricanes(): Promise<APIResponse<RawHurricane[]>>`
- `fetchTornadoes(): Promise<APIResponse<RawTornado[]>>`
- etc.

---

### 5. Severity System (`src/utils/severity.ts`)

**Purpose**: Calculate severity levels for event filtering using TypeScript enums.

**Severity Enum**:
```typescript
export enum SEVERITY {
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3,
    CRITICAL = 4
}

export const SEVERITY_LABELS: Record<number, string> = {
    1: 'Low',
    2: 'Medium',
    3: 'High',
    4: 'Critical'
};
```

**Calculation Functions**:
Each data type has a dedicated severity calculator:
```typescript
export function getEarthquakeSeverity(magnitude: number): SEVERITY
export function getHurricaneSeverity(category: number): SEVERITY
export function getTornadoSeverity(intensity: number): SEVERITY
export function getVolcanicSeverity(alertLevel: string): SEVERITY
// etc.
```

**Usage in Event Log**:
The EventLog component filters events based on a user-selected severity threshold, showing only events meeting or exceeding that level.

---

### 6. React Components (TypeScript)

#### App.tsx
**Role**: Main application orchestrator with full type safety

**Key Types**:
```typescript
interface MapController {
    zoomTo: (lat: number, lon: number, data?: { markerId?: string }) => void;
}

interface EventData {
    id: string;
    type: string;
    emoji: string;
    title: string;
    message: string;
    timestamp: number;
    lat?: number;
    lon?: number;
    data?: { markerId?: string; [key: string]: any };
    severity: number;
}
```

**Responsibilities**:
- Fetch data from all sources in parallel
- Convert raw data to DataPoints with type checking
- Manage global state (events, severity threshold, map controller)
- Pass typed props to child components

#### Map.tsx
**Role**: Map initialization and marker management

**Props Interface**:
```typescript
interface MapProps {
    dataPoints: DataPoint[];
    addEvent: AddEventCallback;
    severityThreshold: number;
    setMapController: (controller: MapController) => void;
    markerManagerRef: MutableRefObject<MarkerManager | null>;
}
```

**Important**: Uses multiple `useEffect` hooks with specific dependencies to prevent map flickering.

#### Legend.tsx
**Role**: Display legend and data counts

**Props Interface**:
```typescript
interface LegendProps {
    counts?: Record<string, number>;
    lastUpdate?: string;
}
```

**Features**:
- Shows real-time counts for each data type
- Minimizable UI
- Last update timestamp
- Color/symbol key for all data types

#### EventLog.tsx
**Role**: Display event log with filtering

**Props Interface**:
```typescript
interface EventLogProps {
    events: EventData[];
    onEventClick?: (event: EventData) => void;
    severityThreshold: number;
    onSeverityChange: (threshold: number) => void;
}
```

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

### 1. Update DataPoint Model (`models/DataPoint.ts`)

```typescript
// Add to DataSourceType enum
export enum DataSourceType {
    // ... existing types
    NEWTYPE = 'newtype'
}

// Add ID prefix
export const DataSourcePrefix: Record<DataSourceType, string> = {
    // ... existing prefixes
    [DataSourceType.NEWTYPE]: 'new'
};

// Define metadata interface
export interface NewTypeMetadata {
    property1: string;
    property2: number;
    // ... other fields
}

// Add to DataPointMetadata union
export type DataPointMetadata =
    | EarthquakeMetadata
    | ISSMetadata
    // ... existing types
    | NewTypeMetadata;
```

### 2. Create Sample Data Generator (`utils/api.ts`)

```typescript
export interface RawNewType {
    id?: string;
    lat: number;
    lon: number;
    property1: string;
    property2: number;
}

export function generateSampleNewType(): RawNewType[] {
    return [
        {
            id: 'sample-1',
            lat: 40.7128,
            lon: -74.0060,
            property1: 'value',
            property2: 42
        }
    ];
}

export async function fetchNewType(): Promise<APIResponse<RawNewType[]>> {
    try {
        // Try real API
        const response = await fetch('API_URL');
        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching new type:', error);
        return { success: false, data: generateSampleNewType() };
    }
}
```

### 3. Create Converter (`utils/converters.ts`)

```typescript
export function newTypeToDataPoint(item: RawNewType): DataPoint<NewTypeMetadata> {
    const uniqueId = item.id || `${item.lat}-${item.lon}`;
    const id = `${DataSourcePrefix[DataSourceType.NEWTYPE]}-${uniqueId}`;
    const severity = getNewTypeSeverity(item.property2);
    
    return new DataPoint(
        id,
        DataSourceType.NEWTYPE,
        item.lat,
        item.lon,
        `New Type Event`,
        `Property: ${item.property1}`,
        severity,
        Date.now(),
        '🆕', // emoji
        {
            property1: item.property1,
            property2: item.property2
        }
    );
}
```

### 4. Add Severity Calculator (`utils/severity.ts`)

```typescript
export function getNewTypeSeverity(property: number): SEVERITY {
    if (property >= 100) return SEVERITY.CRITICAL;
    if (property >= 50) return SEVERITY.HIGH;
    if (property >= 25) return SEVERITY.MEDIUM;
    return SEVERITY.LOW;
}
```

### 5. Add Marker Creator (`utils/MarkerManager.ts`)

```typescript
// Add case to createMarker() switch statement
case DataSourceType.NEWTYPE:
    return this.createNewTypeMarker(dataPoint);

// Implement marker creation method
private createNewTypeMarker(dataPoint: DataPoint): L.CircleMarker {
    const metadata = dataPoint.metadata as any;
    const color = getNewTypeColor(metadata.property2);
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

### 6. Add Helper Functions (`utils/helpers.ts`)

```typescript
export function getNewTypeColor(property: number): string {
    if (property >= 100) return '#ff0000';
    if (property >= 50) return '#ff9900';
    return '#ffcc00';
}
```

### 7. Update App.tsx

```typescript
// Add to fetch array in loadData()
const [/* ... */, newTypeResult] = await Promise.all([
    // ... existing fetches
    fetchNewType()
]);

// Add to DataPoint conversion
const allDataPoints: DataPoint[] = [
    // ... existing conversions
    ...convertBatch(newTypeResult.data, newTypeToDataPoint)
];
```

### 8. Update Legend (`components/Legend.tsx`)

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

# Type check
npx tsc --noEmit
```

### Development Server
The app runs at `http://localhost:5173/` (or 5174 if port is busy) with hot module reload.

### Key Dependencies
- **React 18** - UI framework
- **TypeScript 5** - Type safety and tooling
- **Vite** - Build tool and dev server
- **Leaflet** - Interactive maps
- **@types/react**, **@types/leaflet**, **@types/node** - Type definitions

---

## 🐛 Common Issues & Solutions

### Map Flickering
**Cause**: Dependencies in Map.tsx useEffect causing constant reinitialization  
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

### TypeScript Errors
**Cause**: Type mismatches or missing type definitions  
**Solution**: Run `npx tsc --noEmit` to see all errors, ensure proper types are defined

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

### Type Safety Benefits
- Catch errors at compile time instead of runtime
- Better IDE autocomplete and IntelliSense
- Refactoring is safer with type checking

---

## 🎯 Future Enhancements

### Potential Improvements
1. ✅ **TypeScript Migration** - Complete! (v3.0.0)
2. **Real API Integration** - Replace sample data with real APIs
3. **Backend Proxy** - Solve CORS issues with proxy server
4. **WebSocket Updates** - Real-time data streaming
5. **Historical Data** - Track and visualize event history
6. **Storm Tracking** - Show hurricane/tornado paths over time
7. **User Preferences** - Save settings (severity, visible layers)
8. **Mobile Optimization** - Improve touch interactions
9. **Offline Mode** - Cache data for offline viewing
10. **Export Functionality** - Export event data or screenshots
11. **Unit Tests** - Add comprehensive test coverage
12. **Storybook** - Component documentation and playground

---

## 📝 Code Style Guide

### Naming Conventions
- **Components**: PascalCase (e.g., `EventLog.tsx`)
- **Utilities**: camelCase (e.g., `converters.ts`)
- **Types/Interfaces**: PascalCase (e.g., `DataPoint`, `MapProps`)
- **Enums**: PascalCase (e.g., `DataSourceType`, `SEVERITY`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `SEVERITY_LABELS`)
- **CSS Classes**: kebab-case (e.g., `event-log`)

### File Organization
- One component per file
- Group related utilities in same file
- Keep files under 700 lines when possible
- Extract reusable logic to utility functions
- Co-locate types with their usage

### TypeScript Patterns
- Use interfaces for object shapes
- Use enums for fixed sets of values
- Use type unions for discriminated unions
- Prefer explicit return types for public APIs
- Use generics for reusable components

### React Patterns
- Use functional components with hooks
- Use `useCallback` for functions passed as props
- Use `useRef` for values that don't trigger re-renders
- Split complex effects into multiple focused effects
- Define prop interfaces for all components

---

## 🤝 Contributing

When contributing to this project:

1. **Understand the architecture** - Read this README fully
2. **Follow the data flow** - Raw data → DataPoint → MarkerManager → Render
3. **Maintain type safety** - All new code should be properly typed
4. **Test with sample data** - Ensure fallbacks work
5. **Add severity calculations** - New data types need severity functions
6. **Update documentation** - Keep this README current
7. **Consider performance** - Avoid unnecessary re-renders
8. **Run type checks** - `npx tsc --noEmit` before committing

---

## 📄 License

This project is open source and available for educational and demonstration purposes.

---

## 🙏 Credits

- **Earthquake Data**: USGS Earthquake Hazards Program
- **ISS Position**: wheretheiss.at API
- **Map Tiles**: CartoDB Dark Matter
- **Leaflet**: Open-source mapping library
- **Vite + React + TypeScript**: Modern web development tools

---

**Last Updated**: January 2026  
**Maintainer**: Add your name here  
**Version**: 3.0.0 (TypeScript + DataPoint Architecture)
