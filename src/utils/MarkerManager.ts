/**
 * MarkerManager - Unified pipeline for processing and rendering DataPoints
 * 
 * Handles:
 * 1. Adding new markers to the map
 * 2. Updating existing markers when data changes
 * 3. Removing markers that are no longer in the data
 * 4. Logging events based on severity threshold
 */

import * as L from 'leaflet';
import { DataPoint, DataSourceType } from '../models/DataPoint';
import { RawWind } from '../types/raw';
import { getMagnitudeRadius, getMagnitudeColor } from './helpers';
import { getVolcanicAlertColor, getVolcanicSize } from './helpers';
import { getHurricaneColor, getHurricaneSize } from './helpers';
import { getTornadoColor, getTornadoSize } from './helpers';
import { getAuroraColor, getAuroraSize } from './helpers';
import { getWindColor } from './helpers';
import { getPrecipitationColor } from './helpers';
import { getConflictColor } from './helpers';
import { getProtestColor } from './helpers';
import { getUnrestColor } from './helpers';
import { getDiseaseColor } from './helpers';
import { animateCircleBounce } from './animations';
import { formatAge } from './helpers';
import { 
    traceStreamline, 
    generateSeedPoints, 
    getWindColor as getStreamlineColor,
    getWindOpacity 
} from './streamlines';

// ===== Type Definitions =====

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

interface MarkerEntry {
    marker: L.Marker | L.CircleMarker;
    dataPoint: DataPoint;
}

// ===== MarkerManager Class =====

export class MarkerManager {
    private map: L.Map;
    private addEventCallback: AddEventCallback | null;
    private severityThreshold: number;
    private markers: Map<string, MarkerEntry>;
    private loggedEventIds: Set<string>;
    private streamlines: L.Polyline[];
    private windGridData: RawWind[];

    constructor(map: L.Map, addEventCallback: AddEventCallback | null = null, severityThreshold: number = 1) {
        this.map = map;
        this.addEventCallback = addEventCallback;
        this.severityThreshold = severityThreshold;
        this.markers = new Map();
        this.loggedEventIds = new Set();
        this.streamlines = [];
        this.windGridData = [];
    }

    /**
     * Update severity threshold
     */
    setSeverityThreshold(threshold: number): void {
        this.severityThreshold = threshold;
    }

    /**
     * Process an array of DataPoints
     */
    processDataPoints(dataPoints: DataPoint[]): void {
        const currentIds = new Set(dataPoints.map(dp => dp.id));
        
        // Update or add markers for current data points
        dataPoints.forEach(dataPoint => {
            this.processDataPoint(dataPoint);
        });
        
        // Remove markers that are no longer in the data
        const idsToRemove: string[] = [];
        this.markers.forEach((_value, id) => {
            if (!currentIds.has(id)) {
                idsToRemove.push(id);
            }
        });
        
        idsToRemove.forEach(id => this.removeMarker(id));
    }

    /**
     * Process a single DataPoint
     */
    processDataPoint(dataPoint: DataPoint): void {
        const existing = this.markers.get(dataPoint.id);
        
        if (existing) {
            // Update existing marker if data has changed
            if (dataPoint.hasChanged(existing.dataPoint)) {
                this.updateMarker(dataPoint, existing);
            }
        } else {
            // Add new marker
            this.addMarker(dataPoint);
        }
    }

    /**
     * Add a new marker to the map
     */
    private addMarker(dataPoint: DataPoint): void {
        const marker = this.createMarker(dataPoint);
        if (!marker) return;
        
        marker.addTo(this.map);
        (marker as any)._markerId = dataPoint.id;
        
        this.markers.set(dataPoint.id, { marker, dataPoint });
        
        // Log to event log if this is a new event and meets severity threshold
        if (!this.loggedEventIds.has(dataPoint.id)) {
            this.logEvent(dataPoint, true);
            this.loggedEventIds.add(dataPoint.id);
        }
        
        // Animate if new
        if (dataPoint.isNew()) {
            this.animateNewMarker(dataPoint, marker);
        }
    }

