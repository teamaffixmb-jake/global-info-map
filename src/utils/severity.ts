/**
 * Event Severity System
 * 
 * This module provides a severity classification system for all event types
 * in the global data screensaver. Events are assigned severity levels based
 * on their characteristics (magnitude, intensity, size, etc.).
 * 
 * The Event Log can be filtered to only show events meeting a minimum severity
 * threshold, reducing noise and highlighting important events.
 * 
 * Severity Levels:
 * - LOW (1): Minor events, informational
 * - MEDIUM (2): Moderate events, worth noting
 * - HIGH (3): Significant events, important
 * - CRITICAL (4): Major events, urgent attention required
 */

export enum SEVERITY {
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3,
    CRITICAL = 4
}

export const SEVERITY_LABELS: Record<number, string> = {
    1: 'Low',
    2: 'Medium',
    3: 'High',
    4: 'Critical'
};

/**
 * Calculate severity for earthquake events
 * Based on magnitude scale
 */
export function getEarthquakeSeverity(magnitude: number): SEVERITY {
    if (magnitude >= 6.0) return SEVERITY.CRITICAL;
    if (magnitude >= 5.0) return SEVERITY.HIGH;
    if (magnitude >= 4.0) return SEVERITY.MEDIUM;
    return SEVERITY.LOW;
}

/**
 * Calculate severity for volcanic activity
 * Based on alert level
 */
export function getVolcanicSeverity(alertLevel: string): SEVERITY {
    const level = alertLevel.toLowerCase();
    if (level === 'warning') return SEVERITY.CRITICAL;
    if (level === 'watch') return SEVERITY.HIGH;
    if (level === 'advisory') return SEVERITY.MEDIUM;
    return SEVERITY.LOW;
}

/**
 * Calculate severity for hurricanes
 * Based on Saffir-Simpson category
 */
export function getHurricaneSeverity(category: number): SEVERITY {
    if (category >= 5) return SEVERITY.CRITICAL;
    if (category >= 3) return SEVERITY.HIGH;
    if (category >= 1) return SEVERITY.MEDIUM;
    return SEVERITY.LOW;
}

/**
 * Calculate severity for tornadoes
 * Based on Enhanced Fujita scale
 */
export function getTornadoSeverity(intensity: number): SEVERITY {
    if (intensity >= 4) return SEVERITY.CRITICAL;
    if (intensity >= 3) return SEVERITY.HIGH;
    if (intensity >= 2) return SEVERITY.MEDIUM;
    return SEVERITY.LOW;
}

/**
 * Calculate severity for aurora activity
 * Based on KP index (1-9)
 */
export function getAuroraSeverity(kpIndex: number): SEVERITY {
    if (kpIndex >= 7) return SEVERITY.HIGH;
    if (kpIndex >= 5) return SEVERITY.MEDIUM;
    return SEVERITY.LOW;
}

/**
 * Calculate severity for rocket launches
 * All launches are medium severity
 */
export function getRocketLaunchSeverity(): SEVERITY {
    return SEVERITY.MEDIUM;
}

/**
 * Calculate severity for conflicts
 * Based on intensity level
 */
export function getConflictSeverity(intensity: string): SEVERITY {
    const level = intensity.toLowerCase();
    if (level === 'high') return SEVERITY.CRITICAL;
    if (level === 'medium') return SEVERITY.HIGH;
    return SEVERITY.MEDIUM;
}

/**
 * Calculate severity for protests
 * Based on size
 */
export function getProtestSeverity(size: number): SEVERITY {
    if (size >= 50000) return SEVERITY.HIGH;
    if (size >= 10000) return SEVERITY.MEDIUM;
    return SEVERITY.LOW;
}

/**
 * Calculate severity for social unrest
 * Based on severity field
 */
export function getSocialUnrestSeverity(severity: string): SEVERITY {
    const level = severity.toLowerCase();
    if (level === 'high') return SEVERITY.HIGH;
    if (level === 'medium') return SEVERITY.MEDIUM;
    return SEVERITY.LOW;
}

/**
 * Calculate severity for disease outbreaks
 * Based on severity field and case count
 */
export function getDiseaseSeverity(severity: string, cases: number): SEVERITY {
    const level = severity.toLowerCase();
    let baseSeverity = SEVERITY.LOW;
    
    if (level === 'high') baseSeverity = SEVERITY.HIGH;
    else if (level === 'moderate') baseSeverity = SEVERITY.MEDIUM;
    
    // Upgrade severity if case count is very high
    if (cases >= 5000) return SEVERITY.CRITICAL;
    if (cases >= 2000 && baseSeverity < SEVERITY.HIGH) return SEVERITY.HIGH;
    
    return baseSeverity;
}

/**
 * Calculate severity for ISS updates
 * All ISS updates are low severity
 */
export function getISSSeverity(): SEVERITY {
    return SEVERITY.LOW;
}

/**
 * Calculate severity for wind patterns
 * Based on wind speed
 */
export function getWindSeverity(speed: number): SEVERITY {
    if (speed >= 40) return SEVERITY.HIGH;
    if (speed >= 30) return SEVERITY.MEDIUM;
    return SEVERITY.LOW;
}

/**
 * Calculate severity for precipitation
 * Based on intensity
 */
export function getPrecipitationSeverity(intensity: number): SEVERITY {
    if (intensity >= 30) return SEVERITY.HIGH;
    if (intensity >= 20) return SEVERITY.MEDIUM;
    return SEVERITY.LOW;
}


