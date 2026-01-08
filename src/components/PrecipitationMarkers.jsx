import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { formatAge } from '../utils/helpers';

export default function PrecipitationMarkers({ map, precipitationData, previousPrecipitationIds }) {
    const markersRef = useRef([]);

    useEffect(() => {
        if (!map || !precipitationData) return;

        markersRef.current.forEach(marker => {
            map.removeLayer(marker);
        });
        markersRef.current = [];

        const now = Date.now();

        precipitationData.forEach(precip => {
            const iconSize = Math.min(20, 8 + precip.intensity);
            const emoji = precip.type === 'snow' ? '❄️' : '🌧️';

            const icon = L.divIcon({
                className: 'precipitation-marker',
                html: `<div style="
                    font-size: ${iconSize}px;
                    opacity: ${0.6 + precip.intensity / 50};
                ">${emoji}</div>`,
                iconSize: [iconSize, iconSize],
                iconAnchor: [iconSize / 2, iconSize / 2]
            });

            const marker = L.marker([precip.lat, precip.lon], { icon }).addTo(map);

            marker.bindPopup(`
                <strong>${emoji} ${precip.type === 'snow' ? 'Snow' : 'Rain'}</strong><br>
                Intensity: ${precip.intensity} mm/h<br>
                Accumulation: ${precip.accumulation.toFixed(1)} mm<br>
                Age: ${formatAge(now - precip.time)}
            `);

            markersRef.current.push(marker);
        });

        return () => {
            markersRef.current.forEach(marker => {
                if (map.hasLayer(marker)) map.removeLayer(marker);
            });
        };
    }, [map, precipitationData, previousPrecipitationIds]);

    return null;
}

