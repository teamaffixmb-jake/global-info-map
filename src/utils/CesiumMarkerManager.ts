/**
 * CesiumMarkerManager - Unified pipeline for processing and rendering DataPoints on Cesium globe
 * 
 * Handles:
 * 1. Adding new entities to the globe
 * 2. Updating existing entities when data changes
 * 3. Removing entities that are no longer in the data
 * 4. Logging events based on severity threshold
 */

import { Viewer, Entity, Cartesian3, Color, ColorMaterialProperty, PolygonHierarchy, Cartesian2, PolylineArrowMaterialProperty, ConstantProperty, ConstantPositionProperty } from 'cesium';
import { DataPoint, DataSourceType } from '../models/DataPoint';
import { RawWind } from './converters';
import { getMagnitudeColor, getMagnitudeRadius, formatAge, getVolcanicAlertColor, getVolcanicSize, getHurricaneColor, getHurricaneSize } from './helpers';
import { traceStreamline, getWindColor, getWindOpacity } from './streamlines';

export type AddEventCallback = (
    type: string,
    emoji: string,
    title: string,
    message: string,
    lat: number,
    lon: number,
    data: { markerId?: string; [key: string]: any },
    severity: number
) => void;

interface EntityEntry {
    entity: Entity;
    dataPoint: DataPoint;
    timeLabel?: Entity; // Optional time label for earthquakes
    orbitPathA?: Entity; // Optional orbit visualization for ISS (buffer A)
    orbitPathB?: Entity; // Optional orbit visualization for ISS (buffer B)
    currentOrbit?: 'A' | 'B'; // Track which orbit buffer was created most recently
}

export class CesiumMarkerManager {
    private viewer: Viewer;
    private addEventCallback: AddEventCallback | null;
    private severityThreshold: number;
    private entities: Map<string, EntityEntry>;
    private loggedEventIds: Set<string>;
    private streamlineEntities: Entity[];
    private cameraScaleFactor: number = 1.0;

    constructor(viewer: Viewer, addEventCallback: AddEventCallback | null = null, severityThreshold: number = 1) {
        this.viewer = viewer;
        this.addEventCallback = addEventCallback;
        this.severityThreshold = severityThreshold;
        this.entities = new Map();
        this.loggedEventIds = new Set();
        this.streamlineEntities = [];
        
        // Listen to camera changes to update marker sizes
        this.setupCameraListener();
    }
    
    /**
     * Setup camera listener with linear scaling and max cap
     */
    private setupCameraListener(): void {
        this.viewer.camera.changed.addEventListener(() => {
            const cameraHeight = this.viewer.camera.positionCartographic.height;
            
            // Linear scaling below 7M meters, constant size above
            // This makes circles appear constant visual size as you zoom in
            // But prevents them from growing too large when zoomed out globally
            
            const minHeight = 10; // 10 meters minimum
            const capHeight = 7000000; // 7M meters - freeze size above this
            const normalizedHeight = Math.max(minHeight, cameraHeight);
            
            // Linear scale with cap at 7M meters
            // Using a much smaller divisor to keep circles reasonable at global view
            // At 10m: scale = 0.000003 (tiny circles ~45m)
            // At 1,000m: scale = 0.0003 (circles ~4.5km)
            // At 100,000m: scale = 0.03 (circles ~450km)
            // At 7,000,000m: scale = 2.1 (circles ~315km - perfect for global view)
            // At 20,000,000m: scale = 2.1 (capped - same as 7M)
            const linearScale = normalizedHeight / 3333333;
            this.cameraScaleFactor = Math.min(linearScale, capHeight / 3333333);
            
            // Update all existing entities
            this.updateEntitySizes();
        });
    }
    
