import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { getMagnitudeColor, getMagnitudeRadius, formatAge } from '../utils/helpers';
import { animateCircleBounce, animateCirclePulse } from '../utils/animations';
import { getEarthquakeSeverity } from '../utils/severity';

export default function EarthquakeMarkers({ map, earthquakeData, previousEarthquakeIds, addEvent }) {
    const markersRef = useRef([]);

    useEffect(() => {
        if (!map || !earthquakeData) return;

        // Clear existing markers
        markersRef.current.forEach(marker => {
            if (marker._pulseInterval) {
                clearInterval(marker._pulseInterval);
            }
            map.removeLayer(marker);
        });
        markersRef.current = [];

        const currentEarthquakeIds = new Set();
        const now = Date.now();

        earthquakeData.forEach(eq => {
            const [lon, lat] = eq.geometry.coordinates;
            const mag = eq.properties.mag;
            const place = eq.properties.place;
            const time = new Date(eq.properties.time).toLocaleString();
            const eventTime = eq.properties.time;
            const eventId = eq.id || `${lat}-${lon}-${mag}-${eventTime}`;
            
            currentEarthquakeIds.add(eventId);
            const isNew = !previousEarthquakeIds.has(eventId);
            const timeSinceEvent = now - eventTime;
            const isVeryRecent = timeSinceEvent < 600000; // Less than 10 minutes old
            const isRecent = timeSinceEvent < 3600000; // Less than 1 hour old
            
            const baseRadius = getMagnitudeRadius(mag);

            const circle = L.circleMarker([lat, lon], {
                radius: baseRadius,
                fillColor: getMagnitudeColor(mag),
                color: '#fff',
                weight: isNew ? 3 : 1,
                opacity: isNew ? 1 : 0.8,
                fillOpacity: isNew ? 0.9 : 0.6
            }).addTo(map);

            // Set marker ID for event log click handling
            circle._markerId = eventId;

            const ageText = isVeryRecent ? ' 🆕 VERY RECENT!' : (isRecent ? ' ⏰ Recent' : '');
            circle.bindPopup(`
                <strong>🌍 Earthquake - Magnitude: ${mag}${ageText}</strong><br>
                Location: ${place}<br>
                Time: ${time}<br>
                Age: ${formatAge(timeSinceEvent)}
            `);
            
            // Animate new earthquakes with radius pulsing
            if (isNew && previousEarthquakeIds.size > 0) {
                circle.openPopup();
                animateCircleBounce(circle, baseRadius);
                // Log event
                if (addEvent) {
                    const severity = getEarthquakeSeverity(mag);
                    addEvent(
                        'new-earthquake',
                        '🌍',
                        `Magnitude ${mag} Earthquake`,
                        `${place}`,
                        lat,
                        lon,
                        { markerId: eventId },
                        severity
                    );
                }
            } else if (isVeryRecent) {
                animateCirclePulse(circle, baseRadius);
            }

            markersRef.current.push(circle);
        });

        return () => {
            markersRef.current.forEach(marker => {
                if (marker._pulseInterval) {
                    clearInterval(marker._pulseInterval);
                }
                if (map.hasLayer(marker)) {
                    map.removeLayer(marker);
                }
            });
        };
    }, [map, earthquakeData, previousEarthquakeIds]);

    return null;
}

