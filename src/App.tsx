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
    startISSTracking: () => void;
    stopISSTracking: () => void;
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
    
    // Track recently visited events for wander mode (to avoid immediate revisits)
    const recentlyVisitedRef = useRef<Set<string>>(new Set());

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

    // Individual data source update functions
    const updateISSData = useCallback(async () => {
        try {
            const issResult = await fetchISS();
            
            if (issResult.data) {
                const issDataPoint = issToDataPoint(issResult.data);
                
                // Update ISS in dataPoints
                setDataPoints(prevPoints => {
                    const withoutISS = prevPoints.filter(dp => dp.type !== 'iss');
                    return [...withoutISS, issDataPoint];
                });
                
                // Update entity in place (won't remove/recreate, maintains tracking)
                if (markerManagerRef.current) {
                    markerManagerRef.current.updateSingleEntity(issDataPoint);
                }
            }
        } catch (error) {
            console.error('Error updating ISS position:', error);
        }
    }, []);

    const updateEarthquakeData = useCallback(async () => {
        try {
            const eqResult = await fetchEarthquakes();
            const newEarthquakes = convertBatch(eqResult.data, earthquakeToDataPoint);
            
            setDataPoints(prevPoints => {
                const withoutEarthquakes = prevPoints.filter(dp => dp.type !== 'earthquake');
                const updated = [...withoutEarthquakes, ...newEarthquakes];
                
                // Update all entities (will add/update/remove as needed)
                if (markerManagerRef.current) {
                    markerManagerRef.current.processDataPoints(updated);
                }
                
                return updated;
            });
            
            console.log(`🌍 Earthquake data updated (${newEarthquakes.length} events)`);
        } catch (error) {
            console.error('Error updating earthquake data:', error);
        }
    }, []);

    const updateVolcanoData = useCallback(async () => {
        try {
            const volcanicResult = await fetchVolcanic();
            const newVolcanoes = convertBatch(volcanicResult.data, volcanoToDataPoint);
            
            setDataPoints(prevPoints => {
                const withoutVolcanoes = prevPoints.filter(dp => dp.type !== 'volcano');
                const updated = [...withoutVolcanoes, ...newVolcanoes];
                
                // Update all entities (will add/update/remove as needed)
                if (markerManagerRef.current) {
                    markerManagerRef.current.processDataPoints(updated);
                }
                
                return updated;
            });
            
            console.log(`🌋 Volcano data updated (${newVolcanoes.length} events)`);
        } catch (error) {
            console.error('Error updating volcano data:', error);
        }
    }, []);

    const updateHurricaneData = useCallback(async () => {
        try {
            const hurricaneResult = await fetchHurricanes();
            let newHurricanes = convertBatch(hurricaneResult.data, hurricaneToDataPoint);
            
            // Add simulated data if toggle is enabled and no real data exists
            if (showSimulatedData && hurricaneResult.data.length === 0) {
                const sampleHurricanes = generateSampleHurricanes();
                newHurricanes = convertBatch(sampleHurricanes, hurricaneToDataPoint);
            }
            
            setDataPoints(prevPoints => {
                const withoutHurricanes = prevPoints.filter(dp => dp.type !== 'hurricane');
                const updated = [...withoutHurricanes, ...newHurricanes];
                
                // Update all entities (will add/update/remove as needed)
                if (markerManagerRef.current) {
                    markerManagerRef.current.processDataPoints(updated);
                }
                
                return updated;
            });
            
            console.log(`🌀 Hurricane data updated (${newHurricanes.length} events)`);
        } catch (error) {
            console.error('Error updating hurricane data:', error);
        }
    }, [showSimulatedData]);

    const updateWindData = useCallback(async () => {
        // Prevent concurrent wind fetches
        if (windFetchInProgressRef.current) {
            console.log('⚠️ Wind fetch already in progress, skipping...');
            return;
        }
        
        windFetchInProgressRef.current = true;
        
        try {
            const windResult = await fetchWindPatterns(
                () => {
                    // Callback when rate limit is hit
                    setWindRateLimited(true);
                    setTimeout(() => setWindRateLimited(false), 5000);
                },
                (percentage: number) => {
                    // Progress callback
                    setLoadingStatus(`💨 Updating wind: ${percentage}%`);
                }
            );
            
            if (windResult.data.length > 0 && markerManagerRef.current) {
                setLoadingStatus('💨 Generating wind streamlines...');
                markerManagerRef.current.renderWindStreamlines(
                    windResult.data,
                    setLoadingStatus
                );
                console.log(`✅ Wind streamlines updated`);
            }
        } catch (error) {
            console.error('Error updating wind data:', error);
        } finally {
            windFetchInProgressRef.current = false;
            setTimeout(() => setLoadingStatus(''), 1000);
        }
    }, []);

    // Update marker manager severity threshold when it changes
    useEffect(() => {
        if (markerManagerRef.current) {
            markerManagerRef.current.setSeverityThreshold(severityThreshold);
        }
    }, [severityThreshold]);

    // Initial data load on mount
    useEffect(() => {
        loadData();
    }, [loadData]);

    // Individual data source update intervals
    useEffect(() => {
        // ISS: Every 1 second (fast-moving)
        const issInterval = setInterval(() => {
            updateISSData();
        }, 1000);

        return () => clearInterval(issInterval);
    }, [updateISSData]);

    useEffect(() => {
        // Earthquakes: Every 60 seconds
        const eqInterval = setInterval(() => {
            updateEarthquakeData();
        }, 60000);

        return () => clearInterval(eqInterval);
    }, [updateEarthquakeData]);

    useEffect(() => {
        // Volcanoes: Every 120 seconds (slow-changing)
        const volcanoInterval = setInterval(() => {
            updateVolcanoData();
        }, 120000);

        return () => clearInterval(volcanoInterval);
    }, [updateVolcanoData]);

    useEffect(() => {
        // Hurricanes: Every 30 seconds (moderate movement)
        const hurricaneInterval = setInterval(() => {
            updateHurricaneData();
        }, 30000);

        return () => clearInterval(hurricaneInterval);
    }, [updateHurricaneData]);

    useEffect(() => {
        // Wind: Every 5 minutes (slow-changing weather patterns)
        const windInterval = setInterval(() => {
            updateWindData();
        }, 300000);

        return () => clearInterval(windInterval);
    }, [updateWindData]);

    // Autopilot Mode Management
    useEffect(() => {
        if (!autopilotEnabled || !mapController) {
            // Stop any active modes when autopilot is disabled
            if (mapController) {
                mapController.stopRotation();
            }
            return;
        }

        console.log(`🚁 Autopilot mode changing to: ${autopilotMode}`);
        let wanderInterval: number | null = null;

        // Execute current autopilot mode
        switch (autopilotMode) {
            case 'rotate':
                // When entering rotate mode, reset camera to global view then start rotation
                mapController.resetCamera();
                // Wait for camera reset animation to complete before starting rotation
                setTimeout(() => {
                    mapController.startRotation();
                }, 2000); // Match the resetCamera duration
                break;

            case 'wander':
                console.log('🎲 Wander mode activated');
                
                // Function to select event weighted by severity
                const selectEvent = (): DataPoint | null => {
                    // Filter out ISS and recently visited events
                    const candidates = dataPoints.filter(dp => 
                        dp.type !== 'iss' && !recentlyVisitedRef.current.has(dp.id)
                    );
                    
                    if (candidates.length === 0) {
                        // All visited - clear history and retry
                        console.log('🎲 All events visited, clearing history');
                        recentlyVisitedRef.current.clear();
                        const fallback = dataPoints.filter(dp => dp.type !== 'iss');
                        if (fallback.length === 0) return null;
                        return fallback[Math.floor(Math.random() * fallback.length)];
                    }
                    
                    // Weight by severity (exponential: 2^severity)
                    const weights = candidates.map(dp => Math.pow(2, dp.severity));
                    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
                    
                    // Random selection weighted by severity
                    let random = Math.random() * totalWeight;
                    for (let i = 0; i < candidates.length; i++) {
                        random -= weights[i];
                        if (random <= 0) {
                            return candidates[i];
                        }
                    }
                    
                    return candidates[0]; // Fallback
                };
                
                // Function to visit next event
                const visitNext = () => {
                    const event = selectEvent();
                    if (event) {
                        console.log(`🎲 Visiting: ${event.title} (Severity: ${event.severity})`);
                        recentlyVisitedRef.current.add(event.id);
                        mapController.zoomTo(event.lat, event.lon, { markerId: event.id });
                        
                        // Keep history manageable (last 20)
                        if (recentlyVisitedRef.current.size > 20) {
                            const arr = Array.from(recentlyVisitedRef.current);
                            recentlyVisitedRef.current = new Set(arr.slice(-20));
                        }
                    } else {
                        console.log('🎲 No events to visit');
                    }
                };
                
                // Visit first event immediately
                visitNext();
                
                // Then visit every 10 seconds
                wanderInterval = window.setInterval(visitNext, 10000);
                console.log('🎲 Wander interval started (10s)');
                break;

            case 'iss':
                console.log('🛰️ ISS tracking mode activated');
                // Start tracking the ISS entity
                mapController.startISSTracking();
                break;
        }

        // Cleanup when mode changes or autopilot is disabled
        return () => {
            console.log(`🧹 Cleaning up autopilot mode: ${autopilotMode}`);
            if (mapController) {
                mapController.stopRotation();
                mapController.stopISSTracking();
            }
            if (wanderInterval !== null) {
                console.log('🧹 Clearing wander interval');
                clearInterval(wanderInterval);
            }
        };
    }, [autopilotEnabled, autopilotMode, mapController]);

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

