import { useEffect, useRef, useState, MutableRefObject } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import { MarkerManager, AddEventCallback } from '../utils/MarkerManager';
import { DataPoint } from '../models/DataPoint';

interface MapController {
    zoomTo: (lat: number, lon: number, data?: { markerId?: string }) => void;
}

interface MapProps {
    dataPoints: DataPoint[];
    addEvent: AddEventCallback;
    severityThreshold: number;
    setMapController: (controller: MapController) => void;
    markerManagerRef: MutableRefObject<MarkerManager | null>;
}

export default function Map({ 
    dataPoints, 
    addEvent, 
    severityThreshold, 
    setMapController, 
    markerManagerRef 
}: MapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const [mapReady, setMapReady] = useState(false);

    // Initialize map once (runs only on mount)
    useEffect(() => {
        if (!mapInstanceRef.current && mapRef.current) {
            // Initialize map
            mapInstanceRef.current = L.map(mapRef.current).setView([20, 0], 2);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(mapInstanceRef.current);
            
            setMapReady(true);
        }

        return () => {
            if (mapInstanceRef.current) {
                if (markerManagerRef.current) {
                    markerManagerRef.current.clear();
                }
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                setMapReady(false);
            }
        };
    }, []); // Empty deps - only run once on mount

    // Initialize marker manager when map is ready
    useEffect(() => {
        if (mapReady && mapInstanceRef.current && !markerManagerRef.current) {
            markerManagerRef.current = new MarkerManager(
                mapInstanceRef.current,
                addEvent,
                severityThreshold
            );
        }
    }, [mapReady, addEvent, severityThreshold, markerManagerRef]);

    // Update marker manager's callbacks when they change
    useEffect(() => {
        if (markerManagerRef.current) {
            markerManagerRef.current.updateAddEvent(addEvent);
            markerManagerRef.current.setSeverityThreshold(severityThreshold);
        }
    }, [addEvent, severityThreshold, markerManagerRef]);

    // Set up map controller once
    useEffect(() => {
        if (mapReady && mapInstanceRef.current && setMapController) {
            setMapController({
                zoomTo: (lat: number, lon: number, data?: { markerId?: string }) => {
                    if (mapInstanceRef.current) {
                        mapInstanceRef.current.setView([lat, lon], 8, {
                            animate: true,
                            duration: 1
                        });
                        
                        // Find and open the marker's popup
                        if (data && data.markerId && markerManagerRef.current) {
                            setTimeout(() => {
                                const markerData = markerManagerRef.current?.getMarker(data.markerId!);
                                if (markerData) {
                                    markerData.marker.openPopup();
                                }
                            }, 1000);
                        }
                    }
                }
            });
        }
    }, [mapReady, setMapController, markerManagerRef]);

    // Process data points when they change
    useEffect(() => {
        if (mapReady && markerManagerRef.current && dataPoints) {
            markerManagerRef.current.processDataPoints(dataPoints);
        }
    }, [dataPoints, mapReady, markerManagerRef]);

    return <div id="map" ref={mapRef}></div>;
}

