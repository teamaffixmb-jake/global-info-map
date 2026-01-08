/**
 * Streamline generation for wind flow visualization
 * Creates smooth, flowing curves that follow wind vector fields
 */

import { RawWind } from '../types/raw';

export interface StreamlinePoint {
    lat: number;
    lon: number;
    speed: number;
}

export interface Streamline {
    points: StreamlinePoint[];
    avgSpeed: number;
}

/**
 * Interpolate wind vector at any lat/lon using inverse distance weighting
 * from nearby grid points
 */
export function interpolateWind(
    lat: number,
    lon: number,
    windData: RawWind[]
): { direction: number; speed: number } | null {
    if (windData.length === 0) {
        return null;
    }

    // Find nearby wind data points for interpolation
    const nearbyPoints = windData.map(point => {
        // Calculate distance (simple euclidean for now - good enough for sparse grid)
        const dLat = lat - point.lat;
        const dLon = lon - point.lon;
        const distance = Math.sqrt(dLat * dLat + dLon * dLon);
        
        return { point, distance };
    })
    .filter(p => p.distance < 30) // Only consider points within 30 degrees
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 4); // Use up to 4 nearest neighbors

    if (nearbyPoints.length === 0) {
        return null;
    }

    // Inverse distance weighting
    let totalWeight = 0;
    let weightedDirX = 0;
    let weightedDirY = 0;
    let weightedSpeed = 0;

    for (const { point, distance } of nearbyPoints) {
        // Avoid division by zero - if we're exactly on a point, use it directly
        const weight = distance < 0.01 ? 1000 : 1 / (distance * distance);
        totalWeight += weight;

        // Convert meteorological direction (from) to mathematical angle (to)
        // Meteorological: 0° = from North, 90° = from East
        // We want: direction the wind is GOING TO (opposite)
        const mathAngle = ((point.direction + 180) % 360) * Math.PI / 180;
        
        weightedDirX += Math.sin(mathAngle) * weight;
        weightedDirY += Math.cos(mathAngle) * weight;
        weightedSpeed += point.speed * weight;
    }

    const avgDirX = weightedDirX / totalWeight;
    const avgDirY = weightedDirY / totalWeight;
    const avgSpeed = weightedSpeed / totalWeight;

    // Convert back to degrees
    const direction = (Math.atan2(avgDirX, avgDirY) * 180 / Math.PI + 360) % 360;

    return { direction, speed: avgSpeed };
}

/**
 * Trace a streamline starting from a seed point
 * Uses RK2 (Runge-Kutta 2nd order) for smoother integration
 */
export function traceStreamline(
    seedLat: number,
    seedLon: number,
    windData: RawWind[],
    maxSteps: number = 50,
    stepSize: number = 2.0
): Streamline | null {
    const points: StreamlinePoint[] = [];
    let lat = seedLat;
    let lon = seedLon;
    let totalSpeed = 0;

    for (let i = 0; i < maxSteps; i++) {
        const wind = interpolateWind(lat, lon, windData);
        
        if (!wind || wind.speed < 3) {
            // Stop if no data or wind too weak
            break;
        }

        // Record this point
        points.push({ lat, lon, speed: wind.speed });
        totalSpeed += wind.speed;

        // RK2 integration for smoother curves
        // Step 1: Evaluate at current position
        const dir1 = wind.direction * Math.PI / 180;
        const dLat1 = Math.cos(dir1) * stepSize / wind.speed * 5;
        const dLon1 = Math.sin(dir1) * stepSize / wind.speed * 5;

        // Step 2: Evaluate at midpoint
        const midLat = lat + dLat1 / 2;
        const midLon = lon + dLon1 / 2;
        const midWind = interpolateWind(midLat, midLon, windData);
        
        if (!midWind) {
            break;
        }

        const dir2 = midWind.direction * Math.PI / 180;
        const dLat2 = Math.cos(dir2) * stepSize / midWind.speed * 5;
        const dLon2 = Math.sin(dir2) * stepSize / midWind.speed * 5;

        // Update position using midpoint derivative
        lat += dLat2;
        lon += dLon2;

        // Wrap longitude
        if (lon > 180) lon -= 360;
        if (lon < -180) lon += 360;

        // Stop if we go out of reasonable bounds
        if (lat > 85 || lat < -85) {
            break;
        }

        // Stop if streamline is too short to be useful
        if (i < 5 && wind.speed < 5) {
            break;
        }
    }

    // Only return streamlines with enough points to be visible
    if (points.length < 5) {
        return null;
    }

    return {
        points,
        avgSpeed: totalSpeed / points.length
    };
}

/**
 * Generate seed points for streamlines
 * Uses evenly spaced grid with some randomization for natural look
 */
export function generateSeedPoints(
    spacing: number = 25,
    jitter: number = 5
): Array<{ lat: number; lon: number }> {
    const seeds: Array<{ lat: number; lon: number }> = [];
    
    for (let lat = -70; lat <= 70; lat += spacing) {
        for (let lon = -180; lon < 180; lon += spacing) {
            // Add some jitter for more natural distribution
            const jitterLat = (Math.random() - 0.5) * jitter;
            const jitterLon = (Math.random() - 0.5) * jitter;
            
            seeds.push({
                lat: lat + jitterLat,
                lon: lon + jitterLon
            });
        }
    }
    
    return seeds;
}

/**
 * Get color for wind speed (green → purple gradient)
 */
export function getWindColor(speed: number): string {
    // Speed range: 5-60 mph (filtered <5, max realistically ~60)
    const normalized = Math.min(Math.max((speed - 5) / 55, 0), 1);
    
    // Green (low) to Purple (high)
    const r = Math.round(34 + normalized * (147 - 34));    // 34 → 147
    const g = Math.round(197 - normalized * (197 - 51));   // 197 → 51
    const b = Math.round(94 + normalized * (235 - 94));    // 94 → 235
    
    return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Get opacity based on wind speed
 */
export function getWindOpacity(speed: number): number {
    // Stronger winds = more visible
    const normalized = Math.min(Math.max((speed - 5) / 55, 0), 1);
    return 0.4 + normalized * 0.4; // 0.4 to 0.8
}