    /**
     * Update all entity sizes based on current camera scale
     */
    private updateEntitySizes(): void {
        this.entities.forEach((entry) => {
            const dataPoint = entry.dataPoint;
            
            if (dataPoint.type === 'earthquake') {
                const metadata = dataPoint.metadata as any;
                const baseRadius = getMagnitudeRadius(metadata.magnitude);
                const radiusMeters = baseRadius * 10000 * this.cameraScaleFactor;
                
                if (entry.entity.ellipse) {
                    entry.entity.ellipse.semiMinorAxis = new ConstantProperty(radiusMeters);
                    entry.entity.ellipse.semiMajorAxis = new ConstantProperty(radiusMeters);
                }
                
                // Update time label offset
                if (entry.timeLabel && entry.timeLabel.position) {
                    const offsetMeters = radiusMeters + 20000 * this.cameraScaleFactor;
                    entry.timeLabel.position = new ConstantPositionProperty(Cartesian3.fromDegrees(
                        dataPoint.lon + (offsetMeters / 111320),
                        dataPoint.lat
                    ));
                }
            } else if (dataPoint.type === 'volcano') {
                const metadata = dataPoint.metadata as any;
                const alertLevel = metadata.alertLevel || 'normal';
                const size = getVolcanicSize(alertLevel);
                const sizeMeters = size * 10000 * this.cameraScaleFactor;
                const degreeOffset = sizeMeters / 111320;
                
                if (entry.entity.polygon) {
                    entry.entity.polygon.hierarchy = new ConstantProperty(new PolygonHierarchy([
                        Cartesian3.fromDegrees(dataPoint.lon, dataPoint.lat + degreeOffset),
                        Cartesian3.fromDegrees(dataPoint.lon - degreeOffset * 0.866, dataPoint.lat - degreeOffset * 0.5),
                        Cartesian3.fromDegrees(dataPoint.lon + degreeOffset * 0.866, dataPoint.lat - degreeOffset * 0.5)
                    ]));
                }
            }
        });
    }

    /**
     * Update severity threshold
     */
    setSeverityThreshold(threshold: number): void {
        this.severityThreshold = threshold;
    }

    /**
     * Process an array of DataPoints - add new, update existing, remove old
     */
    processDataPoints(dataPoints: DataPoint[]): void {
        const currentIds = new Set(dataPoints.map(dp => dp.id));
        
        // Remove entities that are no longer in the data
        const idsToRemove: string[] = [];
        this.entities.forEach((_, id) => {
            if (!currentIds.has(id)) {
                idsToRemove.push(id);
            }
        });
        idsToRemove.forEach(id => this.removeEntity(id));

        // Add or update entities
        dataPoints.forEach(dataPoint => {
            this.processDataPoint(dataPoint);
        });
    }

    /**
     * Process a single DataPoint
     */
    private processDataPoint(dataPoint: DataPoint): void {
        const existing = this.entities.get(dataPoint.id);

        if (!existing) {
            // New entity - add it
            this.addEntity(dataPoint);
        } else if (dataPoint.hasChanged(existing.dataPoint)) {
            // Entity changed - update it
            this.updateEntity(dataPoint, existing);
        }
        // Else: no change, do nothing
    }

    /**
     * Update a single entity without checking for removals
     * Useful for frequent updates like ISS position
     */
    public updateSingleEntity(dataPoint: DataPoint): void {
        const existing = this.entities.get(dataPoint.id);

        if (!existing) {
            // New entity - add it
            this.addEntity(dataPoint);
        } else if (dataPoint.hasChanged(existing.dataPoint)) {
            // Entity changed - update it
            this.updateEntity(dataPoint, existing);
        }
    }

    /**
     * Get the ISS entity for tracking
     */
    public getISSEntity(): Entity | null {
        for (const [id, entry] of this.entities) {
            if (entry.dataPoint.type === DataSourceType.ISS) {
                return entry.entity;
            }
        }
        return null;
    }

