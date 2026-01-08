/**
 * DataPoint - Unified data model for all event types
 * 
 * Represents a single event/data point on the map with standardized fields
 * for consistent processing across all data sources.
 */

// ===== Enums and Constants =====

export enum DataSourceType {
    EARTHQUAKE = 'earthquake',
    ISS = 'iss',
    VOLCANO = 'volcano',
    HURRICANE = 'hurricane',
    TORNADO = 'tornado',
    AURORA = 'aurora',
    WIND = 'wind',
    PRECIPITATION = 'precipitation',
    ROCKET = 'rocket',
    CONFLICT = 'conflict',
    PROTEST = 'protest',
    UNREST = 'unrest',
    DISEASE = 'disease'
}

export const DataSourcePrefix: Record<DataSourceType, string> = {
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

// ===== Metadata Type Definitions =====

export interface EarthquakeMetadata {
    magnitude: number;
    depth: number;
    place: string;
    url?: string;
}

export interface ISSMetadata {
    altitude: number;
    velocity: number;
}

export interface VolcanoMetadata {
    elevation: number;
    country: string;
    alertLevel: string;
    lastEruption: number;
}

export interface HurricaneMetadata {
    category: number;
    windSpeed: number;
    pressure: number;
    direction: string;
}

export interface TornadoMetadata {
    intensity: number;
    location: string;
}

export interface AuroraMetadata {
    kpIndex: number;
    visibility: string;
    name: string;
}

export interface WindMetadata {
    speed: number;
    direction: number;
    gusts: number;
}

export interface PrecipitationMetadata {
    type: string;
    intensity: number;
    accumulation: number;
}

export interface RocketMetadata {
    site: string;
    country: string;
    rocketType: string;
    launchTime: number;
    status: string;
}

export interface ConflictMetadata {
    type: string;
    intensity: string;
    recentIncidents: number;
}

export interface ProtestMetadata {
    city: string;
    country: string;
    cause: string;
    size: number;
    duration: number;
    status: string;
}

export interface UnrestMetadata {
    location: string;
    country: string;
    severity: string;
    type: string;
    affectedPopulation: number;
}

export interface DiseaseMetadata {
    location: string;
    disease: string;
    cases: number;
    severity: string;
    status: string;
}

// Union of all metadata types
export type DataPointMetadata =
    | EarthquakeMetadata
    | ISSMetadata
    | VolcanoMetadata
    | HurricaneMetadata
    | TornadoMetadata
    | AuroraMetadata
    | WindMetadata
    | PrecipitationMetadata
    | RocketMetadata
    | ConflictMetadata
    | ProtestMetadata
    | UnrestMetadata
    | DiseaseMetadata;

// ===== DataPoint Class =====

export class DataPoint<T extends DataPointMetadata = DataPointMetadata> {
    id: string;
    type: DataSourceType;
    lat: number;
    lon: number;
    title: string;
    description: string;
    severity: number;
    timestamp: number;
    emoji: string;
    metadata: T;
    lastUpdated: number;

    /**
     * Create a new DataPoint
     */
    constructor(
        id: string,
        type: DataSourceType,
        lat: number,
        lon: number,
        title: string,
        description: string,
        severity: number,
        timestamp: number,
        emoji: string,
        metadata: T,
        lastUpdated: number = Date.now()
    ) {
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
     */
    hasChanged(other: DataPoint<T> | null | undefined): boolean {
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
     */
    isNew(): boolean {
        const now = Date.now();
        return (now - this.timestamp) < 600000;
    }

    /**
     * Check if this data point is recent (within last hour)
     */
    isRecent(): boolean {
        const now = Date.now();
        return (now - this.timestamp) < 3600000;
    }

    /**
     * Get age in milliseconds
     */
    getAge(): number {
        return Date.now() - this.timestamp;
    }

    /**
     * Convert to plain object for serialization
     */
    toObject(): Record<string, any> {
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
     */
    static fromObject<T extends DataPointMetadata>(obj: any): DataPoint<T> {
        return new DataPoint<T>(
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

