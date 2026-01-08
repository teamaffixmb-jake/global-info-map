import { useState, useEffect, useRef } from 'react';
import './App.css';
import Header from './components/Header';
import Map from './components/Map';
import Legend from './components/Legend';
import { fetchEarthquakes, fetchISS } from './utils/api';

function App() {
    const [earthquakeData, setEarthquakeData] = useState([]);
    const [issData, setIssData] = useState(null);
    const [lastUpdate, setLastUpdate] = useState('');
    const [loading, setLoading] = useState(true);

    // Track previous data to detect new events
    const previousEarthquakeIdsRef = useRef(new Set());
    const previousISSLocationRef = useRef(null);

    const loadData = async () => {
        try {
            const [eqResult, issResult] = await Promise.all([
                fetchEarthquakes(),
                fetchISS()
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
                        previousEarthquakeIds={previousEarthquakeIdsRef.current}
                        previousISSLocation={previousISSLocationRef.current}
                    />
                    <Legend />
                </>
            )}
        </div>
    );
}

export default App;

