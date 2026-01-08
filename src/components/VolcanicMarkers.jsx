import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { getVolcanicAlertColor, getVolcanicSize, formatAge } from '../utils/helpers';
import { animateCircleBounce, animateCirclePulse } from '../utils/animations';

export default function VolcanicMarkers({ map, volcanicData, previousVolcanicIds, addEvent }) {
    const markersRef = useRef([]);

    useEffect(() => {
        if (!map || !volcanicData) return;

        // Clear existing markers
        markersRef.current.forEach(marker => {
            if (marker._pulseInterval) {
                clearInterval(marker._pulseInterval);
            }
            map.removeLayer(marker);
        });
        markersRef.current = [];

        const currentVolcanicIds = new Set();
        const now = Date.now();

        volcanicData.forEach(volcano => {
            const eventId = volcano.id || `${volcano.lat}-${volcano.lon}-${volcano.name}`;
            currentVolcanicIds.add(eventId);
            const isNew = !previousVolcanicIds.has(eventId);
            const timeSinceActivity = now - volcano.time;
            const isVeryRecent = timeSinceActivity < 600000; // Less than 10 minutes old
            
            const baseRadius = getVolcanicSize(volcano.alertLevel);
            const color = getVolcanicAlertColor(volcano.alertLevel);

            // Create triangle marker using custom icon
            const volcanoIcon = L.divIcon({
                className: 'volcano-marker',
                html: `<div style="
                    width: 0;
                    height: 0;
                    border-left: ${baseRadius}px solid transparent;
                    border-right: ${baseRadius}px solid transparent;
                    border-bottom: ${baseRadius * 1.5}px solid ${color};
                    filter: drop-shadow(0 0 3px ${color});
                "></div>`,
                iconSize: [baseRadius * 2, baseRadius * 2],
                iconAnchor: [baseRadius, baseRadius * 1.5]
            });

            const marker = L.marker([volcano.lat, volcano.lon], {
                icon: volcanoIcon
            }).addTo(map);

            marker._markerId = eventId;

            const lastEruptionDate = new Date(volcano.lastEruption).toLocaleDateString();
            const ageText = isVeryRecent ? ' 🆕 VERY RECENT!' : '';
            marker.bindPopup(`
                <strong>🌋 ${volcano.name}${ageText}</strong><br>
                Location: ${volcano.country}<br>
                Elevation: ${volcano.elevation}m<br>
                Alert Level: <span style="color: ${color}">${volcano.alertLevel.toUpperCase()}</span><br>
                Last Eruption: ${lastEruptionDate}<br>
                Activity: ${formatAge(timeSinceActivity)}
            `);
            
            // Animate new volcanic activity
            if (isNew && previousVolcanicIds.size > 0) {
                marker.openPopup();
                // Create a temporary circle for bounce animation
                const tempCircle = L.circleMarker([volcano.lat, volcano.lon], {
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
                    addEvent(
                        'new-volcanic',
                        '🌋',
                        `${volcano.name} - ${volcano.alertLevel.toUpperCase()}`,
                        `${volcano.country}, Elevation: ${volcano.elevation}m`,
                        volcano.lat,
                        volcano.lon,
                        { markerId: eventId }
                    );
                }
            } else if (isVeryRecent) {
                const tempCircle = L.circleMarker([volcano.lat, volcano.lon], {
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
                if (marker._pulseInterval) {
                    clearInterval(marker._pulseInterval);
                }
                if (marker._pulseCircle) {
                    if (marker._pulseCircle._pulseInterval) {
                        clearInterval(marker._pulseCircle._pulseInterval);
                    }
                    if (map.hasLayer(marker._pulseCircle)) {
                        map.removeLayer(marker._pulseCircle);
                    }
                }
                if (map.hasLayer(marker)) {
                    map.removeLayer(marker);
                }
            });
        };
    }, [map, volcanicData, previousVolcanicIds]);

    return null;
}

