import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { formatAge } from '../utils/helpers';
import { animateCircleBounce } from '../utils/animations';

export default function RocketLaunchMarkers({ map, rocketData, previousRocketIds, addEvent }) {
    const markersRef = useRef([]);

    useEffect(() => {
        if (!map || !rocketData) return;

        markersRef.current.forEach(marker => {
            map.removeLayer(marker);
        });
        markersRef.current = [];

        const currentIds = new Set();
        const now = Date.now();

        rocketData.forEach(rocket => {
            const eventId = rocket.id || `${rocket.lat}-${rocket.lon}-${rocket.mission}`;
            currentIds.add(eventId);
            const isNew = !previousRocketIds.has(eventId);
            
            const icon = L.divIcon({
                className: 'rocket-marker',
                html: `<div style="
                    font-size: 20px;
                    color: ${rocket.status === 'recent' ? '#00ff00' : '#ffff00'};
                    text-shadow: 0 0 5px ${rocket.status === 'recent' ? '#00ff00' : '#ffff00'};
                ">🚀</div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            const marker = L.marker([rocket.lat, rocket.lon], { icon }).addTo(map);

            marker._markerId = eventId;

            const launchDate = new Date(rocket.launchTime).toLocaleString();
            marker.bindPopup(`
                <strong>🚀 ${rocket.mission}${isNew ? ' 🆕 NEW!' : ''}</strong><br>
                Site: ${rocket.site}, ${rocket.country}<br>
                Rocket: ${rocket.rocketType}<br>
                Status: ${rocket.status}<br>
                Launch: ${launchDate}
            `);
            
            if (isNew && previousRocketIds.size > 0) {
                marker.openPopup();
                const tempCircle = L.circleMarker([rocket.lat, rocket.lon], {
                    radius: 10,
                    fillColor: rocket.status === 'recent' ? '#00ff00' : '#ffff00',
                    color: '#fff',
                    weight: 2,
                    opacity: 0.8,
                    fillOpacity: 0.6
                }).addTo(map);
                animateCircleBounce(tempCircle, 10);
                setTimeout(() => map.removeLayer(tempCircle), 2000);
                // Log event
                if (addEvent) {
                    addEvent(
                        'new-rocket',
                        '🚀',
                        `${rocket.mission}`,
                        `${rocket.rocketType} from ${rocket.site}, ${rocket.country}`,
                        rocket.lat,
                        rocket.lon,
                        { markerId: eventId }
                    );
                }
            }

            markersRef.current.push(marker);
        });

        return () => {
            markersRef.current.forEach(marker => {
                if (map.hasLayer(marker)) map.removeLayer(marker);
            });
        };
    }, [map, rocketData, previousRocketIds]);

    return null;
}

