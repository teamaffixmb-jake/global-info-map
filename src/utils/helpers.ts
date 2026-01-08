/**
 * Helper functions for formatting, colors, and sizes
 */

export function formatAge(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 1) return 'Just now!';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
}

export function getMagnitudeColor(mag: number): string {
    if (mag >= 6) return '#ff0000';
    if (mag >= 5) return '#ff6600';
    if (mag >= 4) return '#ff9900';
    if (mag >= 3) return '#ffcc00';
    return '#ffff00';
}

export function getMagnitudeRadius(mag: number): number {
    return Math.max(3, mag * 3);
}

export function getVolcanicAlertColor(alertLevel: string): string {
    switch(alertLevel) {
        case 'warning': return '#ff0000';
        case 'watch': return '#ff6600';
        case 'advisory': return '#ffcc00';
        case 'normal': return '#888888';
        default: return '#888888';
    }
}

export function getVolcanicSize(alertLevel: string): number {
    switch(alertLevel) {
        case 'warning': return 12;
        case 'watch': return 10;
        case 'advisory': return 8;
        case 'normal': return 6;
        default: return 6;
    }
}

export function getHurricaneColor(category: number): string {
    if (category >= 5) return '#8b0000';
    if (category >= 4) return '#ff0000';
    if (category >= 3) return '#ff6600';
    if (category >= 2) return '#ff9900';
    if (category >= 1) return '#ffcc00';
    return '#ffff00';
}

export function getHurricaneSize(category: number): number {
    return Math.max(8, category * 3 + 5);
}

export function getTornadoColor(intensity: number): string {
    if (intensity >= 4) return '#8b0000';
    if (intensity >= 3) return '#ff0000';
    if (intensity >= 2) return '#ff6600';
    if (intensity >= 1) return '#ffcc00';
    return '#ffff00';
}

export function getTornadoSize(intensity: number): number {
    return Math.max(6, intensity * 2 + 4);
}

export function getAuroraColor(kpIndex: number): string {
    if (kpIndex >= 7) return '#00ffff';
    if (kpIndex >= 5) return '#00ff88';
    if (kpIndex >= 3) return '#88ff00';
    return '#aaffaa';
}

export function getAuroraSize(kpIndex: number): number {
    return Math.max(10, kpIndex * 2 + 5);
}

export function getWindColor(speed: number): string {
    if (speed >= 30) return '#ff0000';
    if (speed >= 20) return '#ff6600';
    if (speed >= 15) return '#ffcc00';
    return '#ffff00';
}

export function getPrecipitationColor(intensity: number): string {
    if (intensity >= 30) return '#0000ff';
    if (intensity >= 20) return '#0066ff';
    if (intensity >= 10) return '#00aaff';
    return '#00ddff';
}

export function getConflictColor(intensity: string): string {
    if (intensity === 'high') return '#ff0000';
    if (intensity === 'medium') return '#ff6600';
    return '#ff9900';
}

export function getProtestColor(size: number): string {
    if (size >= 50000) return '#ff0000';
    if (size >= 10000) return '#ff6600';
    return '#ffcc00';
}

export function getUnrestColor(severity: string): string {
    if (severity === 'high') return '#ff0000';
    if (severity === 'medium') return '#ff6600';
    return '#ff9900';
}

export function getDiseaseColor(severity: string): string {
    if (severity === 'high') return '#ff0000';
    if (severity === 'moderate') return '#ff9900';
    return '#ffcc00';
}