    /**
     * Add a new entity to the globe
     */
    private addEntity(dataPoint: DataPoint): void {
        const entity = this.createEntity(dataPoint);
        if (!entity) return;

        this.viewer.entities.add(entity);
        
        // Add time label if it exists (for earthquakes)
        const timeLabel = (entity as any)._timeLabel;
        
        // Add orbit path if it exists (for ISS) - start with orbitA
        const orbitPath = (entity as any)._orbitPath;
        
        if (timeLabel && orbitPath) {
            this.viewer.entities.add(timeLabel);
            this.viewer.entities.add(orbitPath);
            this.entities.set(dataPoint.id, { entity, dataPoint, timeLabel, orbitPathA: orbitPath, currentOrbit: 'A' });
        } else if (timeLabel) {
            this.viewer.entities.add(timeLabel);
            this.entities.set(dataPoint.id, { entity, dataPoint, timeLabel });
        } else if (orbitPath) {
            this.viewer.entities.add(orbitPath);
            this.entities.set(dataPoint.id, { entity, dataPoint, orbitPathA: orbitPath, currentOrbit: 'A' });
        } else {
            this.entities.set(dataPoint.id, { entity, dataPoint });
        }

        // Log to event log if this is a new event and meets severity threshold
        if (!this.loggedEventIds.has(dataPoint.id)) {
            this.logEvent(dataPoint);
            this.loggedEventIds.add(dataPoint.id);
        }
    }

    /**
     * Update an existing entity
     */
    private updateEntity(dataPoint: DataPoint, existing: EntityEntry): void {
        // Special handling for ISS: update position in place to maintain tracking
        if (dataPoint.type === DataSourceType.ISS) {
            const metadata = dataPoint.metadata as any;
            const altitude = (metadata.altitude || 400) * 1000;
            const newPosition = Cartesian3.fromDegrees(
                dataPoint.lon, 
                dataPoint.lat, 
                altitude
            );
            
            // Update position property
            existing.entity.position = new ConstantPositionProperty(newPosition);
            
            // Update description
            existing.entity.description = new ConstantProperty(`
                <strong>${dataPoint.emoji} ${dataPoint.title}</strong><br>
                ${dataPoint.description}<br>
                Altitude: ${metadata.altitude} km<br>
                Velocity: ${metadata.velocity} km/h
            `);
            
            // Update orbit path using double-buffering to prevent flicker
            if (existing.orbitPathA || existing.orbitPathB) {
                // Determine which buffer to update (alternate between A and B)
                const updateBuffer = existing.currentOrbit === 'A' ? 'B' : 'A';
                
                // FIRST: Remove the old buffer that we're replacing
                if (updateBuffer === 'A' && existing.orbitPathA) {
                    this.viewer.entities.remove(existing.orbitPathA);
                } else if (updateBuffer === 'B' && existing.orbitPathB) {
                    this.viewer.entities.remove(existing.orbitPathB);
                }
                
                // THEN: Create and add new orbit in the update buffer
                const newOrbit = this.createISSOrbitPath(dataPoint.lat, altitude, updateBuffer);
                this.viewer.entities.add(newOrbit);
                
                // Update entity entry with new orbit
                const updatedEntry: EntityEntry = {
                    entity: existing.entity,
                    dataPoint,
                    currentOrbit: updateBuffer
                };
                
                if (updateBuffer === 'A') {
                    updatedEntry.orbitPathA = newOrbit;
                    updatedEntry.orbitPathB = existing.orbitPathB; // Keep the other buffer
                } else {
                    updatedEntry.orbitPathA = existing.orbitPathA; // Keep the other buffer
                    updatedEntry.orbitPathB = newOrbit;
                }
                
                this.entities.set(dataPoint.id, updatedEntry);
            } else {
                // No orbit exists yet (shouldn't happen), just update the dataPoint
                this.entities.set(dataPoint.id, { 
                    entity: existing.entity, 
                    dataPoint
                });
            }
            
            // Don't log ISS updates (too frequent)
            return;
        }
        
        // For all other entity types: recreate (original behavior)
        // Remove old entity, time label, and orbit paths
        this.viewer.entities.remove(existing.entity);
        if (existing.timeLabel) {
            this.viewer.entities.remove(existing.timeLabel);
        }
        if (existing.orbitPathA) {
            this.viewer.entities.remove(existing.orbitPathA);
        }
        if (existing.orbitPathB) {
            this.viewer.entities.remove(existing.orbitPathB);
        }

        // Create and add new entity
        const entity = this.createEntity(dataPoint);
        if (!entity) return;

        this.viewer.entities.add(entity);

        // Add time label and/or orbit path if they exist
        const timeLabel = (entity as any)._timeLabel;
        const orbitPath = (entity as any)._orbitPath;
        
        if (timeLabel && orbitPath) {
            this.viewer.entities.add(timeLabel);
            this.viewer.entities.add(orbitPath);
            this.entities.set(dataPoint.id, { entity, dataPoint, timeLabel, orbitPathA: orbitPath, currentOrbit: 'A' });
        } else if (timeLabel) {
            this.viewer.entities.add(timeLabel);
            this.entities.set(dataPoint.id, { entity, dataPoint, timeLabel });
        } else if (orbitPath) {
            this.viewer.entities.add(orbitPath);
            this.entities.set(dataPoint.id, { entity, dataPoint, orbitPathA: orbitPath, currentOrbit: 'A' });
        } else {
            this.entities.set(dataPoint.id, { entity, dataPoint });
        }

        // Log update to event log
        this.logEvent(dataPoint);
    }