    /**
     * Update an existing marker
     */
    private updateMarker(dataPoint: DataPoint, existing: MarkerEntry): void {
        // Remove old marker
        this.map.removeLayer(existing.marker);
        
        // Create and add new marker
        const marker = this.createMarker(dataPoint);
        if (!marker) return;
        
        marker.addTo(this.map);
        (marker as any)._markerId = dataPoint.id;
        
        this.markers.set(dataPoint.id, { marker, dataPoint });
        
        // Log update to event log
        this.logEvent(dataPoint, false);
    }

    /**
     * Remove a marker from the map
     */
    removeMarker(id: string): void {
        const existing = this.markers.get(id);
        if (existing) {
            const marker = existing.marker as any;
            
            // Clean up any pulse intervals
            if (marker._pulseInterval) {
                clearInterval(marker._pulseInterval);
            }
            if (marker._pulseCircle) {
                if (marker._pulseCircle._pulseInterval) {
                    clearInterval(marker._pulseCircle._pulseInterval);
                }
                if (this.map.hasLayer(marker._pulseCircle)) {
                    this.map.removeLayer(marker._pulseCircle);
                }
            }
            
            this.map.removeLayer(existing.marker);
            this.markers.delete(id);
            this.loggedEventIds.delete(id);
        }
    }

    /**
     * Create a Leaflet marker based on DataPoint type
     */
    private createMarker(dataPoint: DataPoint): L.Marker | L.CircleMarker | null {
        switch (dataPoint.type) {
            case DataSourceType.EARTHQUAKE:
                return this.createEarthquakeMarker(dataPoint);
            case DataSourceType.ISS:
                return this.createISSMarker(dataPoint);
            case DataSourceType.VOLCANO:
                return this.createVolcanoMarker(dataPoint);
            case DataSourceType.HURRICANE:
                return this.createHurricaneMarker(dataPoint);
            case DataSourceType.TORNADO:
                return this.createTornadoMarker(dataPoint);
            case DataSourceType.AURORA:
                return this.createAuroraMarker(dataPoint);
            case DataSourceType.WIND:
                return this.createWindMarker(dataPoint);
            case DataSourceType.PRECIPITATION:
                return this.createPrecipitationMarker(dataPoint);
            case DataSourceType.ROCKET:
                return this.createRocketMarker(dataPoint);
            case DataSourceType.CONFLICT:
                return this.createConflictMarker(dataPoint);
            case DataSourceType.PROTEST:
                return this.createProtestMarker(dataPoint);
            case DataSourceType.UNREST:
                return this.createUnrestMarker(dataPoint);
            case DataSourceType.DISEASE:
                return this.createDiseaseMarker(dataPoint);
            default:
                console.warn('Unknown data point type:', dataPoint.type);
                return null;
        }
    }

    /**
     * Create earthquake marker
     */
    private createEarthquakeMarker(dataPoint: DataPoint): L.CircleMarker {
        const mag = (dataPoint.metadata as any).magnitude;
        const radius = getMagnitudeRadius(mag);
        const color = getMagnitudeColor(mag);
        
        const circle = L.circleMarker([dataPoint.lat, dataPoint.lon], {
            radius: radius,
            fillColor: color,
            color: '#fff',
            weight: dataPoint.isNew() ? 3 : 1,
            opacity: dataPoint.isNew() ? 1 : 0.8,
            fillOpacity: dataPoint.isNew() ? 0.9 : 0.6
        });
        
        const ageText = dataPoint.isNew() ? ' 🆕 VERY RECENT!' : (dataPoint.isRecent() ? ' ⏰ Recent' : '');
        const time = new Date(dataPoint.timestamp).toLocaleString();
        const metadata = dataPoint.metadata as any;
        
        circle.bindPopup(`
            <strong>${dataPoint.emoji} ${dataPoint.title}${ageText}</strong><br>
            Location: ${dataPoint.description}<br>
            Depth: ${metadata.depth}km<br>
            Time: ${time}<br>
            Age: ${formatAge(dataPoint.getAge())}
        `);
        
        return circle;
    }

