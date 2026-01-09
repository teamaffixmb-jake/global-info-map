# Global Data Screensaver

A real-time global data visualization application built with **React + TypeScript** that displays earthquakes, volcanic activity, hurricanes, and atmospheric wind patterns on an interactive **3D globe** with flowing streamlines.

## ✨ Key Features

- 🌍 **Interactive 3D Globe** - Powered by Cesium.js with smooth rotation, zoom, and tilt
- 🌊 **Wind Flow Streamlines** - Flowing curves with directional arrows showing global atmospheric circulation
- ⚡ **Real-Time Data** - Live earthquakes (USGS), volcanoes (USGS), hurricanes (NOAA), ISS position
- 🛰️ **ISS Tracking** - Smooth 100Hz interpolation with dynamic orbit computation and double-buffered visualization
- 🎯 **Smart Filtering** - Severity-based event filtering with minimizable UI
- ⏱️ **Time Indicators** - At-a-glance earthquake recency labels
- 📊 **Event Log** - Sortable event history with click-to-zoom
- 🔄 **Auto-Refresh** - Intelligent update intervals (ISS: 1s, Hurricanes: 30s, Earthquakes: 60s)
- 🚦 **Rate Limit Handling** - Graceful API rate limit detection with retry logic
- 🌙 **Dark Mode** - CartoDB Dark Matter tiles with starry night sky background
- ✈️ **Autopilot Mode** - Screensaver with rotate, wander, and ISS tracking modes
- 📏 **Camera Height Display** - Real-time altitude indicator for spatial orientation
- 🎨 **Dynamic Marker Scaling** - Markers scale with zoom level to prevent overlap

## 🌬️ Wind Streamline Visualization

### What Are Streamlines?

Streamlines are flowing curves that visualize atmospheric wind patterns by showing where air actually travels. Unlike static arrows, streamlines:

- **Follow the flow field** - Tangent to wind vectors at every point
- **Show circulation patterns** - Trade winds, westerlies, jet streams
- **Are smooth and curved** - RK2 integration for natural flow
- **Have directional arrows** - Clear indication of wind direction
- **Are color-coded** - Green (slow) to purple (fast) gradient

### Technical Implementation

- **Sparse Grid Sampling**: ~162 global data points (20° spacing)
- **Bilinear Interpolation**: Smooth wind estimation at any lat/lon
- **RK2 Integration**: 2nd-order Runge-Kutta for curved streamline tracing
- **Quality Filtering**: Removes artifacts and degenerate lines
- **Dateline Handling**: Proper splitting at 180°/-180° boundary
- **Progressive Fetching**: Shows real-time progress (0-100%)

### Data Source

