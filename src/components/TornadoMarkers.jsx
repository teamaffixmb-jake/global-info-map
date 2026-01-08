import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { getTornadoColor, getTornadoSize, formatAge } from '../utils/helpers';
import { animateCircleBounce, animateCirclePulse } from '../utils/animations';
import { getTornadoSeverity } from '../utils/severity';

export default function TornadoMarkers({ map, tornadoData, previousTornadoIds, addEvent }) {
    const markersRef = useRef([]);

    useEffect(() => {
        if (!map || !tornadoData) return;

        markersRef.current.forEach(marker => {
            if (marker._pulseInterval) clearInterval(marker._pulseInterval);
            map.removeLayer(marker);
        });
        markersRef.current = [];

        const currentIds = new Set();
        const now = Date.now();

        tornadoData.forEach(tornado => {
            const eventId = tornado.id || `${tornado.lat}-${tornado.lon}-${tornado.intensity}`;
            currentIds.add(eventId);
            const isNew = !previousTornadoIds.has(eventId);
            const timeSince = now - tornado.time;
            const isVeryRecent = timeSince < 600000;
            
            const baseRadius = getTornadoSize(tornado.intensity);
            const color = getTornadoColor(tornado.intensity);

            const icon = L.divIcon({
                className: 'tornado-marker',
                html: `<div style="
                    font-size: ${baseRadius * 2}px;
                    color: ${color};
                    text-shadow: 0 0 5px ${color};
                ">🌪️</div>`,
                iconSize: [baseRadius * 2, baseRadius * 2],
                iconAnchor: [baseRadius, baseRadius]
            });

            const marker = L.marker([tornado.lat, tornado.lon], { icon }).addTo(map);

            marker._markerId = eventId;

            marker.bindPopup(`
                <strong>🌪️ Tornado - EF${tornado.intensity}${isVeryRecent ? ' 🆕 VERY RECENT!' : ''}</strong><br>
                Location: ${tornado.location}<br>
                Intensity: EF${tornado.intensity}<br>
                Age: ${formatAge(timeSince)}
            `);
            
            if (isNew && previousTornadoIds.size > 0) {
                marker.openPopup();
                const tempCircle = L.circleMarker([tornado.lat, tornado.lon], {
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
                    const severity = getTornadoSeverity(tornado.intensity);
                    addEvent(
                        'new-tornado',
                        '🌪️',
                        `EF${tornado.intensity} Tornado`,
                        `${tornado.location}`,
                        tornado.lat,
                        tornado.lon,
                        { markerId: eventId },
                        severity
                    );
                }
            } else if (isVeryRecent) {
                const tempCircle = L.circleMarker([tornado.lat, tornado.lon], {
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
    }, [map, tornadoData, previousTornadoIds]);

    return null;
}