    /**
     * Remove an entity from the globe
     */
    removeEntity(id: string): void {
        const existing = this.entities.get(id);
        if (existing) {
            // Remove time label if it exists
            if (existing.timeLabel) {
                this.viewer.entities.remove(existing.timeLabel);
            }
            
            // Remove both orbit paths if they exist
            if (existing.orbitPathA) {
                this.viewer.entities.remove(existing.orbitPathA);
            }
            if (existing.orbitPathB) {
                this.viewer.entities.remove(existing.orbitPathB);
            }

            this.viewer.entities.remove(existing.entity);
            this.entities.delete(id);
            this.loggedEventIds.delete(id);
        }
    }

    /**
     * Create a Cesium entity based on DataPoint type
     */
    private createEntity(dataPoint: DataPoint): Entity | null {
        switch (dataPoint.type) {
            case DataSourceType.EARTHQUAKE:
                return this.createEarthquakeEntity(dataPoint);
            case DataSourceType.VOLCANO:
                return this.createVolcanoEntity(dataPoint);
            case DataSourceType.HURRICANE:
                return this.createHurricaneEntity(dataPoint);
            case DataSourceType.ISS:
                return this.createISSEntity(dataPoint);
            default:
                // Stub for other types - will implement in Phase 4+
                console.log(`Stub: Would create entity for ${dataPoint.type}`);
                return null;
        }
    }

    /**
     * Create earthquake entity with ellipse and time label
     */
    private createEarthquakeEntity(dataPoint: DataPoint): Entity {
        const metadata = dataPoint.metadata as any;
        const mag = metadata.magnitude;
        const radius = getMagnitudeRadius(mag);
        const colorHex = getMagnitudeColor(mag);
        const color = Color.fromCssColorString(colorHex);
        
        // Convert pixel radius to meters - base size that will scale with camera
        // Using smaller multiplier to prevent oversized circles
        const radiusMeters = radius * 10000;
        
        // Create the main ellipse entity
        const entity = new Entity({
            id: dataPoint.id,
            position: Cartesian3.fromDegrees(dataPoint.lon, dataPoint.lat),
            ellipse: {
                semiMinorAxis: radiusMeters,
                semiMajorAxis: radiusMeters,
                material: new ColorMaterialProperty(color.withAlpha(dataPoint.isNew() ? 0.9 : 0.6)),
                outline: true,
                outlineColor: Color.WHITE.withAlpha(dataPoint.isNew() ? 1.0 : 0.8),
                outlineWidth: dataPoint.isNew() ? 3 : 1
            },
            description: `
                <strong>${dataPoint.emoji} ${dataPoint.title}</strong><br>
                Location: ${dataPoint.description}<br>
                Depth: ${metadata.depth}km<br>
                Time: ${new Date(dataPoint.timestamp).toLocaleString()}<br>
                Age: ${formatAge(dataPoint.getAge())}
            `
        });

        // Create time label
        const age = dataPoint.getAge();
        const timeText = this.formatTimeAgo(age);
        
        // Calculate offset for time label (to the right of the circle)
        const offsetMeters = radiusMeters + 20000; // Add offset from edge
        
        const timeLabel = new Entity({
            id: `${dataPoint.id}-time-label`,
            position: Cartesian3.fromDegrees(
                dataPoint.lon + (offsetMeters / 111320), // Approximate degree offset
                dataPoint.lat
            ),
            label: {
                text: timeText,
                font: '8pt sans-serif',
                fillColor: color,
                backgroundColor: Color.BLACK.withAlpha(0.7),
                backgroundPadding: new Cartesian3(3, 1, 0),
                style: 0, // FILL
                pixelOffset: new Cartesian3(0, 0, 0),
                showBackground: true,
                outlineColor: color,
                outlineWidth: 0.5,
                disableDepthTestDistance: Number.POSITIVE_INFINITY // Always visible
            }
        });

        // Store time label reference on entity for cleanup
        (entity as any)._timeLabel = timeLabel;
        
        return entity;
    }

