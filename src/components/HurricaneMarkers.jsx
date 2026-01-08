import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { getHurricaneColor, formatAge } from '../utils/helpers';
import { animateCircleBounce, animateCirclePulse } from '../utils/animations';
import { getHurricaneSeverity } from '../utils/severity';

export default function HurricaneMarkers({ map, hurricaneData, previousHurricaneIds, addEvent }) {
    const markersRef = useRef([]);

    useEffect(() => {
        if (!map || !hurricaneData) return;

        markersRef.current.forEach(marker => {
            if (marker._pulseInterval) clearInterval(marker._pulseInterval);
            map.removeLayer(marker);
        });
        markersRef.current = [];

        const currentIds = new Set();
        const now = Date.now();

        hurricaneData.forEach(hurricane => {
            const eventId = hurricane.id || `${hurricane.lat}-${hurricane.lon}-${hurricane.name}`;
            currentIds.add(eventId);
            const isNew = !previousHurricaneIds.has(eventId);
            const timeSince = now - hurricane.time;
            const isVeryRecent = timeSince < 600000;
            
            const baseRadius = 10 + hurricane.category * 2;
            const color = getHurricaneColor(hurricane.category);

            const icon = L.divIcon({
                className: 'hurricane-marker',
                html: `<div style="
                    font-size: ${baseRadius * 2}px;
                    color: ${color};
                    text-shadow: 0 0 5px ${color};
                ">🌀</div>`,
                iconSize: [baseRadius * 2, baseRadius * 2],
                iconAnchor: [baseRadius, baseRadius]
            });

            const marker = L.marker([hurricane.lat, hurricane.lon], { icon }).addTo(map);

            marker._markerId = eventId;

            marker.bindPopup(`
                <strong>🌀 ${hurricane.name} - Category ${hurricane.category}${isVeryRecent ? ' 🆕 VERY RECENT!' : ''}</strong><br>
                Wind Speed: ${hurricane.windSpeed} mph<br>
                Pressure: ${hurricane.pressure} mb<br>
                Direction: ${hurricane.direction}<br>
                Age: ${formatAge(timeSince)}
            `);
            
            if (isNew && previousHurricaneIds.size > 0) {
                marker.openPopup();
                const tempCircle = L.circleMarker([hurricane.lat, hurricane.lon], {
                    radius: baseRadius,
                    fillColor: color,
                    color: '#fff',
                    weight: 2,
                    opacity: 0.8,
                    fillOpacity: 0.6
                }).addTo(map);
                animateCircleBounce(tempCircle, baseRadius);
                setTimeout(() => map.removeLayer(tempCircle), 2000);
                // Log event
                if (addEvent) {
                    const severity = getHurricaneSeverity(hurricane.category);
                    addEvent(
                        'new-hurricane',
                        '🌀',
                        `${hurricane.name} - Cat ${hurricane.category}`,
                        `Winds: ${hurricane.windSpeed} mph, Pressure: ${hurricane.pressure} mb`,
                        hurricane.lat,
                        hurricane.lon,
                        { markerId: eventId },
                        severity
                    );
                }
            } else if (isVeryRecent) {
                const tempCircle = L.circleMarker([hurricane.lat, hurricane.lon], {
                    radius: baseRadius,
                    fillColor: color,
                    color: '#fff',
                    weight: 1,
                    opacity: 0.6,
                    fillOpacity: 0.4
                }).addTo(map);
                animateCirclePulse(tempCircle, baseRadius);
                marker._pulseCircle = tempCircle;
            }

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
    }, [map, hurricaneData, previousHurricaneIds]);

    return null;
}