Wind data from [Open-Meteo API](https://open-meteo.com/) with:
- 10m wind speed (mph)
- Wind direction (meteorological)
- Wind gusts
- Rate limit handling with 60s retry

## 🛰️ ISS Tracking & Interpolation System

The International Space Station is tracked in real-time with **smooth interpolation** and a **dynamic orbital path visualization**.

### Two-Loop Architecture

The system uses **separated concerns** with two independent loops:

#### 1. Data Update Loop (1 Hz - every 1 second)
**Purpose**: Fetch ISS data and compute orbital parameters

**Operations**:
- Fetches ISS position from API (lat, lon, altitude)
- Computes velocity vector from position change
- Calculates angular velocity: `ω = v / r`
- Determines orbital plane from `position × velocity`
- Updates orbit visualization with new trajectory
- Stores interpolation parameters

**Location**: `CesiumMarkerManager.updateISSData()`

#### 2. Rendering Loop (100 Hz - every 10ms)
**Purpose**: Smooth visual interpolation between API updates

**Operations**:
- Calculates elapsed time since last data update
- Computes angular displacement: `θ = ω × Δt`
- Rotates ISS position along orbital plane
- Updates entity position for smooth motion
- **Does NOT fetch data or compute orbit**

**Location**: `CesiumMarkerManager.interpolateISSPosition()`

### Orbital Path Computation

The orbit is computed **dynamically from real-time velocity data**:

1. **Velocity Vector**: `v = current_position - previous_position`
2. **Radial Vector**: Direction from Earth center to ISS
3. **Orbit Normal**: `n = radial × velocity` (perpendicular to orbital plane)
4. **Circular Path**: Great circle at ISS altitude in the orbital plane
5. **No Hard-Coding**: Inclination, orientation computed from actual motion

### Double-Buffered Orbit Visualization

To prevent visual flicker during orbit updates, the system uses **double-buffering**:

**How It Works**:
- Two orbit paths exist: `orbitPathA` and `orbitPathB`
- Both are created on initialization
- On each update, the **oldest orbit is modified in place**
- Tracks which orbit was last updated with `currentOrbit: 'A' | 'B'`
- While one orbit updates, the other remains visible

**Benefits**:
- ✅ No flicker - Always at least one orbit visible
- ✅ No entity deletion/creation - Just property updates
- ✅ Smooth transitions - Gradual orbit adjustments
- ✅ Performance - Reuses existing entities

**Implementation**: Alternates between updating orbitA and orbitB every second

### ISS Motion Details

**Velocity Calculation**:
```typescript
velocityMagnitude = |position₁ - position₀| // meters per second
angularVelocity = velocityMagnitude / orbitalRadius // radians per second
```

**Interpolation**:
```typescript
angularDisplacement = angularVelocity × deltaTime
rotatedPosition = rotate(basePosition, orbitNormal, angularDisplacement)
```

**Result**:
- ISS updates from API: **1 Hz** (every second)
- ISS visual updates: **100 Hz** (every 10ms)
- Smooth motion along computed orbital trajectory
- Realistic ~90 minute orbital period
- ISS velocity: ~7,660 m/s (27,576 km/h)

### State Management

The interpolation state is stored between updates:
```typescript
{
    basePosition: Cartesian3,        // Last known position
    angularVelocity: number,         // radians/ms
    orbitalPlaneNormal: Cartesian3,  // Perpendicular to orbit
    orbitalRadius: number,           // Earth radius + altitude
    lastUpdateTime: number           // Timestamp for Δt
}
```

## 🌐 3D Globe Features (v5.0.0)

This project now uses **Cesium.js** for photorealistic 3D globe visualization!

### Why 3D?

- **Natural perspective** - See the Earth as it actually looks from space
- **Better spatial understanding** - True distances and relative positions
- **WebGL performance** - Hardware-accelerated rendering
- **Camera freedom** - Rotate, zoom, tilt to any angle
- **True globe projection** - No distortion at poles like Mercator

### Technical Stack

- **Cesium.js 1.137** - Industry-standard 3D geospatial platform
- **Vanilla Cesium API** - Direct integration for maximum control and stability
- **Entity API** - Type-safe entity management with automatic cleanup
- **PolylineArrowMaterialProperty** - Built-in directional arrows for streamlines

### Coordinate System

Cesium uses **longitude-first** ordering (opposite of Leaflet):

```typescript
// Cesium (lon, lat, altitude)
Cartesian3.fromDegrees(lon, lat, heightInMeters)

// vs. Leaflet (lat, lon)
L.marker([lat, lon])
```

### Entity Types

Each data type is rendered as a Cesium entity:

- **Earthquakes** - `EllipseGraphics` with magnitude-based sizing, color, and time labels
- **Volcanoes** - `PolygonGraphics` with triangular shapes
- **Hurricanes** - `PointGraphics` + `LabelGraphics` with category coloring
- **ISS** - `PointGraphics` + `LabelGraphics` at ~400km altitude with:
  - Smooth 100Hz interpolation between 1Hz API updates
  - Dynamic orbital path computed from real-time velocity
  - Double-buffered cyan orbit visualization (no flicker)
  - Realistic motion along computed trajectory
- **Wind Streamlines** - `PolylineGraphics` with arrow materials and speed-based coloring

### Camera Controls

- **Left Click + Drag** - Rotate globe
- **Right Click + Drag** - Pan camera
- **Scroll Wheel** - Zoom in/out
- **Middle Click + Drag** - Tilt camera angle

### Dark Mode 🌙

The globe now features a **dark-themed base layer** using CartoDB Dark Matter tiles for:
- Reduced eye strain during extended viewing
- Better contrast for event markers
- Professional aesthetic
- Starry night sky background

The dark theme is applied by default through Cesium's imagery provider configuration:

```typescript
viewer.imageryLayers.addImageryProvider(
    new UrlTemplateImageryProvider({
        url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
        // ...
    })
);
```

### Camera Height Indicator 📏

A real-time **camera height display** is shown in the top-left corner, indicating the distance from the Earth's surface in kilometers or meters:
- Above 1000m: Shows in kilometers (e.g., "Camera: 7,234 km")
- Below 1000m: Shows in meters (e.g., "Camera: 847 m")
- Updates dynamically as you zoom in/out
- Helps with spatial orientation on the 3D globe

### Dynamic Marker Scaling 🎯

Markers automatically scale with camera height to maintain consistent visual size and prevent overlap:
- **Zoomed Out**: Markers appear appropriately sized for global view
- **Zooming In**: Markers progressively shrink to resolve overlapping events
- **Linear Scaling**: Below 7M meters, size scales linearly with camera height
- **Capped Maximum**: Above 7M meters, size is capped to prevent excessive growth

This allows you to:
- View global patterns when zoomed out
- Resolve individual events that occurred at nearly identical locations
- Always keep markers within screen bounds

Technical implementation:
```typescript
const baseScale = cameraHeight / 7_000_000; // Reference height: 7M meters
const scale = Math.max(0.3, Math.min(baseScale, 1.0));
marker.setRadius(baseSize * scale);
```

### Autopilot Mode ✈️

**Autopilot** is a screensaver-like feature that automates camera movement for hands-free viewing. Toggle it on/off with the checkbox in the top-left corner.

#### Implemented Modes ✅

1. **🔄 Rotate Mode** (Active)
   - Slow, continuous globe rotation
   - Smooth right-to-left motion
   - Maintains current zoom level
   - Can be interrupted by manual camera control

#### Planned Modes 🚧

2. **🎲 Wander Mode** (Not Yet Implemented)
   - Bounces between events based on severity/importance
   - Probabilistic selection favoring high-severity events
   - Avoids repeating recently visited events
   - Zooms in to show event details
   - Switches back to rotate mode after several events

3. **🛰️ ISS Mode** (Not Yet Implemented)
   - Tracks the International Space Station in real-time
   - Automatically selects and follows the ISS
   - Shows ISS beacon effect (yellow pulsing circles)
   - Maintains optimal viewing distance
   - Updates as ISS moves along its orbit

#### Technical Implementation

```typescript
// Autopilot state management
const [autopilotEnabled, setAutopilotEnabled] = useState(false);
const [autopilotMode, setAutopilotMode] = useState<'rotate' | 'wander' | 'iss'>('rotate');

// Mode switcher cycles through submodes
useEffect(() => {
    if (!autopilotEnabled) return;
    
    if (autopilotMode === 'rotate') {
        mapController?.startRotation();
    }
    // Future: wander, ISS modes
}, [autopilotEnabled, autopilotMode]);
```

The autopilot system is designed to be extensible, with additional modes planned for future releases.

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
6. **Performance First**: Concurrent fetch prevention, efficient rendering, quality filtering

---

## 📁 Project Structure

```
src/
├── App.tsx                    # Main application component with data orchestration
├── App.css                    # Global styles and animations
├── main.tsx                   # React entry point
├── components/
│   ├── CesiumMap.tsx         # 3D globe initialization and CesiumMarkerManager integration
│   ├── Legend.tsx            # Data legend with counts, minimizable UI, simulated data toggle
│   └── EventLog.tsx          # Event logging with severity filtering and clear button
├── models/
│   └── DataPoint.ts          # Unified data model with TypeScript types
├── types/
│   └── raw.ts                # Raw API response type definitions
├── utils/
│   ├── api.ts                # Data fetching with progress tracking and rate limiting
│   ├── converters.ts         # Raw data → DataPoint conversion with types
│   ├── CesiumMarkerManager.ts # Unified entity rendering pipeline + streamline renderer
│   ├── streamlines.ts        # Wind flow visualization algorithms
│   ├── severity.ts           # Severity calculation with enums
│   ├── helpers.ts            # Color/size/formatting utilities
│   └── animations.ts         # Marker animation functions
└── vite-env.d.ts             # Vite type declarations
```

---

## 🔄 Data Flow

```
1. App.tsx calls API fetch functions (utils/api.ts)
   ↓
2. Typed API responses returned (APIResponse<T>)
   - Progress callbacks for wind data (0-100%)
   - Rate limit detection and handling
   ↓
3. Converters (utils/converters.ts) transform raw data → DataPoints
   ↓
4. DataPoints passed to CesiumMarkerManager (utils/CesiumMarkerManager.ts)
   ↓
5. CesiumMarkerManager compares with existing entities by ID
   ↓
6. Updates existing entities OR adds new entities OR removes old entities
   ↓
7. Wind data → Streamline generation → Polyline rendering
   ↓
8. New events logged to EventLog if severity threshold met
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
- `wnd` - Wind patterns (not used for streamlines)
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

### 2. Streamline System (`src/utils/streamlines.ts`) 🆕

**Purpose**: Generate flowing wind visualization using computational fluid dynamics techniques.

**Core Functions**:

```typescript
// Interpolate wind at any lat/lon from sparse grid
export function interpolateWind(
    lat: number,
    lon: number,
    windData: RawWind[]
): { direction: number; speed: number } | null

// Trace a streamline from a seed point
export function traceStreamline(
    seedLat: number,
    seedLon: number,
    windData: RawWind[],
    maxSteps: number,
    stepSize: number
): Streamline | null

// Generate seed points for streamline starts
export function generateSeedPoints(
    spacing: number,
    jitter: number
): Array<{ lat: number; lon: number }>

// Color gradient for wind speed
export function getWindColor(speed: number): string // Green → Purple

// Opacity based on wind strength
export function getWindOpacity(speed: number): number // 0.4 → 0.8
```

**Algorithm Details**:
- **Inverse Distance Weighting**: Interpolates wind from 4 nearest neighbors
- **RK2 Integration**: Runge-Kutta 2nd order for smooth curve tracing
- **Adaptive Step Size**: 0.6° steps for fine-grained sampling
- **Quality Filtering**: Rejects artifacts based on curvature, distance, speed
- **Dateline Handling**: Splits streamlines at longitude ±180° boundary

**Performance Optimizations**:
- Sparse grid to minimize API calls (~162 points globally)
- Progressive fetching with 200ms delays between requests
- Concurrent fetch prevention to avoid rate limits
- Efficient distance calculations with early termination

---

### 3. Converters (`src/utils/converters.ts`)

**Purpose**: Transform raw API data into standardized, typed DataPoint objects.

**Type Definitions**:
Each data source has defined raw types in `src/types/raw.ts`:
```typescript
export interface RawEarthquake {
    id?: string;
    geometry: { coordinates: [number, number, number?] };
    properties: {
        mag: number;
        place: string;
        time: number;
        url?: string;
    };
}

export interface RawWind {
    lat: number;
    lon: number;
    speed: number;
    direction: number;
    gusts: number;
    time: number;
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

### 4. CesiumMarkerManager (`src/utils/CesiumMarkerManager.ts`)

**Purpose**: Unified, type-safe pipeline for processing and rendering all entity types + wind streamlines on the 3D globe.

**Core Functionality**:

```typescript
export class CesiumMarkerManager {
    private viewer: Cesium.Viewer;
    private addEventCallback: AddEventCallback | null;
    private severityThreshold: number;
    private markers: Map<string, MarkerEntry>;
    private loggedEventIds: Set<string>;
    private streamlines: L.Polyline[];
    private windGridData: RawWind[];
    
    // Process array of DataPoints
    processDataPoints(dataPoints: DataPoint[]): void
    
    // Render wind as streamlines (not markers!)
    renderWindStreamlines(
        windData: RawWind[], 
        setLoadingMessage?: (msg: string) => void
    ): void
    
    // Compare by ID and update/add/remove as needed
    private processDataPoint(dataPoint: DataPoint): void
    
    // Create type-specific Cesium entities
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
    timeLabel?: L.Marker; // For earthquake time indicators
}
```

**Key Features**:
- **Efficient Updates**: Only modifies changed markers
- **ID Tracking**: Maintains map of ID → marker for quick lookups
- **Event Logging**: Automatically logs new/updated events based on severity
- **Type-Specific Rendering**: Each data type has custom marker styling
- **Animation Support**: Integrates with animations.ts for new events
- **Streamline Rendering**: Generates and renders flowing wind patterns
- **Quality Filtering**: `isValidStreamline()` removes artifacts
- **Dateline Splitting**: `splitStreamlineAtDateline()` handles ±180° wrapping

**Earthquake Time Labels** 🆕:
- Automatically added to each earthquake marker
- Shows concise time format: "5m ago", "2h ago", "3d ago"
- Color-matched to earthquake severity
- Positioned to the right of marker
- Non-interactive, semi-transparent

---

### 5. API Layer (`src/utils/api.ts`)

**Purpose**: Fetch data from external APIs with typed responses, progress tracking, and rate limit handling.

**Type Definition**:
```typescript
export interface APIResponse<T> {
    success: boolean;
    data: T;
}
```

**Real Data Sources**:
- ✅ **Earthquakes**: [USGS](https://earthquake.usgs.gov/) - Magnitude 2.5+ from last 24h
- ✅ **ISS Position**: [wheretheiss.at](http://wheretheiss.at/) - Real-time orbital position
- ✅ **Volcanoes**: [USGS Volcano Hazards Program](https://volcanoes.usgs.gov/) - US volcano alerts
- ✅ **Hurricanes**: [NOAA NHC](https://www.nhc.noaa.gov/) (via CORS proxy) - Active tropical cyclones
- ✅ **Wind Patterns**: [Open-Meteo](https://open-meteo.com/) - Global wind data with sparse grid sampling

**Simulated Data** (Toggle in Legend):
- Tornadoes, Aurora, Precipitation, Rocket Launches, Conflicts, Protests, Social Unrest, Disease Outbreaks

**Advanced Features**:

**Progressive Wind Fetching**:
```typescript
export async function fetchWindPatterns(
    onRateLimitCallback?: () => void,
    onProgressCallback?: (percentage: number) => void
): Promise<APIResponse<RawWind[]>>
```
- Reports progress: 0% → 100%
- Sequential fetching with 200ms delays
- Rate limit detection (429 status)
- Automatic 60s retry on rate limit
- Concurrent fetch prevention

**CORS Proxy for NOAA**:
```typescript
const response = await fetch(
    'https://corsproxy.io/?' + encodeURIComponent('https://www.nhc.noaa.gov/CurrentStorms.json')
);
```

**Fallback Strategy**:
```typescript
export async function fetchEarthquakes(): Promise<APIResponse<RawEarthquake[]>> {
    try {
        const response = await fetch(USGS_API);
        return { success: true, data: response };
    } catch (error) {
        return { success: false, data: generateSampleEarthquakes() };
    }
}
```

---

### 6. Severity System (`src/utils/severity.ts`)

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

### 7. React Components (TypeScript)

#### App.tsx
**Role**: Main application orchestrator with full type safety

**Key State**:
```typescript
const [loading, setLoading] = useState<boolean>(true);
const [loadingStatus, setLoadingStatus] = useState<string>('');
const [windRateLimited, setWindRateLimited] = useState<boolean>(false);
const [showSimulatedData, setShowSimulatedData] = useState<boolean>(false);
const windFetchInProgressRef = useRef<boolean>(false);
```

**Key Features**:
- Parallel data fetching with `Promise.all()`
- Asynchronous wind streamline rendering
- Rate limit detection with retry logic
- Concurrent fetch prevention
- 60-second auto-refresh
- Loading progress indicators

**Responsibilities**:
- Fetch data from all sources
- Convert raw data to DataPoints
- Manage global state
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
    markerManagerRef: MutableRefObject<CesiumMarkerManager | null>;
}
```

**Important**: Uses multiple `useEffect` hooks with specific dependencies to prevent map flickering.

#### Legend.tsx
**Role**: Display legend, data counts, and controls

**Props Interface**:
```typescript
interface LegendProps {
    counts?: Record<string, number>;
    lastUpdate?: string;
    showSimulatedData?: boolean;
    onSimulatedDataToggle?: (show: boolean) => void;
}
```

**Features**:
- Shows real-time counts for each data type
- Minimizable UI
- Last update timestamp
- **Simulated Data Toggle** - Enable/disable sample data
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
    onClearEvents?: () => void;
}
```

**Features**:
- Shows last 100 events
- Auto-scrolls only if already at bottom
- Severity filtering dropdown
- Click to zoom to event location
- **Clear button** - Remove all events
- Minimizable transparent panel

---

## 🎨 Styling & UI

### Color Scheme
- Background: Dark theme (`#111827`)
- Panels: Semi-transparent with backdrop blur
- Markers: Color-coded by severity/intensity
- Wind Streamlines: Green (5 mph) → Purple (60+ mph) gradient

### Marker Styles
- **Earthquakes**: Circle markers with time labels, size by magnitude, color by magnitude
- **Volcanoes**: Triangle markers, color by alert level (red/orange/yellow/gray)
- **Hurricanes**: Spinning cyclone emoji, size by category, color-coded
- **ISS**: Animated rotating satellite icon with yellow pulsing beacon circles
- **Wind Streamlines**: Flowing polylines with directional arrows, green-to-purple gradient

### Animations
- **Bounce**: New events bounce to draw attention
- **Pulse**: Very recent events pulse continuously
- **Rotate**: ISS icon rotates continuously
- **Spin**: Hurricane icons spin continuously

### Loading Indicators
- Main loading screen with spinning animation
- Progressive wind fetch: "Fetching wind data: 45%"
- Streamline generation: "Generating wind streamlines..."
- Rate limit warning: Red popup with 60s countdown

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
- **Cesium.js 1.137** - Interactive 3D globe with WebGL rendering
- **@types/react**, **@types/leaflet**, **@types/node** - Type definitions

---

## 🐛 Common Issues & Solutions

### Map Flickering
**Cause**: Dependencies in Map.tsx useEffect causing constant reinitialization  
**Solution**: Use `useCallback` for functions passed as props, split effects by concern

### Wind Data Rate Limiting (429 Errors)
**Cause**: Open-Meteo API has request limits  
**Solution**: 
- App detects 429 errors automatically
- Shows red warning popup with countdown
- Returns partial data collected before rate limit
- Retries on next 60s refresh
- Concurrent fetch prevention

### CORS Errors (Hurricanes)
**Cause**: NOAA API blocks direct browser requests  
**Solution**: Uses `corsproxy.io` to proxy requests

### Horizontal Line Artifacts in Streamlines
**Cause**: Streamlines crossing dateline (180°/-180°)  
**Solution**: 
- `splitStreamlineAtDateline()` detects large longitude jumps
- Renders each segment separately
- Skips arrows across dateline

### Entities Not Updating
**Cause**: CesiumMarkerManager not receiving updated DataPoints  
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
- Time labels managed alongside markers

### Streamline Performance
- Quality filtering removes ~30-40% of generated streamlines
- Dateline splitting creates multiple smaller polylines
- Arrows placed every 10 points (not every point)
- Cesium's PolylineArrowMaterialProperty provides efficient directional arrows

### Memory Management
- Event log keeps only last 100 events
- Marker cleanup in useEffect return functions
- Clear intervals for animations on marker removal
- Streamlines and arrows cleaned up on data refresh

### Data Refresh Strategy
- Auto-refresh every 60 seconds
- All API calls made in parallel with `Promise.all()`
- Wind data fetched asynchronously after main data
- Non-blocking updates with React state
- Concurrent fetch prevention with ref-based locks

### Rate Limit Mitigation
- Sequential wind fetching with 200ms delays
- Sparse grid sampling (162 points vs thousands)
- 429 detection stops fetching immediately
- 60-second cooldown before retry
- Graceful degradation with partial data

### Type Safety Benefits
- Catch errors at compile time instead of runtime
- Better IDE autocomplete and IntelliSense
- Refactoring is safer with type checking
- Self-documenting code with interfaces

---

## 🎯 Future Enhancements

### Completed ✅
1. **TypeScript Migration** - Full type safety (v3.0.0)
2. **Real API Integration** - Earthquakes, ISS, Volcanoes, Hurricanes, Wind
3. **Wind Streamlines** - Advanced atmospheric visualization
4. **Rate Limit Handling** - Graceful 429 error recovery
5. **Time Indicators** - Earthquake recency labels
6. **Simulated Data Toggle** - User control over sample data
7. **Event Log Clearing** - Clear button for event history
8. **3D Globe Conversion** - Complete! Migrated to Cesium.js (v5.0.0)
9. **Dark Mode** - CartoDB Dark Matter tiles with starry sky background
10. **Camera Height Display** - Real-time altitude indicator
11. **Dynamic Marker Scaling** - Zoom-aware marker sizing to prevent overlap
12. **Autopilot Rotate Mode** - Automated globe rotation for screensaver mode
13. **Autopilot Wander Mode** - Probabilistic event exploration based on severity
14. **Autopilot ISS Mode** - Real-time ISS tracking with camera following
15. **ISS Smooth Interpolation** - 100Hz rendering with velocity-based orbit computation
16. **Double-Buffered Orbit Visualization** - Flicker-free dynamic orbital path updates
17. **Staggered Data Update Intervals** - Optimized refresh rates per data source

### Potential Future Work 🚀
3. **WebSocket Updates** - Real-time data streaming instead of polling
4. **Historical Data** - Track and visualize event history over time
5. **Storm Tracking** - Show hurricane/tornado paths with historical positions
6. **User Preferences** - Save settings (severity, visible layers, theme)
7. **Mobile Optimization** - Improve touch interactions and performance
8. **Offline Mode** - Cache data for offline viewing with service workers
9. **Export Functionality** - Export event data (CSV/JSON) or screenshots
10. **Backend Proxy** - Dedicated proxy server to eliminate CORS issues
11. **Unit Tests** - Add comprehensive test coverage with Vitest
12. **Storybook** - Component documentation and playground
13. **Time Slider** - Scrub through historical earthquake/weather data
14. **Multiple Globe Themes** - Toggle between different tile styles and skyboxes
15. **Altitude Visualization** - 3D height based on earthquake depth
16. **Performance Profiling** - Optimize for lower-end devices
17. **Entity Clustering** - Group nearby events when zoomed out
18. **Improved Selection UX** - Better click handling and camera movement

---

## 📝 Code Style Guide

### Naming Conventions
- **Components**: PascalCase (e.g., `EventLog.tsx`)
- **Utilities**: camelCase (e.g., `converters.ts`, `streamlines.ts`)
- **Types/Interfaces**: PascalCase (e.g., `DataPoint`, `MapProps`)
- **Enums**: PascalCase (e.g., `DataSourceType`, `SEVERITY`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `SEVERITY_LABELS`)
- **CSS Classes**: kebab-case (e.g., `event-log`, `streamline-arrow`)

### File Organization
- One component per file
- Group related utilities in same file
- Keep files under 1000 lines when possible
- Extract reusable logic to utility functions
- Co-locate types with their usage in `types/` folder

### TypeScript Patterns
- Use interfaces for object shapes
- Use enums for fixed sets of values
- Use type unions for discriminated unions
- Prefer explicit return types for public APIs
- Use generics for reusable components
- Avoid `any` - use `unknown` or proper types

### React Patterns
- Use functional components with hooks
- Use `useCallback` for functions passed as props
- Use `useRef` for values that don't trigger re-renders
- Split complex effects into multiple focused effects
- Define prop interfaces for all components
- Wrap async operations in try/catch

### Performance Patterns
- Memoize expensive calculations with `useMemo`
- Debounce rapid user interactions
- Use `useCallback` to prevent re-renders
- Lazy load components when appropriate
- Batch state updates

---

## 🔒 API Keys & Secrets

This project uses **public, free APIs** that don't require authentication:
- USGS Earthquake API - No key needed
- wheretheiss.at - No key needed
- USGS Volcanoes - No key needed
- NOAA Hurricane Center - No key needed (using CORS proxy)
- Open-Meteo - No key needed (rate limited to ~600 requests/day)

**Note**: If you exceed Open-Meteo's rate limit, the app will:
1. Detect the 429 error
2. Show a warning popup
3. Return partial wind data
4. Automatically retry after 60 seconds

---

## 🤝 Contributing

When contributing to this project:

1. **Understand the architecture** - Read this README fully
2. **Follow the data flow** - Raw data → DataPoint → CesiumMarkerManager → Render
3. **Maintain type safety** - All new code should be properly typed
4. **Test with sample data** - Ensure fallbacks work
5. **Add severity calculations** - New data types need severity functions
6. **Update documentation** - Keep this README current
7. **Consider performance** - Avoid unnecessary re-renders
8. **Run type checks** - `npx tsc --noEmit` before committing
9. **Test rate limits** - Ensure graceful degradation
10. **Check dateline crossings** - Test with global data

---

## 📄 License

This project is open source and available for educational and demonstration purposes.

---

## 🙏 Credits & Data Sources

### APIs & Data Providers
- **Earthquake Data**: [USGS Earthquake Hazards Program](https://earthquake.usgs.gov/)
- **ISS Position**: [wheretheiss.at API](http://wheretheiss.at/)
- **Volcanic Activity**: [USGS Volcano Hazards Program](https://volcanoes.usgs.gov/)
- **Hurricane Data**: [NOAA National Hurricane Center](https://www.nhc.noaa.gov/)
- **Wind Data**: [Open-Meteo](https://open-meteo.com/)
- **CORS Proxy**: [corsproxy.io](https://corsproxy.io/)

### Libraries & Tools
- **Map Tiles**: CartoDB Dark Matter
- **Cesium.js**: Open-source 3D globe and mapping platform
- **React**: UI framework by Meta
- **TypeScript**: Static typing by Microsoft
- **Vite**: Build tool by Evan You

### Algorithms & Techniques
- **Streamline Visualization**: Based on computational fluid dynamics techniques
- **RK2 Integration**: Runge-Kutta 2nd order numerical integration
- **Inverse Distance Weighting**: Spatial interpolation technique

---

**Last Updated**: January 2026  
**Version**: 5.1.0 (ISS Tracking & Interpolation)  
**Status**: Production Ready  
**Recent Changes**: ISS smooth interpolation (100Hz), dynamic orbit computation, double-buffered visualization, autopilot wander & ISS modes, staggered data updates  
**Milestone**: Advanced ISS tracking with real-time orbit computation and flicker-free visualization!
