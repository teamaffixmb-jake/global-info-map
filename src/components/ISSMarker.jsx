import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { animateCircleBounce, animateCirclePulse } from '../utils/animations';

export default function ISSMarker({ map, issData, previousISSLocation }) {
    const markerRef = useRef(null);

    useEffect(() => {
        if (!map || !issData) return;

        // Clear existing marker
        if (markerRef.current) {
            if (markerRef.current._pulseInterval) {
                clearInterval(markerRef.current._pulseInterval);
            }
            map.removeLayer(markerRef.current);
        }

        const hasMoved = previousISSLocation && 
            (Math.abs(previousISSLocation.lat - issData.lat) > 0.5 || 
             Math.abs(previousISSLocation.lon - issData.lon) > 0.5);
        
        const baseRadius = 12;
        markerRef.current = L.circleMarker([issData.lat, issData.lon], {
            radius: baseRadius,
            fillColor: '#a855f7',
            color: '#ffffff',
            weight: hasMoved ? 4 : 3,
            opacity: 1,
            fillOpacity: hasMoved ? 1 : 0.9
        }).addTo(map);

        markerRef.current.bindPopup(`
            <strong>🛰️ International Space Station${hasMoved ? ' 🆕 MOVED!' : ''}</strong><br>
            Latitude: ${issData.lat.toFixed(2)}°<br>
            Longitude: ${issData.lon.toFixed(2)}°<br>
            Altitude: ${issData.altitude.toFixed(0)} km<br>
            Speed: ${issData.velocity.toFixed(0)} km/h<br>
            Status: Orbiting Earth 🌍
        `);
        
        // Animate if moved
        if (hasMoved) {
            animateCircleBounce(markerRef.current, baseRadius);
        } else {
            // Always pulse the ISS since it's constantly moving
            animateCirclePulse(markerRef.current, baseRadius);
        }

        return () => {
            if (markerRef.current) {
                if (markerRef.current._pulseInterval) {
                    clearInterval(markerRef.current._pulseInterval);
                }
                if (map.hasLayer(markerRef.current)) {
                    map.removeLayer(markerRef.current);
                }
            }
        };
    }, [map, issData, previousISSLocation]);

    return null;
}

