import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import Map from './components/Map';
import Legend from './components/Legend';
import EventLog from './components/EventLog';
import { 
    fetchEarthquakes, 
    fetchISS,
    fetchVolcanic, // ✅ REAL DATA - USGS Volcano Hazards Program API
    fetchHurricanes, // ✅ REAL DATA - NOAA National Hurricane Center API
    generateSampleHurricanes // For simulated data toggle
    // Simulated data sources (not yet implemented with real APIs):
    // fetchTornadoes, 
    // fetchAurora, 
    // fetchWindPatterns, 
    // fetchPrecipitation, 
    // fetchRocketLaunches, 
    // fetchConflicts, 
    // fetchProtests, 
    // fetchSocialUnrest, 
    // fetchDiseaseOutbreaks 
} from './utils/api';
import {
    earthquakeToDataPoint,
    issToDataPoint,
    volcanoToDataPoint, // ✅ Real volcanic data converter
    hurricaneToDataPoint, // ✅ Real hurricane data converter
    convertBatch
    // Converters for simulated data (not yet enabled):
    // tornadoToDataPoint,
    // auroraToDataPoint,
    // windToDataPoint,
    // precipitationToDataPoint,
    // rocketToDataPoint,
    // conflictToDataPoint,
    // protestToDataPoint,
    // unrestToDataPoint,
    // diseaseToDataPoint,
} from './utils/converters';
import { DataPoint } from './models/DataPoint';
import { MarkerManager } from './utils/MarkerManager';

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

function App() {
    const [lastUpdate, setLastUpdate] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [events, setEvents] = useState<EventData[]>([]);
    const [mapController, setMapController] = useState<MapController | null>(null);
    const [severityThreshold, setSeverityThreshold] = useState<number>(1); // Default: show all (LOW and above)
    const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
    const [showSimulatedData, setShowSimulatedData] = useState<boolean>(false); // Toggle for sample data
    
    // Store marker manager instance
    const markerManagerRef = useRef<MarkerManager | null>(null);

    const addEvent = useCallback((
        type: string, 
        emoji: string, 
        title: string, 
        message: string, 
        lat: number, 
        lon: number, 
        data: { markerId?: string; [key: string]: any }, 
        severity: number
    ) => {
        // Only add event if severity meets or exceeds threshold
        if (severity < severityThreshold) {
            return;
        }
        
        const event: EventData = {
            id: `${type}-${Date.now()}-${Math.random()}`,
            type,
            emoji,
            title,
            message,
            timestamp: Date.now(),
            lat,
            lon,
            data,
            severity
        };
        setEvents(prevEvents => [...prevEvents, event].slice(-100)); // Keep last 100 events
    }, [severityThreshold]);

    const handleEventClick = (event: EventData) => {
        if (mapController && event.lat !== undefined && event.lon !== undefined) {
            mapController.zoomTo(event.lat, event.lon, event.data);
        }
    };

    const loadData = useCallback(async () => {
        try {
            // Fetch real data sources
            // ✅ Earthquakes - USGS Earthquake API
            // ✅ ISS - WhereTheISS.at API
            // ✅ Volcanoes - USGS Volcano Hazards Program API (U.S. only)
            // ✅ Hurricanes - NOAA National Hurricane Center API (Atlantic, E. Pacific, C. Pacific)
            const [
                eqResult, 
                issResult,
                volcanicResult,
                hurricaneResult
            ] = await Promise.all([
                fetchEarthquakes(),
                fetchISS(),
                fetchVolcanic(),
                fetchHurricanes()
            ]);

            // Convert all raw data to DataPoints (only real data)
            let allDataPoints: DataPoint[] = [
                ...convertBatch(eqResult.data, earthquakeToDataPoint),
                ...(issResult.data ? [issToDataPoint(issResult.data)] : []),
                ...convertBatch(volcanicResult.data, volcanoToDataPoint),
                ...convertBatch(hurricaneResult.data, hurricaneToDataPoint)
            ];
            
            // Add simulated data if toggle is enabled and no real data exists
            if (showSimulatedData) {
                // Add sample hurricanes if no real hurricanes exist
                if (hurricaneResult.data.length === 0) {
                    const sampleHurricanes = generateSampleHurricanes();
                    allDataPoints = [
                        ...allDataPoints,
                        ...convertBatch(sampleHurricanes, hurricaneToDataPoint)
                    ];
                    console.log('🧪 Added sample hurricane data (toggle enabled)');
                }
            } else {
                console.log('ℹ️  Simulated data toggle OFF - showing only real data');
            }

            // Update state with new data points
            setDataPoints(allDataPoints);
            
            // Process through marker manager if available
            if (markerManagerRef.current) {
                markerManagerRef.current.processDataPoints(allDataPoints);
            }

            updateTimestamp();
            setLoading(false);
        } catch (error) {
            console.error('Error loading data:', error);
            setLoading(false);
        }
    }, [showSimulatedData]); // Add showSimulatedData as dependency

    const updateTimestamp = () => {
        const now = new Date();
        setLastUpdate(now.toLocaleTimeString());
    };

    // Update marker manager severity threshold when it changes
    useEffect(() => {
        if (markerManagerRef.current) {
            markerManagerRef.current.setSeverityThreshold(severityThreshold);
        }
    }, [severityThreshold]);

    useEffect(() => {
        loadData();
        
        // Auto-refresh every minute
        const interval = setInterval(() => {
            loadData();
        }, 60000);

        return () => clearInterval(interval);
    }, [loadData]); // Include loadData as dependency since it now uses useCallback

    // Calculate counts by type
    const getCountsByType = (): Record<string, number> => {
        const counts: Record<string, number> = {};
        dataPoints.forEach(dp => {
            counts[dp.type] = (counts[dp.type] || 0) + 1;
        });
        return counts;
    };

    const counts = getCountsByType();

    return (
        <div className="app">
            {loading ? (
                <div id="loading">
                    <div>🌍 Loading map...</div>
                    <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                        Please wait
                    </div>
                </div>
            ) : (
                <>
                    <Map 
                        dataPoints={dataPoints}
                        addEvent={addEvent}
                        severityThreshold={severityThreshold}
                        setMapController={setMapController}
                        markerManagerRef={markerManagerRef}
                    />
                    <Legend 
                        counts={counts} 
                        lastUpdate={lastUpdate}
                        showSimulatedData={showSimulatedData}
                        onToggleSimulatedData={setShowSimulatedData}
                    />
                    <EventLog 
                        events={events} 
                        onEventClick={handleEventClick}
                        severityThreshold={severityThreshold}
                        onSeverityChange={setSeverityThreshold}
                        onClearEvents={() => setEvents([])}
                    />
                </>
            )}
        </div>
    );
}

export default App;

