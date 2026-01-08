import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { formatAge } from '../utils/helpers';
import { animateCircleBounce, animateCirclePulse } from '../utils/animations';

export default function ConflictMarkers({ map, conflictData, previousConflictIds, addEvent }) {
    const markersRef = useRef([]);

    useEffect(() => {
        if (!map || !conflictData) return;

        markersRef.current.forEach(marker => {
            if (marker._pulseInterval) clearInterval(marker._pulseInterval);
            map.removeLayer(marker);
        });
        markersRef.current = [];

        const currentIds = new Set();
        const now = Date.now();

        conflictData.forEach(conflict => {
            const eventId = conflict.id || `${conflict.lat}-${conflict.lon}-${conflict.name}`;
            currentIds.add(eventId);
            const isNew = !previousConflictIds.has(eventId);
            const timeSince = now - conflict.time;
            const isVeryRecent = timeSince < 3600000;
            
            const size = conflict.intensity === 'high' ? 12 : conflict.intensity === 'medium' ? 10 : 8;
            const color = conflict.intensity === 'high' ? '#ff0000' : conflict.intensity === 'medium' ? '#ff6600' : '#ff9900';

            const icon = L.divIcon({
                className: 'conflict-marker',
                html: `<div style="
                    font-size: ${size * 2}px;
                    color: ${color};
                    text-shadow: 0 0 5px ${color};
                ">⚔️</div>`,
                iconSize: [size * 2, size * 2],
                iconAnchor: [size, size]
            });

            const marker = L.marker([conflict.lat, conflict.lon], { icon }).addTo(map);

            marker._markerId = eventId;

            marker.bindPopup(`
                <strong>⚔️ ${conflict.name}${isVeryRecent ? ' 🆕 VERY RECENT!' : ''}</strong><br>
                Type: ${conflict.type}<br>
                Intensity: ${conflict.intensity}<br>
                Recent Incidents: ${conflict.recentIncidents}<br>
                Age: ${formatAge(timeSince)}
            `);
            
            if (isNew && previousConflictIds.size > 0) {
                marker.openPopup();
                const tempCircle = L.circleMarker([conflict.lat, conflict.lon], {
                    radius: size,
                    fillColor: color,
                    color: '#fff',
                    weight: 2,
                    opacity: 0.8,
                    fillOpacity: 0.6
                }).addTo(map);
                animateCircleBounce(tempCircle, size);
                setTimeout(() => map.removeLayer(tempCircle), 2000);
                // Log event
                if (addEvent) {
                    addEvent(
                        'new-conflict',
                        '⚔️',
                        `${conflict.name} - ${conflict.intensity}`,
                        `${conflict.type}, ${conflict.recentIncidents} recent incidents`,
                        conflict.lat,
                        conflict.lon,
                        { markerId: eventId }
                    );
                }
            } else if (isVeryRecent) {
                const tempCircle = L.circleMarker([conflict.lat, conflict.lon], {
                    radius: size,
                    fillColor: color,
                    color: '#fff',
                    weight: 1,
                    opacity: 0.6,
                    fillOpacity: 0.4
                }).addTo(map);
                animateCirclePulse(tempCircle, size);
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
    }, [map, conflictData, previousConflictIds]);

    return null;
}

