import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { getAuroraColor, formatAge } from '../utils/helpers';
import { animateCirclePulse } from '../utils/animations';

export default function AuroraMarkers({ map, auroraData, previousAuroraIds }) {
    const markersRef = useRef([]);

    useEffect(() => {
        if (!map || !auroraData) return;

        markersRef.current.forEach(marker => {
            if (marker._pulseInterval) clearInterval(marker._pulseInterval);
            map.removeLayer(marker);
        });
        markersRef.current = [];

        const currentIds = new Set();
        const now = Date.now();

        auroraData.forEach(aurora => {
            const eventId = aurora.id || `${aurora.lat}-${aurora.lon}-${aurora.kpIndex}`;
            currentIds.add(eventId);
            const isNew = !previousAuroraIds.has(eventId);
            
            const baseRadius = 8 + aurora.kpIndex;
            const color = getAuroraColor(aurora.kpIndex);
            const opacity = Math.min(0.9, 0.3 + aurora.kpIndex * 0.1);

            const circle = L.circleMarker([aurora.lat, aurora.lon], {
                radius: baseRadius,
                fillColor: color,
                color: color,
                weight: 2,
                opacity: opacity,
                fillOpacity: opacity * 0.6
            }).addTo(map);

            circle.bindPopup(`
                <strong>🌌 Aurora - ${aurora.name}${isNew ? ' 🆕 NEW!' : ''}</strong><br>
                KP Index: ${aurora.kpIndex}/9<br>
                Visibility: ${aurora.visibility}<br>
                Age: ${formatAge(now - aurora.time)}
            `);
            
            // Always pulse aurora for visual effect
            animateCirclePulse(circle, baseRadius);

            markersRef.current.push(circle);
        });

        return () => {
            markersRef.current.forEach(marker => {
                if (marker._pulseInterval) clearInterval(marker._pulseInterval);
                if (map.hasLayer(marker)) map.removeLayer(marker);
            });
        };
    }, [map, auroraData, previousAuroraIds]);

    return null;
}

