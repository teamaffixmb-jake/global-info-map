import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { getDiseaseColor, formatAge } from '../utils/helpers';
import { animateCircleBounce, animateCirclePulse } from '../utils/animations';
import { getDiseaseSeverity } from '../utils/severity';

export default function DiseaseOutbreakMarkers({ map, diseaseData, previousDiseaseIds, addEvent }) {
    const markersRef = useRef([]);

    useEffect(() => {
        if (!map || !diseaseData) return;

        markersRef.current.forEach(marker => {
            if (marker._pulseInterval) clearInterval(marker._pulseInterval);
            map.removeLayer(marker);
        });
        markersRef.current = [];

        const currentIds = new Set();
        const now = Date.now();

        diseaseData.forEach(disease => {
            const eventId = disease.id || `${disease.lat}-${disease.lon}-${disease.disease}`;
            currentIds.add(eventId);
            const isNew = !previousDiseaseIds.has(eventId);
            const timeSince = now - disease.time;
            const isVeryRecent = timeSince < 86400000; // Less than 24 hours
            
            const size = disease.severity === 'high' ? 12 : disease.severity === 'moderate' ? 10 : 8;
            const color = getDiseaseColor(disease.severity);

            const icon = L.divIcon({
                className: 'disease-marker',
                html: `<div style="
                    font-size: ${size * 2}px;
                    color: ${color};
                    text-shadow: 0 0 5px ${color};
                ">🦠</div>`,
                iconSize: [size * 2, size * 2],
                iconAnchor: [size, size]
            });

            const marker = L.marker([disease.lat, disease.lon], { icon }).addTo(map);

            marker._markerId = eventId;

            marker.bindPopup(`
                <strong>🦠 ${disease.disease} - ${disease.location}${isVeryRecent ? ' 🆕 RECENT!' : ''}</strong><br>
                Cases: ${disease.cases.toLocaleString()}<br>
                Severity: ${disease.severity}<br>
                Status: ${disease.status}<br>
                Age: ${formatAge(timeSince)}
            `);
            
            if (isNew && previousDiseaseIds.size > 0) {
                marker.openPopup();
                const tempCircle = L.circleMarker([disease.lat, disease.lon], {
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
                    const severity = getDiseaseSeverity(disease.severity, disease.cases);
                    addEvent(
                        'new-disease',
                        '🦠',
                        `${disease.disease} Outbreak`,
                        `${disease.location}, ${disease.cases.toLocaleString()} cases`,
                        disease.lat,
                        disease.lon,
                        { markerId: eventId },
                        severity
                    );
                }
            } else if (isVeryRecent) {
                const tempCircle = L.circleMarker([disease.lat, disease.lon], {
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
    }, [map, diseaseData, previousDiseaseIds]);

    return null;
}