    /**
     * Create volcano entity with triangle point
     */
    private createVolcanoEntity(dataPoint: DataPoint): Entity {
        const metadata = dataPoint.metadata as any;
        const alertLevel = metadata.alertLevel || 'normal';
        const size = getVolcanicSize(alertLevel);
        const colorHex = getVolcanicAlertColor(alertLevel);
        const color = Color.fromCssColorString(colorHex);

        // Use a triangle polygon to represent volcano
        // Create triangle vertices around the volcano position
        const sizeMeters = size * 10000; // Base size that will scale with camera to maintain constant visual appearance
        const degreeOffset = sizeMeters / 111320; // Approximate degree offset

        const entity = new Entity({
            id: dataPoint.id,
            position: Cartesian3.fromDegrees(dataPoint.lon, dataPoint.lat, 0),
            polygon: {
                hierarchy: new PolygonHierarchy([
                    Cartesian3.fromDegrees(dataPoint.lon, dataPoint.lat + degreeOffset),
                    Cartesian3.fromDegrees(dataPoint.lon - degreeOffset, dataPoint.lat - degreeOffset),
                    Cartesian3.fromDegrees(dataPoint.lon + degreeOffset, dataPoint.lat - degreeOffset)
                ]),
                material: color.withAlpha(0.8),
                outline: true,
                outlineColor: Color.WHITE,
                outlineWidth: 2
            },
            description: `
                <strong>${dataPoint.emoji} ${dataPoint.title}</strong><br>
                ${dataPoint.description}<br>
                Elevation: ${metadata.elevation}m<br>
                Last Eruption: ${new Date(metadata.lastEruption).toLocaleDateString()}<br>
                Activity: ${formatAge(dataPoint.getAge())}
            `
        });

        return entity;
    }

    /**
     * Create hurricane entity with billboard
     */
    private createHurricaneEntity(dataPoint: DataPoint): Entity {
        const metadata = dataPoint.metadata as any;
        const category = metadata.category || 0;
        const size = getHurricaneSize(category);
        const colorHex = getHurricaneColor(category);
        const color = Color.fromCssColorString(colorHex);

        // Use point with spinning effect via callback
        const entity = new Entity({
            id: dataPoint.id,
            position: Cartesian3.fromDegrees(dataPoint.lon, dataPoint.lat, 0),
            point: {
                pixelSize: size * 0.5,
                color: color.withAlpha(0.9),
                outlineColor: Color.WHITE,
                outlineWidth: 1,
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            },
            label: {
                text: dataPoint.emoji,
                font: `${size * 0.5}pt sans-serif`,
                fillColor: color,
                style: 0, // FILL
                pixelOffset: new Cartesian2(0, 0),
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            },
            description: `
                <strong>${dataPoint.emoji} ${dataPoint.title}</strong><br>
                ${dataPoint.description}<br>
                Pressure: ${metadata.pressure}mb<br>
                Direction: ${metadata.direction}
            `
        });

        return entity;
    }

