import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import CesiumMap from './components/CesiumMap';
import Legend from './components/Legend';
import EventLog from './components/EventLog';
import { 
    fetchEarthquakes, 
    fetchISS,
    fetchVolcanic, // ✅ REAL DATA - USGS Volcano Hazards Program API
    fetchHurricanes, // ✅ REAL DATA - NOAA National Hurricane Center API
    fetchWindPatterns, // ✅ REAL DATA - Open-Meteo API (sparse grid sampling)
    generateSampleHurricanes // For simulated data toggle
    // Simulated data sources (not yet implemented with real APIs):
    // fetchTornadoes, 
    // fetchAurora, 
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
    // Note: Wind data is now rendered as streamlines directly, not as DataPoints
    // Converters for simulated data (not yet enabled):
    // tornadoToDataPoint,
    // auroraToDataPoint,
    // precipitationToDataPoint,
    // rocketToDataPoint,
    // conflictToDataPoint,
    // protestToDataPoint,
    // unrestToDataPoint,
    // diseaseToDataPoint,
} from './utils/converters';
import { DataPoint } from './models/DataPoint';
import { CesiumMarkerManager } from './utils/CesiumMarkerManager';

interface MapController {
    zoomTo: (lat: number, lon: number, data?: { markerId?: string }) => void;
    startRotation: () => void;
    stopRotation: () => void;
    resetCamera: () => void;
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
    const [loadingStatus, setLoadingStatus] = useState<string>(''); // Current loading/rendering status
    const [windRateLimited, setWindRateLimited] = useState<boolean>(false); // Wind API rate limit warning
    const [cameraHeight, setCameraHeight] = useState<number>(0); // Camera altitude in meters
    const [autopilotEnabled, setAutopilotEnabled] = useState<boolean>(false); // Autopilot/screensaver mode
    const [autopilotMode, setAutopilotMode] = useState<'rotate' | 'wander' | 'iss'>('rotate'); // Current autopilot submode
    
    // Store marker manager instance
    const markerManagerRef = useRef<CesiumMarkerManager | null>(null);
    
    // Track if wind fetch is in progress to prevent concurrent fetches
    const windFetchInProgressRef = useRef<boolean>(false);

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
            // Fetch critical data sources first (fast - show map ASAP)
            setLoadingStatus('🔍 Fetching earthquake data...');
            const eqResult = await fetchEarthquakes();
            
            setLoadingStatus('🛰️ Fetching ISS position...');
            const issResult = await fetchISS();
            
            setLoadingStatus('🌋 Fetching volcanic activity...');
            const volcanicResult = await fetchVolcanic();
            
            setLoadingStatus('🌀 Fetching hurricane data...');
            const hurricaneResult = await fetchHurricanes();

            setLoadingStatus('🔄 Processing data...');

            // Convert critical data to DataPoints
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

            // Update state with critical data and show the map
            setDataPoints(allDataPoints);
            
            setLoadingStatus('🎨 Rendering markers...');
            
            // Process through marker manager if available
            if (markerManagerRef.current) {
                markerManagerRef.current.processDataPoints(allDataPoints);
            }

            updateTimestamp();
            setLoading(false);
            setLoadingStatus('');
            
