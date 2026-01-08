export function formatAge(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 1) return 'Just now!';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
}

export function getMagnitudeColor(mag) {
    if (mag >= 6) return '#ff0000';
    if (mag >= 5) return '#ff6600';
    if (mag >= 4) return '#ff9900';
    if (mag >= 3) return '#ffcc00';
    return '#ffff00';
}

export function getMagnitudeRadius(mag) {
    return Math.max(3, mag * 3);
}

export function getVolcanicAlertColor(alertLevel) {
    switch(alertLevel) {
        case 'warning': return '#ff0000';
        case 'watch': return '#ff6600';
        case 'advisory': return '#ffcc00';
        case 'normal': return '#888888';
        default: return '#888888';
    }
}

export function getVolcanicSize(alertLevel) {
    switch(alertLevel) {
        case 'warning': return 12;
        case 'watch': return 10;
        case 'advisory': return 8;
        case 'normal': return 6;
        default: return 6;
    }
}

export function getHurricaneColor(category) {
    if (category >= 5) return '#8b0000';
    if (category >= 4) return '#ff0000';
    if (category >= 3) return '#ff6600';
    if (category >= 2) return '#ff9900';
    if (category >= 1) return '#ffcc00';
    return '#ffff00';
}

export function getTornadoColor(intensity) {
    if (intensity >= 4) return '#8b0000';
    if (intensity >= 3) return '#ff0000';
    if (intensity >= 2) return '#ff6600';
    if (intensity >= 1) return '#ffcc00';
    return '#ffff00';
}

export function getTornadoSize(intensity) {
    return Math.max(6, intensity * 2 + 4);
}

export function getAuroraColor(kpIndex) {
    if (kpIndex >= 7) return '#00ffff';
    if (kpIndex >= 5) return '#00ff88';
    if (kpIndex >= 3) return '#88ff00';
    return '#aaffaa';
}

export function getWindColor(speed) {
    if (speed >= 30) return '#ff0000';
    if (speed >= 20) return '#ff6600';
    if (speed >= 15) return '#ffcc00';
    return '#ffff00';
}

export function getDiseaseColor(severity) {
    if (severity === 'high') return '#ff0000';
    if (severity === 'moderate') return '#ff9900';
    return '#ffcc00';
}

