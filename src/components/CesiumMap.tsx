import { useEffect, useRef, MutableRefObject } from 'react';
import { 
    Viewer, 
    Cartesian3,
    Cartographic,
    Ion,
    Color,
    UrlTemplateImageryProvider,
    Math as CesiumMath
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { CesiumMarkerManager, AddEventCallback } from '../utils/CesiumMarkerManager';
import { DataPoint } from '../models/DataPoint';

// Disable Cesium Ion - we'll use free imagery that doesn't require authentication
Ion.defaultAccessToken = '';

interface MapController {
    zoomTo: (lat: number, lon: number, data?: { markerId?: string }) => void;
    startRotation: () => void;
    stopRotation: () => void;
    resetCamera: () => void;
    adjustAltitudeForRotation: () => void;
    startISSTracking: () => void;
    stopISSTracking: () => void;
}

interface CesiumMapProps {
    dataPoints: DataPoint[];
    addEvent: AddEventCallback;
    severityThreshold: number;
    setMapController: (controller: MapController) => void;
    markerManagerRef: MutableRefObject<CesiumMarkerManager | null>;
    onCameraHeightChange?: (height: number) => void;
}

function CesiumMap({ 
    dataPoints, 
    addEvent, 
    severityThreshold, 
    setMapController,
    markerManagerRef,
    onCameraHeightChange
}: CesiumMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<Viewer | null>(null);
    const rotationIntervalRef = useRef<number | null>(null);
    const issTrackingActiveRef = useRef<boolean>(false);

    // Initialize Cesium viewer
    useEffect(() => {
        if (!containerRef.current || viewerRef.current) return;

        const initViewer = async () => {
            try {
                // Create viewer without default imagery first
                const viewer = new Viewer(containerRef.current!, {
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
                    shouldAnimate: false
                });

                // Remove default imagery layers
                viewer.imageryLayers.removeAll();

                // Add CartoDB Dark Matter tiles (dark mode theme)
                const imageryProvider = new UrlTemplateImageryProvider({
                    url: 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                    credit: '© OpenStreetMap contributors, © CartoDB'
                });
                viewer.imageryLayers.addImageryProvider(imageryProvider);

                // Keep the nice starry background
                viewer.scene.backgroundColor = Color.BLACK;
                
                // Disable lighting for consistent view
                viewer.scene.globe.enableLighting = false;

                viewerRef.current = viewer;
                console.log('✅ Cesium Viewer created with Natural Earth II imagery');

                // Initialize marker manager
                markerManagerRef.current = new CesiumMarkerManager(
                    viewer,
                    addEvent,
                    severityThreshold
                );
                console.log('✅ CesiumMarkerManager initialized');

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
                    },
                    startRotation: () => {
                        // Stop any existing rotation
                        if (rotationIntervalRef.current) {
                            clearInterval(rotationIntervalRef.current);
                        }
                        
                        // Slow rotation: rotate the globe around its axis
                        // Rotation speed: ~0.1 degrees per frame (60fps = 6 degrees/sec = full rotation in 60 seconds)
                        const rotationSpeed = 0.0003; // radians per frame
                        
                        rotationIntervalRef.current = window.setInterval(() => {
                            if (viewer.camera) {
                                viewer.camera.rotateRight(rotationSpeed);
                            }
                        }, 16); // ~60fps
                        
                        console.log('🔄 Globe rotation started');
                    },
                    stopRotation: () => {
                        if (rotationIntervalRef.current) {
                            clearInterval(rotationIntervalRef.current);
                            rotationIntervalRef.current = null;
                            console.log('⏹️ Globe rotation stopped');
                        }
                    },
                    resetCamera: () => {
                        // Clear any tracked entity first (e.g., ISS tracking)
                        if (viewer.trackedEntity) {
                            viewer.trackedEntity = undefined;
                        }
                        
                        // Reset to a nice global view at 8Mm altitude
                        viewer.camera.flyTo({
                            destination: Cartesian3.fromDegrees(0, 20, 8000000), // Center on equator, 8M meters altitude
                            duration: 2.0,
                            orientation: {
                                heading: 0,
                                pitch: -Math.PI / 2, // Look straight down
                                roll: 0
                            }
                        });
                        console.log('🌍 Camera reset to global view (8Mm altitude)');
                    },
                    adjustAltitudeForRotation: () => {
                        // Clear any tracked entity first (e.g., ISS tracking)
                        if (viewer.trackedEntity) {
                            viewer.trackedEntity = undefined;
                        }
                        
                        // Get current camera position
                        const currentPosition = viewer.camera.positionCartographic;
                        const currentLon = CesiumMath.toDegrees(currentPosition.longitude);
                        const currentLat = CesiumMath.toDegrees(currentPosition.latitude);
                        
                        // Fly to same location but at 8Mm altitude
                        viewer.camera.flyTo({
                            destination: Cartesian3.fromDegrees(currentLon, currentLat, 8000000),
                            duration: 2.0,
                            orientation: {
                                heading: 0,
                                pitch: -Math.PI / 2, // Look straight down
                                roll: 0
                            }
                        });
                        console.log(`🔄 Adjusting altitude for rotation at (${currentLon.toFixed(2)}°, ${currentLat.toFixed(2)}°)`);
                    },
                    startISSTracking: () => {
                        // Mark ISS tracking as active
                        issTrackingActiveRef.current = true;
                        
                        // Get ISS entity from marker manager
                        const issEntity = markerManagerRef.current?.getISSEntity();
                        
                        if (issEntity) {
                            // Set viewing distance offset - this controls how far the camera is from the ISS when tracking
                            // Closer view while still showing some orbit
                            issEntity.viewFrom = new Cartesian3(0, -3000000, 2000000); // Back 3Mm, up 2Mm
                            
                            // Fly to ISS position first for smooth animation
                            const issPosition = issEntity.position?.getValue(viewer.clock.currentTime);
                            if (issPosition) {
                                viewer.camera.flyTo({
                                    destination: Cartesian3.fromElements(
                                        issPosition.x * 1.5,  // Closer zoom
                                        issPosition.y * 1.5,
                                        issPosition.z * 1.5
                                    ),
                                    duration: 2.0,
                                    complete: () => {
                                        // Only start tracking if ISS mode is still active
                                        if (issTrackingActiveRef.current) {
                                            viewer.trackedEntity = issEntity;
                                            console.log('🛰️ ISS tracking started with orbit view distance');
                                        }
                                    }
                                });
                            } else {
                                // If position not available, just track immediately with offset
                                if (issTrackingActiveRef.current) {
                                    viewer.trackedEntity = issEntity;
                                    console.log('🛰️ ISS tracking started');
                                }
                            }
                        } else {
                            console.warn('⚠️ ISS entity not found for tracking');
                        }
                    },
                    stopISSTracking: () => {
                        // Mark ISS tracking as inactive
                        issTrackingActiveRef.current = false;
                        
                        // Clear tracked entity
                        if (viewer.trackedEntity) {
                            viewer.trackedEntity = undefined;
                            console.log('⏹️ ISS tracking stopped');
                        }
                    }
                });

                // Setup camera height tracker
                if (onCameraHeightChange) {
                    viewer.camera.changed.addEventListener(() => {
                        const height = viewer.camera.positionCartographic.height;
                        onCameraHeightChange(height);
                    });
                    
                    // Set initial height
                    onCameraHeightChange(viewer.camera.positionCartographic.height);
                }

            } catch (error) {
                console.error('Error initializing Cesium:', error);
            }
        };

        initViewer();

        // Cleanup on unmount
        return () => {
            // Stop rotation if active
            if (rotationIntervalRef.current) {
                clearInterval(rotationIntervalRef.current);
                rotationIntervalRef.current = null;
            }
            
            if (viewerRef.current) {
                viewerRef.current.destroy();
                viewerRef.current = null;
            }
        };
    }, [setMapController, markerManagerRef]); // Removed addEvent and severityThreshold - they're updated via separate useEffects

    // Update addEvent callback when it changes
    useEffect(() => {
        if (markerManagerRef.current) {
            markerManagerRef.current.updateAddEvent(addEvent);
        }
    }, [addEvent, markerManagerRef]);

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

