/**
 * DataPoint - Unified data model for all event types
 * 
 * Represents a single event/data point on the map with standardized fields
 * for consistent processing across all data sources.
 */

export const DataSourceType = {
    EARTHQUAKE: 'earthquake',
    ISS: 'iss',
    VOLCANO: 'volcano',
    HURRICANE: 'hurricane',
    TORNADO: 'tornado',
    AURORA: 'aurora',
    WIND: 'wind',
    PRECIPITATION: 'precipitation',
    ROCKET: 'rocket',
    CONFLICT: 'conflict',
    PROTEST: 'protest',
    UNREST: 'unrest',
    DISEASE: 'disease'
};

export const DataSourcePrefix = {
    [DataSourceType.EARTHQUAKE]: 'eqk',
    [DataSourceType.ISS]: 'iss',
    [DataSourceType.VOLCANO]: 'vol',
    [DataSourceType.HURRICANE]: 'hur',
    [DataSourceType.TORNADO]: 'tor',
    [DataSourceType.AURORA]: 'aur',
    [DataSourceType.WIND]: 'wnd',
    [DataSourceType.PRECIPITATION]: 'prc',
    [DataSourceType.ROCKET]: 'rkt',
    [DataSourceType.CONFLICT]: 'cfl',
    [DataSourceType.PROTEST]: 'prt',
    [DataSourceType.UNREST]: 'unr',
    [DataSourceType.DISEASE]: 'dis'
};

export class DataPoint {
    /**
     * Create a new DataPoint
     * @param {string} id - Unique identifier with prefix (e.g., "eqk-us6000m9z1")
     * @param {string} type - Type of event (from DataSourceType)
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @param {string} title - Display title
     * @param {string} description - Detailed description
     * @param {number} severity - Severity level (1-4)
     * @param {number} timestamp - Event timestamp (unix time)
     * @param {string} emoji - Emoji for display
     * @param {object} metadata - Type-specific additional data
     * @param {number} lastUpdated - When this data was last updated (unix time)
     */
    constructor(id, type, lat, lon, title, description, severity, timestamp, emoji, metadata = {}, lastUpdated = Date.now()) {
        this.id = id;
        this.type = type;
        this.lat = lat;
        this.lon = lon;
        this.title = title;
        this.description = description;
        this.severity = severity;
        this.timestamp = timestamp;
        this.emoji = emoji;
        this.metadata = metadata;
        this.lastUpdated = lastUpdated;
    }

    /**
     * Check if this DataPoint has changed compared to another
     * @param {DataPoint} other 
     * @returns {boolean}
     */
    hasChanged(other) {
        if (!other) return true;
        
        return this.lat !== other.lat ||
               this.lon !== other.lon ||
               this.title !== other.title ||
               this.description !== other.description ||
               this.severity !== other.severity ||
               JSON.stringify(this.metadata) !== JSON.stringify(other.metadata);
    }

    /**
     * Check if this is a new data point (within last 10 minutes)
     * @returns {boolean}
     */
    isNew() {
        const now = Date.now();
        return (now - this.timestamp) < 600000;
    }

    /**
     * Check if this data point is recent (within last hour)
     * @returns {boolean}
     */
    isRecent() {
        const now = Date.now();
        return (now - this.timestamp) < 3600000;
    }

    /**
     * Get age in milliseconds
     * @returns {number}
     */
    getAge() {
        return Date.now() - this.timestamp;
    }

    /**
     * Convert to plain object for serialization
     * @returns {object}
     */
    toObject() {
        return {
            id: this.id,
            type: this.type,
            lat: this.lat,
            lon: this.lon,
            title: this.title,
            description: this.description,
            severity: this.severity,
            timestamp: this.timestamp,
            emoji: this.emoji,
            metadata: this.metadata,
            lastUpdated: this.lastUpdated
        };
    }

    /**
     * Create DataPoint from plain object
     * @param {object} obj 
     * @returns {DataPoint}
     */
    static fromObject(obj) {
        return new DataPoint(
            obj.id,
            obj.type,
            obj.lat,
            obj.lon,
            obj.title,
            obj.description,
            obj.severity,
            obj.timestamp,
            obj.emoji,
            obj.metadata,
            obj.lastUpdated
        );
    }
}