    /**
     * Create ISS marker
     */
    private createISSMarker(dataPoint: DataPoint): L.Marker {
        const issIcon = L.divIcon({
            className: 'iss-marker',
            html: `<div style="
                font-size: 24px;
                text-shadow: 0 0 10px rgba(168, 85, 247, 0.8);
                animation: rotate 4s linear infinite;
            ">${dataPoint.emoji}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
        
        const marker = L.marker([dataPoint.lat, dataPoint.lon], { icon: issIcon });
        
        marker.bindPopup(`
            <strong>${dataPoint.emoji} ${dataPoint.title}</strong><br>
            ${dataPoint.description}<br>
            Position: ${dataPoint.lat.toFixed(2)}°, ${dataPoint.lon.toFixed(2)}°
        `);
        
        return marker;
    }

    /**
     * Create volcano marker
     */
    private createVolcanoMarker(dataPoint: DataPoint): L.Marker {
        const metadata = dataPoint.metadata as any;
        const baseRadius = getVolcanicSize(metadata.alertLevel);
        const color = getVolcanicAlertColor(metadata.alertLevel);
        
        const volcanoIcon = L.divIcon({
            className: 'volcano-marker',
            html: `<div style="
                width: 0;
                height: 0;
                border-left: ${baseRadius}px solid transparent;
                border-right: ${baseRadius}px solid transparent;
                border-bottom: ${baseRadius * 1.5}px solid ${color};
                filter: drop-shadow(0 0 3px ${color});
            "></div>`,
            iconSize: [baseRadius * 2, baseRadius * 2],
            iconAnchor: [baseRadius, baseRadius * 1.5]
        });
        
        const marker = L.marker([dataPoint.lat, dataPoint.lon], { icon: volcanoIcon });
        
        const lastEruptionDate = new Date(metadata.lastEruption).toLocaleDateString();
        const ageText = dataPoint.isNew() ? ' 🆕 VERY RECENT!' : '';
        
        marker.bindPopup(`
            <strong>${dataPoint.emoji} ${dataPoint.title}${ageText}</strong><br>
            ${dataPoint.description}<br>
            Elevation: ${metadata.elevation}m<br>
            Last Eruption: ${lastEruptionDate}<br>
            Activity: ${formatAge(dataPoint.getAge())}
        `);
        
        return marker;
    }

    /**
     * Create hurricane marker
     */
    private createHurricaneMarker(dataPoint: DataPoint): L.Marker {
        const metadata = dataPoint.metadata as any;
        const size = getHurricaneSize(metadata.category) * 2; // Make it bigger for visibility
        const color = getHurricaneColor(metadata.category);
        
        // Create a spinning hurricane icon marker instead of a circle
        const hurricaneIcon = L.divIcon({
            className: 'hurricane-marker',
            html: `<div style="
                font-size: ${size}px;
                color: ${color};
                text-shadow: 0 0 8px rgba(0,0,0,0.8), 0 0 15px ${color};
                animation: spin 3s linear infinite;
                filter: drop-shadow(0 0 5px ${color});
                display: flex;
                align-items: center;
                justify-content: center;
            ">${dataPoint.emoji}</div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
        });
        
        const marker = L.marker([dataPoint.lat, dataPoint.lon], { icon: hurricaneIcon });
        
        const ageText = dataPoint.isNew() ? ' 🆕 VERY RECENT!' : '';
        
        marker.bindPopup(`
            <strong>${dataPoint.emoji} ${dataPoint.title}${ageText}</strong><br>
            ${dataPoint.description}<br>
            Pressure: ${metadata.pressure}mb<br>
            Direction: ${metadata.direction}
        `);
        
        return marker;
    }

    /**
     * Create tornado marker
     */
    private createTornadoMarker(dataPoint: DataPoint): L.Marker {
        const metadata = dataPoint.metadata as any;
        const size = getTornadoSize(metadata.intensity);
        const color = getTornadoColor(metadata.intensity);
        
        const tornadoIcon = L.divIcon({
            className: 'tornado-marker',
            html: `<div style="
                font-size: ${size}px;
                color: ${color};
                text-shadow: 0 0 5px rgba(0,0,0,0.5);
                animation: spin 2s linear infinite;
            ">${dataPoint.emoji}</div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
        });
        
        const marker = L.marker([dataPoint.lat, dataPoint.lon], { icon: tornadoIcon });
        
        marker.bindPopup(`
            <strong>${dataPoint.emoji} ${dataPoint.title}</strong><br>
            Location: ${dataPoint.description}
        `);
        
        return marker;
    }

