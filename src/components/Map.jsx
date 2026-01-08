import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import EarthquakeMarkers from './EarthquakeMarkers';
import ISSMarker from './ISSMarker';

export default function Map({ earthquakeData, issData, previousEarthquakeIds, previousISSLocation }) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const [mapReady, setMapReady] = useState(false);

    useEffect(() => {
        if (!mapInstanceRef.current && mapRef.current) {
            mapInstanceRef.current = L.map(mapRef.current).setView([20, 0], 2);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(mapInstanceRef.current);
            setMapReady(true);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                setMapReady(false);
            }
        };
    }, []);

    return (
        <>
            <div id="map" ref={mapRef}></div>
            {mapReady && mapInstanceRef.current && (
                <>
                    <EarthquakeMarkers 
                        map={mapInstanceRef.current}
                        earthquakeData={earthquakeData}
                        previousEarthquakeIds={previousEarthquakeIds}
                    />
                    <ISSMarker 
                        map={mapInstanceRef.current}
                        issData={issData}
                        previousISSLocation={previousISSLocation}
                    />
                </>
            )}
        </>
    );
}

