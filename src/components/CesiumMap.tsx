import { useEffect, useRef, MutableRefObject } from 'react';
import { 
    Viewer, 
    Cartesian3, 
    Ion, 
    OpenStreetMapImageryProvider,
    Color
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { CesiumMarkerManager, AddEventCallback } from '../utils/CesiumMarkerManager';
import { DataPoint } from '../models/DataPoint';

// Disable Cesium Ion (we'll use OpenStreetMap)
Ion.defaultAccessToken = '';

interface MapController {
    zoomTo: (lat: number, lon: number, data?: { markerId?: string }) => void;
}

interface CesiumMapProps {
    dataPoints: DataPoint[];
    addEvent: AddEventCallback;
    severityThreshold: number;
    setMapController: (controller: MapController) => void;
    markerManagerRef: MutableRefObject<CesiumMarkerManager | null>;
}

function CesiumMap({ 
    dataPoints, 
    addEvent, 
    severityThreshold, 
    setMapController,
    markerManagerRef
}: CesiumMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<Viewer | null>(null);

    // Initialize Cesium viewer
    useEffect(() => {
        if (!containerRef.current || viewerRef.current) return;

        try {
            const viewer = new Viewer(containerRef.current, {
                animation: false,
                timeline: false,
                homeButton: false,
                geocoder: false,
                sceneModePicker: false,
                navigationHelpButton: false,
                baseLayerPicker: false,
                fullscreenButton: false,
                vrButton: false,
                infoBox: true,
                selectionIndicator: true,
                shouldAnimate: false,
                imageryProvider: new OpenStreetMapImageryProvider({
                    url: 'https://tile.openstreetmap.org/'
                })
            });

            // Set darker space background
            viewer.scene.backgroundColor = Color.BLACK;

            viewerRef.current = viewer;

            // Initialize marker manager
            markerManagerRef.current = new CesiumMarkerManager(
                viewer,
                addEvent,
                severityThreshold
            );
            console.log('✅ Cesium Viewer and MarkerManager initialized');

            // Setup map controller
            setMapController({
                zoomTo: (lat: number, lon: number, data?: { markerId?: string }) => {
                    viewer.camera.flyTo({
                        destination: Cartesian3.fromDegrees(lon, lat, 5000000),
                        duration: 2.5,
                        easingFunction: (t: number) => {
                            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                        }
                    });
                    
                    if (data?.markerId && markerManagerRef.current) {
                        setTimeout(() => {
                            markerManagerRef.current?.openInfoBoxForEntity(data.markerId!);
                        }, 2500);
                    }
                }
            });

        } catch (error) {
            console.error('Error initializing Cesium:', error);
        }

        // Cleanup on unmount
        return () => {
            if (viewerRef.current) {
                viewerRef.current.destroy();
                viewerRef.current = null;
            }
        };
    }, [addEvent, severityThreshold, setMapController, markerManagerRef]);

    // Update severity threshold
    useEffect(() => {
        if (markerManagerRef.current) {
            markerManagerRef.current.setSeverityThreshold(severityThreshold);
        }
    }, [severityThreshold, markerManagerRef]);

    // Process data points
    useEffect(() => {
        if (markerManagerRef.current && dataPoints.length > 0) {
            markerManagerRef.current.processDataPoints(dataPoints);
        }
    }, [dataPoints, markerManagerRef]);

    return (
        <div 
            ref={containerRef} 
            style={{ 
                width: '100%', 
                height: '100vh', 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            }} 
        />
    );
}

export default CesiumMap;

