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

