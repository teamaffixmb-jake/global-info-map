import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { formatAge } from '../utils/helpers';
import { animateCircleBounce, animateCirclePulse } from '../utils/animations';
import { getProtestSeverity } from '../utils/severity';

export default function ProtestMarkers({ map, protestData, previousProtestIds, addEvent }) {
    const markersRef = useRef([]);

    useEffect(() => {
        if (!map || !protestData) return;

        markersRef.current.forEach(marker => {
            if (marker._pulseInterval) clearInterval(marker._pulseInterval);
            map.removeLayer(marker);
        });
        markersRef.current = [];

        const currentIds = new Set();
        const now = Date.now();

        protestData.forEach(protest => {
            const eventId = protest.id || `${protest.lat}-${protest.lon}-${protest.city}`;
            currentIds.add(eventId);
            const isNew = !previousProtestIds.has(eventId);
            const timeSince = now - protest.time;
            const isVeryRecent = timeSince < 3600000;
            
            const size = Math.min(16, 10 + Math.floor(protest.size / 10000));

            const icon = L.divIcon({
                className: 'protest-marker',
                html: `<div style="
                    font-size: ${size}px;
                    color: #ff6600;
                    text-shadow: 0 0 5px #ff6600;
                ">✊</div>`,
                iconSize: [size, size],
                iconAnchor: [size / 2, size / 2]
            });

            const marker = L.marker([protest.lat, protest.lon], { icon }).addTo(map);

            marker._markerId = eventId;

            marker.bindPopup(`
                <strong>✊ ${protest.city}, ${protest.country}${isVeryRecent ? ' 🆕 VERY RECENT!' : ''}</strong><br>
                Cause: ${protest.cause}<br>
                Size: ~${protest.size.toLocaleString()} people<br>
                Duration: ${protest.duration} hours<br>
                Status: ${protest.status}<br>
                Age: ${formatAge(timeSince)}
            `);
            
            if (isNew && previousProtestIds.size > 0) {
                marker.openPopup();
                const tempCircle = L.circleMarker([protest.lat, protest.lon], {
                    radius: size / 2,
                    fillColor: '#ff6600',
                    color: '#fff',
                    weight: 2,
                    opacity: 0.8,
                    fillOpacity: 0.6
                }).addTo(map);
                animateCircleBounce(tempCircle, size / 2);
                setTimeout(() => map.removeLayer(tempCircle), 2000);
                // Log event
                if (addEvent) {
                    const severity = getProtestSeverity(protest.size);
                    addEvent(
                        'new-protest',
                        '✊',
                        `Protest in ${protest.city}`,
                        `${protest.cause}, ~${protest.size.toLocaleString()} people`,
                        protest.lat,
                        protest.lon,
                        { markerId: eventId },
                        severity
                    );
                }
            } else if (isVeryRecent) {
                const tempCircle = L.circleMarker([protest.lat, protest.lon], {
                    radius: size / 2,
                    fillColor: '#ff6600',
                    color: '#fff',
                    weight: 1,
                    opacity: 0.6,
                    fillOpacity: 0.4
                }).addTo(map);
                animateCirclePulse(tempCircle, size / 2);
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
    }, [map, protestData, previousProtestIds]);

    return null;
}