    /**
     * Create ISS entity with satellite icon and orbital path
     */
    private createISSEntity(dataPoint: DataPoint): Entity {
        const metadata = dataPoint.metadata as any;
        const altitude = (metadata.altitude || 400) * 1000; // meters

        const entity = new Entity({
            id: dataPoint.id,
            position: Cartesian3.fromDegrees(dataPoint.lon, dataPoint.lat, altitude),
            point: {
                pixelSize: 8,
                color: Color.CYAN,
                outlineColor: Color.WHITE,
                outlineWidth: 1,
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            },
            label: {
                text: dataPoint.emoji,
                font: '16pt sans-serif',
                fillColor: Color.CYAN,
                style: 0, // FILL
                pixelOffset: new Cartesian2(0, 0),
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            },
            description: `
                <strong>${dataPoint.emoji} ${dataPoint.title}</strong><br>
                ${dataPoint.description}<br>
                Altitude: ${metadata.altitude} km<br>
                Velocity: ${metadata.velocity} km/h
            `
        });

        // Create orbital path visualization
        const orbitPath = this.createISSOrbitPath(dataPoint.lat, altitude);
        (entity as any)._orbitPath = orbitPath;

        return entity;
    }

    /**
     * Create a circular orbit path at ISS altitude
     */
    private createISSOrbitPath(currentLat: number, altitude: number, buffer?: 'A' | 'B'): Entity {
        // Create positions for a circular orbit
        // Approximate orbit as a circle at the current latitude
        const positions: Cartesian3[] = [];
        const segments = 360; // One point per degree
        
        // Create circle around Earth at ISS altitude and approximate latitude
        for (let i = 0; i <= segments; i++) {
            const longitude = (i / segments) * 360 - 180;
            const position = Cartesian3.fromDegrees(longitude, currentLat, altitude);
            positions.push(position);
        }

        const orbitEntity = new Entity({
            id: buffer ? `iss-orbit-${buffer}` : 'iss-orbit',
            polyline: {
                positions: positions,
                width: 2,
                material: new ColorMaterialProperty(Color.CYAN.withAlpha(0.4)),
                clampToGround: false
            }
        });

        return orbitEntity;
    }

