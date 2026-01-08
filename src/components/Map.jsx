import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import EarthquakeMarkers from './EarthquakeMarkers';
import ISSMarker from './ISSMarker';
import VolcanicMarkers from './VolcanicMarkers';
import HurricaneMarkers from './HurricaneMarkers';
import TornadoMarkers from './TornadoMarkers';
import AuroraMarkers from './AuroraMarkers';
import WindPatternMarkers from './WindPatternMarkers';
import PrecipitationMarkers from './PrecipitationMarkers';
import RocketLaunchMarkers from './RocketLaunchMarkers';
import ConflictMarkers from './ConflictMarkers';
import ProtestMarkers from './ProtestMarkers';
import SocialUnrestMarkers from './SocialUnrestMarkers';
import DiseaseOutbreakMarkers from './DiseaseOutbreakMarkers';

export default function Map({ earthquakeData, issData, volcanicData, hurricaneData, tornadoData, auroraData, windData, precipitationData, rocketData, conflictData, protestData, unrestData, diseaseData, previousEarthquakeIds, previousISSLocation, previousVolcanicIds, previousHurricaneIds, previousTornadoIds, previousAuroraIds, previousWindIds, previousPrecipitationIds, previousRocketIds, previousConflictIds, previousProtestIds, previousUnrestIds, previousDiseaseIds, addEvent, setMapController }) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const [mapReady, setMapReady] = useState(false);

    useEffect(() => {
        if (!mapInstanceRef.current && mapRef.current) {
            mapInstanceRef.current = L.map(mapRef.current).setView([20, 0], 2);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(mapInstanceRef.current);
            setMapReady(true);

            // Set up map controller for event log interactions
            if (setMapController) {
                setMapController({
                    zoomTo: (lat, lon, data) => {
                        if (mapInstanceRef.current) {
                            mapInstanceRef.current.setView([lat, lon], 8, {
                                animate: true,
                                duration: 1
                            });
                            // Store data for marker to open popup
                            if (data && data.markerId) {
                                setTimeout(() => {
                                    // Find and open the marker's popup
                                    mapInstanceRef.current.eachLayer((layer) => {
                                        if (layer._markerId === data.markerId && layer.getPopup) {
                                            layer.openPopup();
                                        }
                                    });
                                }, 1000);
                            }
                        }
                    }
                });
            }
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                setMapReady(false);
            }
        };
    }, [setMapController]);

    return (
        <>
            <div id="map" ref={mapRef}></div>
            {mapReady && mapInstanceRef.current && (
                <>
                    <EarthquakeMarkers 
                        map={mapInstanceRef.current}
                        earthquakeData={earthquakeData}
                        previousEarthquakeIds={previousEarthquakeIds}
                        addEvent={addEvent}
                    />
                    <VolcanicMarkers 
                        map={mapInstanceRef.current}
                        volcanicData={volcanicData}
                        previousVolcanicIds={previousVolcanicIds}
                        addEvent={addEvent}
                    />
                    <HurricaneMarkers 
                        map={mapInstanceRef.current}
                        hurricaneData={hurricaneData}
                        previousHurricaneIds={previousHurricaneIds}
                        addEvent={addEvent}
                    />
                    <TornadoMarkers 
                        map={mapInstanceRef.current}
                        tornadoData={tornadoData}
                        previousTornadoIds={previousTornadoIds}
                        addEvent={addEvent}
                    />
                    <AuroraMarkers 
                        map={mapInstanceRef.current}
                        auroraData={auroraData}
                        previousAuroraIds={previousAuroraIds}
                        addEvent={addEvent}
                    />
                    <WindPatternMarkers 
                        map={mapInstanceRef.current}
                        windData={windData}
                        previousWindIds={previousWindIds}
                        addEvent={addEvent}
                    />
                    <PrecipitationMarkers 
                        map={mapInstanceRef.current}
                        precipitationData={precipitationData}
                        previousPrecipitationIds={previousPrecipitationIds}
                        addEvent={addEvent}
                    />
                    <RocketLaunchMarkers 
                        map={mapInstanceRef.current}
                        rocketData={rocketData}
                        previousRocketIds={previousRocketIds}
                        addEvent={addEvent}
                    />
                    <ConflictMarkers 
                        map={mapInstanceRef.current}
                        conflictData={conflictData}
                        previousConflictIds={previousConflictIds}
                        addEvent={addEvent}
                    />
                    <ProtestMarkers 
                        map={mapInstanceRef.current}
                        protestData={protestData}
                        previousProtestIds={previousProtestIds}
                        addEvent={addEvent}
                    />
                    <SocialUnrestMarkers 
                        map={mapInstanceRef.current}
                        unrestData={unrestData}
                        previousUnrestIds={previousUnrestIds}
                        addEvent={addEvent}
                    />
                    <DiseaseOutbreakMarkers 
                        map={mapInstanceRef.current}
                        diseaseData={diseaseData}
                        previousDiseaseIds={previousDiseaseIds}
                        addEvent={addEvent}
                    />
                    <ISSMarker 
                        map={mapInstanceRef.current}
                        issData={issData}
                        previousISSLocation={previousISSLocation}
                        addEvent={addEvent}
                    />
                </>
            )}
        </>
    );
}

