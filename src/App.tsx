import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import Map from './components/Map';
import Legend from './components/Legend';
import EventLog from './components/EventLog';
import { 
    fetchEarthquakes, 
    fetchISS, 
    fetchVolcanic, 
    fetchHurricanes, 
    fetchTornadoes, 
    fetchAurora, 
    fetchWindPatterns, 
    fetchPrecipitation, 
    fetchRocketLaunches, 
    fetchConflicts, 
    fetchProtests, 
    fetchSocialUnrest, 
    fetchDiseaseOutbreaks 
} from './utils/api';
import {
    earthquakeToDataPoint,
    issToDataPoint,
    volcanoToDataPoint,
    hurricaneToDataPoint,
    tornadoToDataPoint,
    auroraToDataPoint,
    windToDataPoint,
    precipitationToDataPoint,
    rocketToDataPoint,
    conflictToDataPoint,
    protestToDataPoint,
    unrestToDataPoint,
    diseaseToDataPoint,
    convertBatch
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

    const loadData = async () => {
        try {
            // Fetch all data in parallel
            const [
                eqResult, 
                issResult, 
                volcanicResult, 
                hurricaneResult, 
                tornadoResult, 
                auroraResult, 
                windResult, 
                precipResult, 
                rocketResult, 
                conflictResult, 
                protestResult, 
                unrestResult, 
                diseaseResult
            ] = await Promise.all([
                fetchEarthquakes(),
                fetchISS(),
                fetchVolcanic(),
                fetchHurricanes(),
                fetchTornadoes(),
                fetchAurora(),
                fetchWindPatterns(),
                fetchPrecipitation(),
                fetchRocketLaunches(),
                fetchConflicts(),
                fetchProtests(),
                fetchSocialUnrest(),
                fetchDiseaseOutbreaks()
            ]);

            // Convert all raw data to DataPoints
            const allDataPoints: DataPoint[] = [
                ...convertBatch(eqResult.data, earthquakeToDataPoint),
                ...(issResult.data ? [issToDataPoint(issResult.data)] : []),
                ...convertBatch(volcanicResult.data, volcanoToDataPoint),
                ...convertBatch(hurricaneResult.data, hurricaneToDataPoint),
                ...convertBatch(tornadoResult.data, tornadoToDataPoint),
                ...convertBatch(auroraResult.data, auroraToDataPoint),
                ...convertBatch(windResult.data, windToDataPoint),
                ...convertBatch(precipResult.data, precipitationToDataPoint),
                ...convertBatch(rocketResult.data, rocketToDataPoint),
                ...convertBatch(conflictResult.data, conflictToDataPoint),
                ...convertBatch(protestResult.data, protestToDataPoint),
                ...convertBatch(unrestResult.data, unrestToDataPoint),
                ...convertBatch(diseaseResult.data, diseaseToDataPoint)
            ];

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
    };

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
    }, []);

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
                    <Legend counts={counts} lastUpdate={lastUpdate} />
                    <EventLog 
                        events={events} 
                        onEventClick={handleEventClick}
                        severityThreshold={severityThreshold}
                        onSeverityChange={setSeverityThreshold}
                    />
                </>
            )}
        </div>
    );
}

export default App;

