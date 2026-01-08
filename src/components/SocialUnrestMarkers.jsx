import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { formatAge } from '../utils/helpers';
import { animateCirclePulse } from '../utils/animations';

export default function SocialUnrestMarkers({ map, unrestData, previousUnrestIds }) {
    const markersRef = useRef([]);

    useEffect(() => {
        if (!map || !unrestData) return;

        markersRef.current.forEach(marker => {
            if (marker._pulseInterval) clearInterval(marker._pulseInterval);
            map.removeLayer(marker);
        });
        markersRef.current = [];

        const currentIds = new Set();
        const now = Date.now();

        unrestData.forEach(unrest => {
            const eventId = unrest.id || `${unrest.lat}-${unrest.lon}-${unrest.location}`;
            currentIds.add(eventId);
            
            const size = unrest.severity === 'high' ? 12 : unrest.severity === 'medium' ? 10 : 8;
            const color = unrest.severity === 'high' ? '#ff0000' : unrest.severity === 'medium' ? '#ff9900' : '#ffcc00';

            const icon = L.divIcon({
                className: 'unrest-marker',
                html: `<div style="
                    font-size: ${size * 2}px;
                    color: ${color};
                    text-shadow: 0 0 5px ${color};
                ">⚠️</div>`,
                iconSize: [size * 2, size * 2],
                iconAnchor: [size, size]
            });

            const marker = L.marker([unrest.lat, unrest.lon], { icon }).addTo(map);

            marker.bindPopup(`
                <strong>⚠️ ${unrest.location}, ${unrest.country}</strong><br>
                Severity: ${unrest.severity}<br>
                Type: ${unrest.type}<br>
                Affected: ~${unrest.affectedPopulation.toLocaleString()} people<br>
                Age: ${formatAge(now - unrest.time)}
            `);
            
            // Pulse for ongoing unrest
            const tempCircle = L.circleMarker([unrest.lat, unrest.lon], {
                radius: size,
                fillColor: color,
                color: '#fff',
                weight: 1,
                opacity: 0.6,
                fillOpacity: 0.4
            }).addTo(map);
            animateCirclePulse(tempCircle, size);
            marker._pulseCircle = tempCircle;

            markersRef.current.push(marker);
        });

        return () => {
            markersRef.current.forEach(marker => {
                if (marker._pulseInterval) clearInterval(marker._pulseInterval);
                if (marker._pulseCircle) {
                    if (marker._pulseCircle._pulseInterval) clearInterval(marker._pulseCircle._pulseInterval);
                    if (map.hasLayer(marker._pulseCircle)) map.removeLayer(marker._pulseCircle);
                }
                if (map.hasLayer(marker)) map.removeLayer(marker);
            });
        };
    }, [map, unrestData, previousUnrestIds]);

    return null;
}

