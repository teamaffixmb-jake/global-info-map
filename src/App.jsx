import { useState, useEffect, useRef } from 'react';
import './App.css';
import Header from './components/Header';
import Map from './components/Map';
import Legend from './components/Legend';
import EventLog from './components/EventLog';
import { fetchEarthquakes, fetchISS, fetchVolcanic, fetchHurricanes, fetchTornadoes, fetchAurora, fetchWindPatterns, fetchPrecipitation, fetchRocketLaunches, fetchConflicts, fetchProtests, fetchSocialUnrest, fetchDiseaseOutbreaks } from './utils/api';

function App() {
    const [earthquakeData, setEarthquakeData] = useState([]);
    const [issData, setIssData] = useState(null);
    const [volcanicData, setVolcanicData] = useState([]);
    const [hurricaneData, setHurricaneData] = useState([]);
    const [tornadoData, setTornadoData] = useState([]);
    const [auroraData, setAuroraData] = useState([]);
    const [windData, setWindData] = useState([]);
    const [precipitationData, setPrecipitationData] = useState([]);
    const [rocketData, setRocketData] = useState([]);
    const [conflictData, setConflictData] = useState([]);
    const [protestData, setProtestData] = useState([]);
    const [unrestData, setUnrestData] = useState([]);
    const [diseaseData, setDiseaseData] = useState([]);
    const [lastUpdate, setLastUpdate] = useState('');
    const [loading, setLoading] = useState(true);

    // Track previous data to detect new events
    const previousEarthquakeIdsRef = useRef(new Set());
    const previousISSLocationRef = useRef(null);
    const previousVolcanicIdsRef = useRef(new Set());
    const previousHurricaneIdsRef = useRef(new Set());
    const previousTornadoIdsRef = useRef(new Set());
    const previousAuroraIdsRef = useRef(new Set());
    const previousWindIdsRef = useRef(new Set());
    const previousPrecipitationIdsRef = useRef(new Set());
    const previousRocketIdsRef = useRef(new Set());
    const previousConflictIdsRef = useRef(new Set());
    const previousProtestIdsRef = useRef(new Set());
    const previousUnrestIdsRef = useRef(new Set());
    const previousDiseaseIdsRef = useRef(new Set());

    const loadData = async () => {
        try {
            const [eqResult, issResult, volcanicResult, hurricaneResult, tornadoResult, auroraResult, windResult, precipResult, rocketResult, conflictResult, protestResult, unrestResult, diseaseResult] = await Promise.all([
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

            // Update earthquake data and capture previous for comparison
            if (eqResult.data) {
                setEarthquakeData(prevData => {
                    // Store previous IDs before updating
                    if (prevData.length > 0) {
                        previousEarthquakeIdsRef.current = new Set(prevData.map(eq => 
                            eq.id || `${eq.geometry.coordinates[1]}-${eq.geometry.coordinates[0]}-${eq.properties.mag}-${eq.properties.time}`
                        ));
                    }
                    return eqResult.data;
                });
            }

            // Update ISS data and capture previous for comparison
            if (issResult.data) {
                setIssData(prevData => {
                    // Store previous location before updating
                    if (prevData) {
                        previousISSLocationRef.current = { lat: prevData.lat, lon: prevData.lon };
                    }
                    return issResult.data;
                });
            }

            // Update volcanic data and capture previous for comparison
            if (volcanicResult.data) {
                setVolcanicData(prevData => {
                    if (prevData.length > 0) {
                        previousVolcanicIdsRef.current = new Set(prevData.map(v => 
                            v.id || `${v.lat}-${v.lon}-${v.name}`
                        ));
                    }
                    return volcanicResult.data;
                });
            }

            // Update hurricane data
            if (hurricaneResult.data) {
                setHurricaneData(prevData => {
                    if (prevData.length > 0) {
                        previousHurricaneIdsRef.current = new Set(prevData.map(h => 
                            h.id || `${h.lat}-${h.lon}-${h.name}`
                        ));
                    }
                    return hurricaneResult.data;
                });
            }

            // Update tornado data
            if (tornadoResult.data) {
                setTornadoData(prevData => {
                    if (prevData.length > 0) {
                        previousTornadoIdsRef.current = new Set(prevData.map(t => 
                            t.id || `${t.lat}-${t.lon}-${t.intensity}`
                        ));
                    }
                    return tornadoResult.data;
                });
            }

            // Update aurora data
            if (auroraResult.data) {
                setAuroraData(prevData => {
                    if (prevData.length > 0) {
                        previousAuroraIdsRef.current = new Set(prevData.map(a => 
                            a.id || `${a.lat}-${a.lon}-${a.kpIndex}`
                        ));
                    }
                    return auroraResult.data;
                });
            }

            // Update wind data
            if (windResult.data) {
                setWindData(prevData => {
                    if (prevData.length > 0) {
                        previousWindIdsRef.current = new Set(prevData.map(w => w.id || `${w.lat}-${w.lon}`));
                    }
                    return windResult.data;
                });
            }

            // Update precipitation data
            if (precipResult.data) {
                setPrecipitationData(prevData => {
                    if (prevData.length > 0) {
                        previousPrecipitationIdsRef.current = new Set(prevData.map(p => p.id || `${p.lat}-${p.lon}`));
                    }
                    return precipResult.data;
                });
            }

            // Update rocket data
            if (rocketResult.data) {
                setRocketData(prevData => {
                    if (prevData.length > 0) {
                        previousRocketIdsRef.current = new Set(prevData.map(r => 
                            r.id || `${r.lat}-${r.lon}-${r.mission}`
                        ));
                    }
                    return rocketResult.data;
                });
            }

            // Update conflict data
            if (conflictResult.data) {
                setConflictData(prevData => {
                    if (prevData.length > 0) {
                        previousConflictIdsRef.current = new Set(prevData.map(c => 
                            c.id || `${c.lat}-${c.lon}-${c.name}`
                        ));
                    }
                    return conflictResult.data;
                });
            }

            // Update protest data
            if (protestResult.data) {
                setProtestData(prevData => {
                    if (prevData.length > 0) {
                        previousProtestIdsRef.current = new Set(prevData.map(p => 
                            p.id || `${p.lat}-${p.lon}-${p.city}`
                        ));
                    }
                    return protestResult.data;
                });
            }

            // Update unrest data
            if (unrestResult.data) {
                setUnrestData(prevData => {
                    if (prevData.length > 0) {
                        previousUnrestIdsRef.current = new Set(prevData.map(u => 
                            u.id || `${u.lat}-${u.lon}-${u.location}`
                        ));
                    }
                    return unrestResult.data;
                });
            }

            // Update disease data
            if (diseaseResult.data) {
                setDiseaseData(prevData => {
                    if (prevData.length > 0) {
                        previousDiseaseIdsRef.current = new Set(prevData.map(d => 
                            d.id || `${d.lat}-${d.lon}-${d.disease}`
                        ));
                    }
                    return diseaseResult.data;
                });
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

    useEffect(() => {
        loadData();
        
        // Auto-refresh every minute
        const interval = setInterval(() => {
            loadData();
        }, 60000);

        return () => clearInterval(interval);
    }, []);


    return (
        <div className="app">
            <Header 
                earthquakeCount={earthquakeData.length}
                volcanicCount={volcanicData.length}
                hurricaneCount={hurricaneData.length}
                tornadoCount={tornadoData.length}
                auroraCount={auroraData.length}
                windCount={windData.length}
                precipitationCount={precipitationData.length}
                rocketCount={rocketData.length}
                conflictCount={conflictData.length}
                protestCount={protestData.length}
                unrestCount={unrestData.length}
                diseaseCount={diseaseData.length}
                lastUpdate={lastUpdate}
            />
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
                        earthquakeData={earthquakeData}
                        issData={issData}
                        volcanicData={volcanicData}
                        hurricaneData={hurricaneData}
                        tornadoData={tornadoData}
                        auroraData={auroraData}
                        windData={windData}
                        precipitationData={precipitationData}
                        rocketData={rocketData}
                        conflictData={conflictData}
                        protestData={protestData}
                        unrestData={unrestData}
                        diseaseData={diseaseData}
                        previousEarthquakeIds={previousEarthquakeIdsRef.current}
                        previousISSLocation={previousISSLocationRef.current}
                        previousVolcanicIds={previousVolcanicIdsRef.current}
                        previousHurricaneIds={previousHurricaneIdsRef.current}
                        previousTornadoIds={previousTornadoIdsRef.current}
                        previousAuroraIds={previousAuroraIdsRef.current}
                        previousWindIds={previousWindIdsRef.current}
                        previousPrecipitationIds={previousPrecipitationIdsRef.current}
                        previousRocketIds={previousRocketIdsRef.current}
                        previousConflictIds={previousConflictIdsRef.current}
                        previousProtestIds={previousProtestIdsRef.current}
                        previousUnrestIds={previousUnrestIdsRef.current}
                        previousDiseaseIds={previousDiseaseIdsRef.current}
                    />
                    <Legend />
                    <EventLog />
                </>
            )}
        </div>
    );
}

export default App;

