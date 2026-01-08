/**
 * MarkerManager - Unified pipeline for processing and rendering DataPoints
 * 
 * Handles:
 * 1. Adding new markers to the map
 * 2. Updating existing markers when data changes
 * 3. Removing markers that are no longer in the data
 * 4. Logging events based on severity threshold
 */

import L from 'leaflet';
import { DataSourceType } from '../models/DataPoint';
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
import { animateCircleBounce, animateCirclePulse } from './animations';
import { formatAge } from './helpers';

export class MarkerManager {
    constructor(map, addEventCallback, severityThreshold) {
        this.map = map;
        this.addEventCallback = addEventCallback;
        this.severityThreshold = severityThreshold;
        
        // Map of ID -> {marker, dataPoint}
        this.markers = new Map();
        
        // Track which IDs we've already logged to event log
        this.loggedEventIds = new Set();
    }

    /**
     * Update severity threshold
     */
    setSeverityThreshold(threshold) {
        this.severityThreshold = threshold;
    }

    /**
     * Process an array of DataPoints
     * @param {Array<DataPoint>} dataPoints 
     */
    processDataPoints(dataPoints) {
        const currentIds = new Set(dataPoints.map(dp => dp.id));
        
        // Update or add markers for current data points
        dataPoints.forEach(dataPoint => {
            this.processDataPoint(dataPoint);
        });
        
        // Remove markers that are no longer in the data
        const idsToRemove = [];
        this.markers.forEach((value, id) => {
            if (!currentIds.has(id)) {
                idsToRemove.push(id);
            }
        });
        
        idsToRemove.forEach(id => this.removeMarker(id));
    }