    /**
     * Format time ago in a concise way
     */
    private formatTimeAgo(ageMs: number): string {
        const seconds = Math.floor(ageMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (seconds < 60) return `${seconds}s ago`;
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return `${Math.floor(days / 7)}w ago`;
    }

    /**
     * Log event to event log
     */
    private logEvent(dataPoint: DataPoint): void {
        if (!this.addEventCallback) return;
        if (dataPoint.severity < this.severityThreshold) return;

        this.addEventCallback(
            dataPoint.type,
            dataPoint.emoji,
            dataPoint.title,
            dataPoint.description,
            dataPoint.lat,
            dataPoint.lon,
            { markerId: dataPoint.id },
            dataPoint.severity
        );
    }

    /**
     * Clear all entities
     */
    clear(): void {
        this.entities.forEach((entry) => {
            // Remove time label if it exists
            if (entry.timeLabel) {
                this.viewer.entities.remove(entry.timeLabel);
            }
            this.viewer.entities.remove(entry.entity);
        });
        this.entities.clear();
        this.loggedEventIds.clear();

        // Clear streamlines
        this.streamlineEntities.forEach(entity => {
            this.viewer.entities.remove(entity);
        });
        this.streamlineEntities = [];
    }

    /**
     * Render wind streamlines as polylines on the globe
     */
    renderWindStreamlines(windData: RawWind[], setLoadingMessage?: (msg: string) => void): void {
        // Clear existing streamlines
        this.streamlineEntities.forEach(entity => {
            this.viewer.entities.remove(entity);
        });
        this.streamlineEntities = [];

        if (windData.length === 0) {
            console.log('No wind data available for streamlines');
            return;
        }

        if (setLoadingMessage) {
            setLoadingMessage('Generating wind streamlines...');
        }

        console.log(`🌬️ Generating streamlines from ${windData.length} grid points...`);

        // Use all wind data points as seed points
        const seedPoints = windData
            .filter(point => point.speed >= 7) // Only start from points with decent wind
            .map(point => ({
                lat: point.lat + (Math.random() - 0.5) * 2, // Small jitter
                lon: point.lon + (Math.random() - 0.5) * 2
            }));

        let streamlineCount = 0;
        let rejectedCount = 0;

        // Trace streamlines from each seed point
        for (const seed of seedPoints) {
            const streamline = traceStreamline(
                seed.lat,
                seed.lon,
                windData,
                120,  // max steps
                0.6   // step size in degrees
            );

            if (streamline && streamline.points.length >= 20) {
                // Quality check: filter out degenerate streamlines
                if (!this.isValidStreamline(streamline)) {
                    rejectedCount++;
                    continue;
                }

                // Convert streamline points to Cesium Cartesian3 array
                const positions: Cartesian3[] = [];
                for (const point of streamline.points) {
                    positions.push(Cartesian3.fromDegrees(point.lon, point.lat, 0));
                }

                // Get color based on average wind speed
                const colorHex = getWindColor(streamline.avgSpeed);
                const color = Color.fromCssColorString(colorHex);
                const opacity = getWindOpacity(streamline.avgSpeed);
                const width = Math.min(2 + streamline.avgSpeed / 20, 4);

                // Create polyline entity with arrow material
                const polylineEntity = new Entity({
                    id: `streamline-${streamlineCount}`,
                    polyline: {
                        positions: positions,
                        width: width,
                        material: new PolylineArrowMaterialProperty(color.withAlpha(opacity)),
                        clampToGround: false, // Keep at surface level
                        arcType: 0 // ArcType.NONE - straight lines between points
                    },
                    description: `
                        <strong>🌬️ Wind Flow</strong><br>
                        Avg Speed: ${Math.round(streamline.avgSpeed)} mph<br>
                        Coordinates: ${streamline.points[Math.floor(streamline.points.length / 2)].lat.toFixed(1)}°, ${streamline.points[Math.floor(streamline.points.length / 2)].lon.toFixed(1)}°
                    `
                });

                this.viewer.entities.add(polylineEntity);
                this.streamlineEntities.push(polylineEntity);
                streamlineCount++;
            }
        }

        console.log(`✅ Rendered ${streamlineCount} wind streamlines (${rejectedCount} rejected as artifacts)`);

        if (setLoadingMessage) {
            setLoadingMessage('');
        }
    }

    /**
     * Check if a streamline is valid (not degenerate)
     */
    private isValidStreamline(streamline: { points: Array<{ lat: number; lon: number; speed: number }>; avgSpeed: number }): boolean {
        const points = streamline.points;

        // Basic quality checks only
        // Reject very low wind speeds
        if (streamline.avgSpeed < 8) {
            return false;
        }

        // Calculate total distance traveled
        let totalDistance = 0;
        for (let i = 1; i < points.length; i++) {
            const dLat = points[i].lat - points[i - 1].lat;
            const dLon = points[i].lon - points[i - 1].lon;
            // Handle dateline crossings in distance calculation
            const adjustedDLon = Math.abs(dLon) > 180 ? 360 - Math.abs(dLon) : dLon;
            totalDistance += Math.sqrt(dLat * dLat + adjustedDLon * adjustedDLon);
        }

        // Reject very short streamlines
        if (totalDistance < 3) {
            return false;
        }

        return true;
    }

    /**
     * Get entity by ID
     */
    getEntity(id: string): EntityEntry | undefined {
        return this.entities.get(id);
    }

    /**
     * Get all entities
     */
    getAllEntities(): EntityEntry[] {
        return Array.from(this.entities.values());
    }

    /**
     * Open info box for a specific entity
     */
    openInfoBoxForEntity(id: string): void {
        const entry = this.entities.get(id);
        if (entry && entry.entity) {
            this.viewer.selectedEntity = entry.entity;
        }
    }

    /**
     * Update addEvent callback
     */
    updateAddEvent(callback: AddEventCallback | null): void {
        this.addEventCallback = callback;
    }
}