    /**
     * Create aurora marker
     */
    private createAuroraMarker(dataPoint: DataPoint): L.CircleMarker {
        const metadata = dataPoint.metadata as any;
        const size = getAuroraSize(metadata.kpIndex);
        const color = getAuroraColor(metadata.kpIndex);
        
        const circle = L.circleMarker([dataPoint.lat, dataPoint.lon], {
            radius: size,
            fillColor: color,
            color: '#fff',
            weight: 1,
            opacity: 0.7,
            fillOpacity: 0.5
        });
        
        circle.bindPopup(`
            <strong>${dataPoint.emoji} ${dataPoint.title}</strong><br>
            ${dataPoint.description}<br>
            Visibility: ${metadata.visibility}
        `);
        
        return circle;
    }

    /**
     * Create wind marker
     */
    private createWindMarker(dataPoint: DataPoint): L.Marker | null {
        const metadata = dataPoint.metadata as any;
        
        // Skip very low wind speeds to avoid cluttering the map
        if (metadata.speed < 5) {
            return null;
        }
        
        const color = getWindColor(metadata.speed);
        const rotation = metadata.direction;
        
        // Very lightweight: small, transparent arrow
        const windIcon = L.divIcon({
            className: 'wind-marker',
            html: `<div style="
                font-size: 10px;
                color: ${color};
                opacity: 0.35;
                transform: rotate(${rotation}deg);
                text-shadow: 0 0 2px rgba(0,0,0,0.3);
                pointer-events: auto;
            ">➤</div>`,
            iconSize: [10, 10],
            iconAnchor: [5, 5]
        });
        
        const marker = L.marker([dataPoint.lat, dataPoint.lon], { icon: windIcon });
        
        marker.bindPopup(`
            <strong>${dataPoint.emoji} ${dataPoint.title}</strong><br>
            ${dataPoint.description}
        `);
        
        return marker;
    }

    /**
     * Create precipitation marker
     */
    private createPrecipitationMarker(dataPoint: DataPoint): L.CircleMarker {
        const metadata = dataPoint.metadata as any;
        const color = getPrecipitationColor(metadata.intensity);
        
        const circle = L.circleMarker([dataPoint.lat, dataPoint.lon], {
            radius: 8,
            fillColor: color,
            color: '#fff',
            weight: 1,
            opacity: 0.7,
            fillOpacity: 0.5
        });
        
        circle.bindPopup(`
            <strong>${dataPoint.emoji} ${dataPoint.title}</strong><br>
            ${dataPoint.description}<br>
            Accumulation: ${metadata.accumulation.toFixed(1)}mm
        `);
        
        return circle;
    }