            // Load wind patterns asynchronously in the background
            (async () => {
                // Prevent concurrent wind fetches
                if (windFetchInProgressRef.current) {
                    console.log('⚠️ Wind fetch already in progress, skipping...');
                    return;
                }
                
                windFetchInProgressRef.current = true;
                setLoadingStatus('💨 Fetching wind patterns: 0%');
                
                try {
                    const windResult = await fetchWindPatterns(
                        () => {
                            // Callback when rate limit is hit (called once, then fetch stops)
                            setWindRateLimited(true);
                            
                            // Auto-hide after 5 seconds
                            setTimeout(() => setWindRateLimited(false), 5000);
                        },
                        (percentage: number) => {
                            // Progress callback - show percentage
                            setLoadingStatus(`💨 Fetching wind data: ${percentage}%`);
                        }
                    );
                    
                    if (windResult.data.length > 0) {
                        setLoadingStatus('💨 Generating wind streamlines...');
                        
                        // Render wind as streamlines instead of individual markers
                        if (markerManagerRef.current) {
                            markerManagerRef.current.renderWindStreamlines(
                                windResult.data,
                                setLoadingStatus
                            );
                        }
                        
                        console.log(`✅ Successfully loaded and rendered wind streamlines`);
                    } else {
                        console.warn('⚠️ No wind data loaded - API may have failed');
                    }
                } finally {
                    // Always release the lock, even if there was an error
                    windFetchInProgressRef.current = false;
                    
                    // Clear loading status after wind data is loaded
                    setTimeout(() => setLoadingStatus(''), 1000);
                }
            })();
            
        } catch (error) {
            console.error('Error loading data:', error);
            setLoadingStatus('❌ Error loading data');
            setTimeout(() => setLoadingStatus(''), 3000);
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

    // Autopilot Mode Management
    useEffect(() => {
        if (!autopilotEnabled || !mapController) {
            // Stop any active modes when autopilot is disabled
            if (mapController) {
                mapController.stopRotation();
            }
            return;
        }

        // Execute current autopilot mode
        switch (autopilotMode) {
            case 'rotate':
                // When entering rotate mode, reset camera if needed (e.g., coming from wander mode)
                if (cameraHeight < 1000000) { // If zoomed in too close
                    mapController.resetCamera();
                    // Wait for camera reset before starting rotation
                    setTimeout(() => {
                        mapController.startRotation();
                    }, 2000);
                } else {
                    mapController.startRotation();
                }
                break;

            case 'wander':
                // TODO: Implement wander mode
                console.log('🎲 Wander mode - to be implemented');
                break;

            case 'iss':
                // TODO: Implement ISS tracking mode
                console.log('🛰️ ISS mode - to be implemented');
                break;
        }

        // Cleanup when mode changes or autopilot is disabled
        return () => {
            if (mapController) {
                mapController.stopRotation();
            }
        };
    }, [autopilotEnabled, autopilotMode, mapController, cameraHeight]);

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
                    <CesiumMap 
                        dataPoints={dataPoints}
                        addEvent={addEvent}
                        severityThreshold={severityThreshold}
                        setMapController={setMapController}
                        markerManagerRef={markerManagerRef}
                        onCameraHeightChange={setCameraHeight}
                    />
                    
                    {/* Camera Height Indicator */}
                    <div className="camera-height-indicator">
                        📏 Camera: {cameraHeight < 1000 
                            ? `${Math.round(cameraHeight)}m`
                            : cameraHeight < 1000000
                            ? `${(cameraHeight / 1000).toFixed(1)}km`
                            : `${(cameraHeight / 1000000).toFixed(2)}Mm`}
                    </div>
                    
                    {/* Autopilot Toggle */}
                    <div className="autopilot-toggle">
                        <label className="autopilot-label">
                            <input 
                                type="checkbox" 
                                checked={autopilotEnabled}
                                onChange={(e) => setAutopilotEnabled(e.target.checked)}
                                className="autopilot-checkbox"
                            />
                            <span className="autopilot-text">
                                Autopilot
                            </span>
                        </label>
                    </div>
                    
                    {/* Autopilot Mode Selector */}
                    {autopilotEnabled && (
                        <div className="autopilot-modes">
                            <label className="autopilot-mode-label">
                                <input 
                                    type="radio" 
                                    name="autopilot-mode"
                                    checked={autopilotMode === 'rotate'}
                                    onChange={() => setAutopilotMode('rotate')}
                                    className="autopilot-mode-radio"
                                />
                                <span className="autopilot-mode-text">
                                    🔄 Rotate
                                </span>
                            </label>
                            <label className="autopilot-mode-label">
                                <input 
                                    type="radio" 
                                    name="autopilot-mode"
                                    checked={autopilotMode === 'wander'}
                                    onChange={() => setAutopilotMode('wander')}
                                    className="autopilot-mode-radio"
                                />
                                <span className="autopilot-mode-text">
                                    🎲 Wander
                                </span>
                            </label>
                            <label className="autopilot-mode-label">
                                <input 
                                    type="radio" 
                                    name="autopilot-mode"
                                    checked={autopilotMode === 'iss'}
                                    onChange={() => setAutopilotMode('iss')}
                                    className="autopilot-mode-radio"
                                />
                                <span className="autopilot-mode-text">
                                    🛰️ ISS
                                </span>
                            </label>
                        </div>
                    )}
                    
                    {/* Loading Status Indicator */}
                    {loadingStatus && (
                        <div className="loading-status">
                            {loadingStatus}
                        </div>
                    )}
                    
                    {/* Wind Rate Limit Warning */}
                    {windRateLimited && (
                        <div className="rate-limit-warning">
                            ⚠️ Wind Data Rate Limited
                            <div style={{ fontSize: '0.75rem', marginTop: '0.35rem', opacity: 0.9 }}>
                                Partial data loaded. Will retry on next refresh.
                            </div>
                        </div>
                    )}
                    
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

