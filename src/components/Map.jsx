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

export default function Map({ earthquakeData, issData, volcanicData, hurricaneData, tornadoData, auroraData, windData, precipitationData, rocketData, conflictData, protestData, unrestData, diseaseData, previousEarthquakeIds, previousISSLocation, previousVolcanicIds, previousHurricaneIds, previousTornadoIds, previousAuroraIds, previousWindIds, previousPrecipitationIds, previousRocketIds, previousConflictIds, previousProtestIds, previousUnrestIds, previousDiseaseIds }) {
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
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                setMapReady(false);
            }
        };
    }, []);

    return (
        <>
            <div id="map" ref={mapRef}></div>
            {mapReady && mapInstanceRef.current && (
                <>
                    <EarthquakeMarkers 
                        map={mapInstanceRef.current}
                        earthquakeData={earthquakeData}
                        previousEarthquakeIds={previousEarthquakeIds}
                    />
                    <VolcanicMarkers 
                        map={mapInstanceRef.current}
                        volcanicData={volcanicData}
                        previousVolcanicIds={previousVolcanicIds}
                    />
                    <HurricaneMarkers 
                        map={mapInstanceRef.current}
                        hurricaneData={hurricaneData}
                        previousHurricaneIds={previousHurricaneIds}
                    />
                    <TornadoMarkers 
                        map={mapInstanceRef.current}
                        tornadoData={tornadoData}
                        previousTornadoIds={previousTornadoIds}
                    />
                    <AuroraMarkers 
                        map={mapInstanceRef.current}
                        auroraData={auroraData}
                        previousAuroraIds={previousAuroraIds}
                    />
                    <WindPatternMarkers 
                        map={mapInstanceRef.current}
                        windData={windData}
                        previousWindIds={previousWindIds}
                    />
                    <PrecipitationMarkers 
                        map={mapInstanceRef.current}
                        precipitationData={precipitationData}
                        previousPrecipitationIds={previousPrecipitationIds}
                    />
                    <RocketLaunchMarkers 
                        map={mapInstanceRef.current}
                        rocketData={rocketData}
                        previousRocketIds={previousRocketIds}
                    />
                    <ConflictMarkers 
                        map={mapInstanceRef.current}
                        conflictData={conflictData}
                        previousConflictIds={previousConflictIds}
                    />
                    <ProtestMarkers 
                        map={mapInstanceRef.current}
                        protestData={protestData}
                        previousProtestIds={previousProtestIds}
                    />
                    <SocialUnrestMarkers 
                        map={mapInstanceRef.current}
                        unrestData={unrestData}
                        previousUnrestIds={previousUnrestIds}
                    />
                    <DiseaseOutbreakMarkers 
                        map={mapInstanceRef.current}
                        diseaseData={diseaseData}
                        previousDiseaseIds={previousDiseaseIds}
                    />
                    <ISSMarker 
                        map={mapInstanceRef.current}
                        issData={issData}
                        previousISSLocation={previousISSLocation}
                    />
                </>
            )}
        </>
    );
}