    /**
     * Create rocket launch marker
     */
    private createRocketMarker(dataPoint: DataPoint): L.Marker {
        const rocketIcon = L.divIcon({
            className: 'rocket-marker',
            html: `<div style="
                font-size: 24px;
                text-shadow: 0 0 5px rgba(255,255,255,0.5);
            ">${dataPoint.emoji}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
        
        const marker = L.marker([dataPoint.lat, dataPoint.lon], { icon: rocketIcon });
        
        const metadata = dataPoint.metadata as any;
        const launchTime = new Date(metadata.launchTime).toLocaleString();
        
        marker.bindPopup(`
            <strong>${dataPoint.emoji} ${dataPoint.title}</strong><br>
            ${dataPoint.description}<br>
            Launch Time: ${launchTime}<br>
            Status: ${metadata.status}
        `);
        
        return marker;
    }

    /**
     * Create conflict marker
     */
    private createConflictMarker(dataPoint: DataPoint): L.CircleMarker {
        const metadata = dataPoint.metadata as any;
        const color = getConflictColor(metadata.intensity);
        
        const circle = L.circleMarker([dataPoint.lat, dataPoint.lon], {
            radius: 12,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 0.9,
            fillOpacity: 0.6
        });
        
        circle.bindPopup(`
            <strong>${dataPoint.emoji} ${dataPoint.title}</strong><br>
            ${dataPoint.description}<br>
            Recent Incidents: ${metadata.recentIncidents}
        `);
        
        return circle;
    }

    /**
     * Create protest marker
     */
    private createProtestMarker(dataPoint: DataPoint): L.Marker {
        const metadata = dataPoint.metadata as any;
        const color = getProtestColor(metadata.size);
        
        const protestIcon = L.divIcon({
            className: 'protest-marker',
            html: `<div style="
                font-size: 20px;
                color: ${color};
                text-shadow: 0 0 5px rgba(0,0,0,0.5);
            ">${dataPoint.emoji}</div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
        
        const marker = L.marker([dataPoint.lat, dataPoint.lon], { icon: protestIcon });
        
        marker.bindPopup(`
            <strong>${dataPoint.emoji} ${dataPoint.title}</strong><br>
            ${dataPoint.description}<br>
            Duration: ${metadata.duration}h<br>
            Status: ${metadata.status}
        `);
        
        return marker;
    }

    /**
     * Create social unrest marker
     */
    private createUnrestMarker(dataPoint: DataPoint): L.CircleMarker {
        const metadata = dataPoint.metadata as any;
        const color = getUnrestColor(metadata.severity);
        
        const circle = L.circleMarker([dataPoint.lat, dataPoint.lon], {
            radius: 10,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.5
        });
        
        circle.bindPopup(`
            <strong>${dataPoint.emoji} ${dataPoint.title}</strong><br>
            ${dataPoint.description}<br>
            Affected: ${metadata.affectedPopulation.toLocaleString()} people
        `);
        
        return circle;
    }

    /**
     * Create disease outbreak marker
     */
    private createDiseaseMarker(dataPoint: DataPoint): L.CircleMarker {
        const metadata = dataPoint.metadata as any;
        const color = getDiseaseColor(metadata.severity);
        
        const circle = L.circleMarker([dataPoint.lat, dataPoint.lon], {
            radius: 12,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 0.9,
            fillOpacity: 0.7
        });
        
        circle.bindPopup(`
            <strong>${dataPoint.emoji} ${dataPoint.title}</strong><br>
            ${dataPoint.description}<br>
            Status: ${metadata.status}
        `);
        
        return circle;
    }

    /**
     * Animate a new marker
     */
    private animateNewMarker(_dataPoint: DataPoint, marker: L.Marker | L.CircleMarker): void {
        if (marker instanceof L.CircleMarker) {
            animateCircleBounce(marker, marker.options.radius || 10);
        }
    }

    /**
     * Log event to event log
     */
    private logEvent(dataPoint: DataPoint, isNew: boolean): void {
        if (!this.addEventCallback) return;
        if (dataPoint.severity < this.severityThreshold) return;
        
        this.addEventCallback(
            isNew ? 'new-' + dataPoint.type : 'update-' + dataPoint.type,
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
     * Clear all markers and streamlines
     */
    clear(): void {
        this.markers.forEach((value) => {
            const marker = value.marker as any;
            if (marker._pulseInterval) {
                clearInterval(marker._pulseInterval);
            }
            if (marker._pulseCircle) {
                if (marker._pulseCircle._pulseInterval) {
                    clearInterval(marker._pulseCircle._pulseInterval);
                }
                if (this.map.hasLayer(marker._pulseCircle)) {
                    this.map.removeLayer(marker._pulseCircle);
                }
            }
            this.map.removeLayer(value.marker);
        });
        this.markers.clear();
        this.loggedEventIds.clear();
        
        // Clear streamlines
        this.streamlines.forEach(line => {
            if (this.map.hasLayer(line)) {
                this.map.removeLayer(line);
            }
        });
        this.streamlines = [];
        this.windGridData = [];
    }

    /**
     * Render wind streamlines instead of individual markers
     * This creates flowing curves that visualize wind patterns
     */
    renderWindStreamlines(windData: RawWind[], setLoadingMessage?: (msg: string) => void): void {
        // Clear existing streamlines
        this.streamlines.forEach(line => {
            if (this.map.hasLayer(line)) {
                this.map.removeLayer(line);
            }
        });
        this.streamlines = [];
        
        // Store wind grid data for interpolation
        this.windGridData = windData;
        
        if (windData.length === 0) {
            console.log('No wind data available for streamlines');
            return;
        }
        
        if (setLoadingMessage) {
            setLoadingMessage('Generating wind streamlines...');
        }
        
        console.log(`🌬️ Generating streamlines from ${windData.length} grid points...`);
        
        // Generate seed points (more sparse than the grid to avoid overcrowding)
        const seedPoints = generateSeedPoints(30, 8); // 30° spacing with 8° jitter
        
        let streamlineCount = 0;
        
        // Trace streamlines from each seed point
        for (const seed of seedPoints) {
            const streamline = traceStreamline(
                seed.lat,
                seed.lon,
                windData,
                40,   // max steps
                2.5   // step size in degrees
            );
            
            if (streamline && streamline.points.length >= 8) {
                // Convert streamline points to Leaflet lat/lng array
                const latLngs: L.LatLngExpression[] = streamline.points.map(p => [p.lat, p.lon]);
                
                // Create polyline with color based on average speed
                const color = getStreamlineColor(streamline.avgSpeed);
                const opacity = getWindOpacity(streamline.avgSpeed);
                const weight = Math.min(2 + streamline.avgSpeed / 20, 4); // Thicker for stronger winds
                
                const polyline = L.polyline(latLngs, {
                    color: color,
                    opacity: opacity,
                    weight: weight,
                    smoothFactor: 2.0, // Smooth the line
                    className: 'wind-streamline'
                });
                
                // Add popup with wind info
                const midPoint = streamline.points[Math.floor(streamline.points.length / 2)];
                polyline.bindPopup(`
                    <strong>🌬️ Wind Flow</strong><br>
                    Avg Speed: ${Math.round(streamline.avgSpeed)} mph<br>
                    Coordinates: ${midPoint.lat.toFixed(1)}°, ${midPoint.lon.toFixed(1)}°
                `);
                
                polyline.addTo(this.map);
                this.streamlines.push(polyline);
                streamlineCount++;
            }
        }
        
        console.log(`✅ Rendered ${streamlineCount} wind streamlines`);
        
        if (setLoadingMessage) {
            setLoadingMessage('');
        }
    }

    /**
     * Get marker by ID
     */
    getMarker(id: string): MarkerEntry | undefined {
        return this.markers.get(id);
    }

    /**
     * Get all markers
     */
    getAllMarkers(): MarkerEntry[] {
        return Array.from(this.markers.values());
    }

    /**
     * Open popup for a specific marker
     */
    openPopupForMarker(id: string): void {
        const entry = this.markers.get(id);
        if (entry && entry.marker) {
            entry.marker.openPopup();
        }
    }

    /**
     * Update addEvent callback
     */
    updateAddEvent(callback: AddEventCallback | null): void {
        this.addEventCallback = callback;
    }
}