    /**
     * Process a single DataPoint
     * @param {DataPoint} dataPoint 
     */
    processDataPoint(dataPoint) {
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
     * @param {DataPoint} dataPoint 
     */
    addMarker(dataPoint) {
        const marker = this.createMarker(dataPoint);
        if (!marker) return;
        
        marker.addTo(this.map);
        marker._markerId = dataPoint.id;
        
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
     * @param {DataPoint} dataPoint 
     * @param {object} existing 
     */
    updateMarker(dataPoint, existing) {
        // Remove old marker
        this.map.removeLayer(existing.marker);
        
        // Create and add new marker
        const marker = this.createMarker(dataPoint);
        if (!marker) return;
        
        marker.addTo(this.map);
        marker._markerId = dataPoint.id;
        
        this.markers.set(dataPoint.id, { marker, dataPoint });
        
        // Log update to event log
        this.logEvent(dataPoint, false);
    }

    /**
     * Remove a marker from the map
     * @param {string} id 
     */
    removeMarker(id) {
        const existing = this.markers.get(id);
        if (existing) {
            // Clean up any pulse intervals
            if (existing.marker._pulseInterval) {
                clearInterval(existing.marker._pulseInterval);
            }
            if (existing.marker._pulseCircle) {
                if (existing.marker._pulseCircle._pulseInterval) {
                    clearInterval(existing.marker._pulseCircle._pulseInterval);
                }
                if (this.map.hasLayer(existing.marker._pulseCircle)) {
                    this.map.removeLayer(existing.marker._pulseCircle);
                }
            }
            
            this.map.removeLayer(existing.marker);
            this.markers.delete(id);
            this.loggedEventIds.delete(id);
        }
    }

    /**
     * Create a Leaflet marker based on DataPoint type
     * @param {DataPoint} dataPoint 
     * @returns {L.Marker|L.CircleMarker}
     */
    createMarker(dataPoint) {
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
    createEarthquakeMarker(dataPoint) {
        const mag = dataPoint.metadata.magnitude;
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
        
        circle.bindPopup(`
            <strong>${dataPoint.emoji} ${dataPoint.title}${ageText}</strong><br>
            Location: ${dataPoint.description}<br>
            Depth: ${dataPoint.metadata.depth}km<br>
            Time: ${time}<br>
            Age: ${formatAge(dataPoint.getAge())}
        `);
        
        return circle;
    }

    /**
     * Create ISS marker
     */
    createISSMarker(dataPoint) {
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
    createVolcanoMarker(dataPoint) {
        const baseRadius = getVolcanicSize(dataPoint.metadata.alertLevel);
        const color = getVolcanicAlertColor(dataPoint.metadata.alertLevel);
        
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
        
        const lastEruptionDate = new Date(dataPoint.metadata.lastEruption).toLocaleDateString();
        const ageText = dataPoint.isNew() ? ' 🆕 VERY RECENT!' : '';
        
        marker.bindPopup(`
            <strong>${dataPoint.emoji} ${dataPoint.title}${ageText}</strong><br>
            ${dataPoint.description}<br>
            Elevation: ${dataPoint.metadata.elevation}m<br>
            Last Eruption: ${lastEruptionDate}<br>
            Activity: ${formatAge(dataPoint.getAge())}
        `);
        
        return marker;
    }

    /**
     * Create hurricane marker
     */
    createHurricaneMarker(dataPoint) {
        const size = getHurricaneSize(dataPoint.metadata.category);
        const color = getHurricaneColor(dataPoint.metadata.category);
        
        const circle = L.circleMarker([dataPoint.lat, dataPoint.lon], {
            radius: size,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 0.9,
            fillOpacity: 0.7
        });
        
        circle.bindPopup(`
            <strong>${dataPoint.emoji} ${dataPoint.title}</strong><br>
            ${dataPoint.description}<br>
            Pressure: ${dataPoint.metadata.pressure}mb<br>
            Direction: ${dataPoint.metadata.direction}
        `);
        
        return circle;
    }

    /**
     * Create tornado marker
     */
    createTornadoMarker(dataPoint) {
        const size = getTornadoSize(dataPoint.metadata.intensity);
        const color = getTornadoColor(dataPoint.metadata.intensity);
        
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
    createAuroraMarker(dataPoint) {
        const size = getAuroraSize(dataPoint.metadata.kpIndex);
        const color = getAuroraColor(dataPoint.metadata.kpIndex);
        
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
            Visibility: ${dataPoint.metadata.visibility}
        `);
        
        return circle;
    }

    /**
     * Create wind marker
     */
    createWindMarker(dataPoint) {
        const color = getWindColor(dataPoint.metadata.speed);
        const rotation = dataPoint.metadata.direction;
        
        const windIcon = L.divIcon({
            className: 'wind-marker',
            html: `<div style="
                font-size: 20px;
                color: ${color};
                transform: rotate(${rotation}deg);
                text-shadow: 0 0 3px rgba(0,0,0,0.5);
            ">➤</div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
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
    createPrecipitationMarker(dataPoint) {
        const color = getPrecipitationColor(dataPoint.metadata.intensity);
        
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
            Accumulation: ${dataPoint.metadata.accumulation.toFixed(1)}mm
        `);
        
        return circle;
    }

    /**
     * Create rocket launch marker
     */
    createRocketMarker(dataPoint) {
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
        
        const launchTime = new Date(dataPoint.metadata.launchTime).toLocaleString();
        
        marker.bindPopup(`
            <strong>${dataPoint.emoji} ${dataPoint.title}</strong><br>
            ${dataPoint.description}<br>
            Launch Time: ${launchTime}<br>
            Status: ${dataPoint.metadata.status}
        `);
        
        return marker;
    }

    /**
     * Create conflict marker
     */
    createConflictMarker(dataPoint) {
        const color = getConflictColor(dataPoint.metadata.intensity);
        
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
            Recent Incidents: ${dataPoint.metadata.recentIncidents}
        `);
        
        return circle;
    }

    /**
     * Create protest marker
     */
    createProtestMarker(dataPoint) {
        const color = getProtestColor(dataPoint.metadata.size);
        
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
            Duration: ${dataPoint.metadata.duration}h<br>
            Status: ${dataPoint.metadata.status}
        `);
        
        return marker;
    }

    /**
     * Create social unrest marker
     */
    createUnrestMarker(dataPoint) {
        const color = getUnrestColor(dataPoint.metadata.severity);
        
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
            Affected: ${dataPoint.metadata.affectedPopulation.toLocaleString()} people
        `);
        
        return circle;
    }

    /**
     * Create disease outbreak marker
     */
    createDiseaseMarker(dataPoint) {
        const color = getDiseaseColor(dataPoint.metadata.severity);
        
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
            Status: ${dataPoint.metadata.status}
        `);
        
        return circle;
    }

    /**
     * Animate a new marker
     */
    animateNewMarker(dataPoint, marker) {
        if (marker instanceof L.CircleMarker) {
            animateCircleBounce(marker, marker.options.radius);
        }
    }

    /**
     * Log event to event log
     */
    logEvent(dataPoint, isNew) {
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
     * Clear all markers
     */
    clear() {
        this.markers.forEach((value) => {
            if (value.marker._pulseInterval) {
                clearInterval(value.marker._pulseInterval);
            }
            if (value.marker._pulseCircle) {
                if (value.marker._pulseCircle._pulseInterval) {
                    clearInterval(value.marker._pulseCircle._pulseInterval);
                }
                if (this.map.hasLayer(value.marker._pulseCircle)) {
                    this.map.removeLayer(value.marker._pulseCircle);
                }
            }
            this.map.removeLayer(value.marker);
        });
        this.markers.clear();
        this.loggedEventIds.clear();
    }

    /**
     * Get marker by ID
     */
    getMarker(id) {
        return this.markers.get(id);
    }

    /**
     * Get all markers
     */
    getAllMarkers() {
        return Array.from(this.markers.values());
    }
}

