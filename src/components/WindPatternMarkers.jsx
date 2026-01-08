import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { getWindColor } from '../utils/helpers';

export default function WindPatternMarkers({ map, windData, previousWindIds, addEvent }) {
    const markersRef = useRef([]);

    useEffect(() => {
        if (!map || !windData) return;

        markersRef.current.forEach(marker => {
            map.removeLayer(marker);
        });
        markersRef.current = [];

        windData.forEach(wind => {
            const color = getWindColor(wind.speed);
            const arrowLength = Math.min(20, wind.speed);
            
            // Create arrow icon pointing in wind direction
            const icon = L.divIcon({
                className: 'wind-marker',
                html: `<div style="
                    width: 0;
                    height: 0;
                    border-left: ${arrowLength * 0.3}px solid transparent;
                    border-right: ${arrowLength * 0.3}px solid transparent;
                    border-bottom: ${arrowLength}px solid ${color};
                    transform: rotate(${wind.direction}deg);
                    filter: drop-shadow(0 0 2px ${color});
                "></div>`,
                iconSize: [arrowLength, arrowLength],
                iconAnchor: [arrowLength * 0.3, arrowLength]
            });

            const marker = L.marker([wind.lat, wind.lon], { icon }).addTo(map);

            marker.bindPopup(`
                <strong>💨 Wind Pattern</strong><br>
                Speed: ${wind.speed} mph<br>
                Direction: ${wind.direction}°<br>
                Gusts: ${wind.gusts.toFixed(0)} mph
            `);

            markersRef.current.push(marker);
        });

        return () => {
            markersRef.current.forEach(marker => {
                if (map.hasLayer(marker)) map.removeLayer(marker);
            });
        };
    }, [map, windData, previousWindIds]);

    return null;
}

