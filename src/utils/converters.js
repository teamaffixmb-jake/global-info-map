/**
 * Converters - Transform raw API data into DataPoint objects
 */

import { DataPoint, DataSourceType, DataSourcePrefix } from '../models/DataPoint';
import {
    getEarthquakeSeverity,
    getVolcanicSeverity,
    getHurricaneSeverity,
    getTornadoSeverity,
    getAuroraSeverity,
    getWindSeverity,
    getPrecipitationSeverity,
    getRocketLaunchSeverity,
    getConflictSeverity,
    getProtestSeverity,
    getSocialUnrestSeverity,
    getDiseaseSeverity,
    getISSSeverity
} from './severity';

/**
 * Convert earthquake data to DataPoint
 * @param {object} eq - Raw earthquake data from USGS API
 * @returns {DataPoint}
 */
export function earthquakeToDataPoint(eq) {
    const [lon, lat] = eq.geometry.coordinates;
    const mag = eq.properties.mag;
    const place = eq.properties.place;
    const time = eq.properties.time;
    
    // Use real ID from API if available, otherwise generate one
    const uniqueId = eq.id || `${lat}-${lon}-${mag}-${time}`;
    const id = `${DataSourcePrefix[DataSourceType.EARTHQUAKE]}-${uniqueId}`;
    
    const severity = getEarthquakeSeverity(mag);
    
    return new DataPoint(
        id,
        DataSourceType.EARTHQUAKE,
        lat,
        lon,
        `M${mag} Earthquake`,
        place,
        severity,
        time,
        '🔴',
        {
            magnitude: mag,
            depth: eq.geometry.coordinates[2] || 0,
            place: place,
            url: eq.properties.url
        }
    );
}

/**
 * Convert ISS data to DataPoint
 * @param {object} iss - Raw ISS data
 * @returns {DataPoint}
 */
export function issToDataPoint(iss) {
    const id = 'iss'; // Only one ISS, so ID is just 'iss'
    const severity = getISSSeverity();
    
    return new DataPoint(
        id,
        DataSourceType.ISS,
        iss.lat,
        iss.lon,
        'International Space Station',
        `Altitude: ${Math.round(iss.altitude)}km, Velocity: ${Math.round(iss.velocity)}km/h`,
        severity,
        Date.now(),
        '🛰️',
        {
            altitude: iss.altitude,
            velocity: iss.velocity
        }
    );
}

/**
 * Convert volcano data to DataPoint
 * @param {object} volcano - Raw volcano data
 * @returns {DataPoint}
 */
export function volcanoToDataPoint(volcano) {
    const uniqueId = volcano.id || `${volcano.name.replace(/\s+/g, '-').toLowerCase()}`;
    const id = `${DataSourcePrefix[DataSourceType.VOLCANO]}-${uniqueId}`;
    
    const severity = getVolcanicSeverity(volcano.alertLevel);
    
    return new DataPoint(
        id,
        DataSourceType.VOLCANO,
        volcano.lat,
        volcano.lon,
        volcano.name,
        `${volcano.country}, Alert: ${volcano.alertLevel.toUpperCase()}`,
        severity,
        volcano.time || Date.now(),
        '🌋',
        {
            elevation: volcano.elevation,
            country: volcano.country,
            alertLevel: volcano.alertLevel,
            lastEruption: volcano.lastEruption
        }
    );
}

/**
 * Convert hurricane data to DataPoint
 * @param {object} hurricane - Raw hurricane data
 * @returns {DataPoint}
 */
export function hurricaneToDataPoint(hurricane) {
    const uniqueId = hurricane.id || `${hurricane.name.replace(/\s+/g, '-').toLowerCase()}`;
    const id = `${DataSourcePrefix[DataSourceType.HURRICANE]}-${uniqueId}`;
    
    const severity = getHurricaneSeverity(hurricane.category);
    
    return new DataPoint(
        id,
        DataSourceType.HURRICANE,
        hurricane.lat,
        hurricane.lon,
        hurricane.name,
        `Category ${hurricane.category}, Wind: ${hurricane.windSpeed}mph`,
        severity,
        hurricane.time || Date.now(),
        '🌀',
        {
            category: hurricane.category,
            windSpeed: hurricane.windSpeed,
            pressure: hurricane.pressure,
            direction: hurricane.direction
        }
    );
}

/**
 * Convert tornado data to DataPoint
 * @param {object} tornado - Raw tornado data
 * @returns {DataPoint}
 */
export function tornadoToDataPoint(tornado) {
    const uniqueId = tornado.id || `${tornado.location}-${tornado.time}`;
    const id = `${DataSourcePrefix[DataSourceType.TORNADO]}-${uniqueId}`;
    
    const severity = getTornadoSeverity(tornado.intensity);
    
    return new DataPoint(
        id,
        DataSourceType.TORNADO,
        tornado.lat,
        tornado.lon,
        `EF${tornado.intensity} Tornado`,
        tornado.location,
        severity,
        tornado.time || Date.now(),
        '🌪️',
        {
            intensity: tornado.intensity,
            location: tornado.location
        }
    );
}

/**
 * Convert aurora data to DataPoint
 * @param {object} aurora - Raw aurora data
 * @returns {DataPoint}
 */
export function auroraToDataPoint(aurora) {
    const uniqueId = aurora.id || `${aurora.name.replace(/\s+/g, '-').toLowerCase()}-${aurora.time}`;
    const id = `${DataSourcePrefix[DataSourceType.AURORA]}-${uniqueId}`;
    
    const severity = getAuroraSeverity(aurora.kpIndex);
    
    return new DataPoint(
        id,
        DataSourceType.AURORA,
        aurora.lat,
        aurora.lon,
        `Aurora - ${aurora.name}`,
        `KP Index: ${aurora.kpIndex}`,
        severity,
        aurora.time || Date.now(),
        '🌌',
        {
            kpIndex: aurora.kpIndex,
            visibility: aurora.visibility,
            name: aurora.name
        }
    );
}

/**
 * Convert wind pattern data to DataPoint
 * @param {object} wind - Raw wind data
 * @returns {DataPoint}
 */
export function windToDataPoint(wind) {
    const uniqueId = wind.id || `${wind.lat.toFixed(2)}-${wind.lon.toFixed(2)}`;
    const id = `${DataSourcePrefix[DataSourceType.WIND]}-${uniqueId}`;
    
    const severity = getWindSeverity(wind.speed);
    
    return new DataPoint(
        id,
        DataSourceType.WIND,
        wind.lat,
        wind.lon,
        `Wind ${wind.speed}mph`,
        `Direction: ${wind.direction}°, Gusts: ${Math.round(wind.gusts)}mph`,
        severity,
        wind.time || Date.now(),
        '💨',
        {
            speed: wind.speed,
            direction: wind.direction,
            gusts: wind.gusts
        }
    );
}

/**
 * Convert precipitation data to DataPoint
 * @param {object} precip - Raw precipitation data
 * @returns {DataPoint}
 */
export function precipitationToDataPoint(precip) {
    const uniqueId = precip.id || `${precip.lat.toFixed(2)}-${precip.lon.toFixed(2)}`;
    const id = `${DataSourcePrefix[DataSourceType.PRECIPITATION]}-${uniqueId}`;
    
    const severity = getPrecipitationSeverity(precip.intensity);
    const emoji = precip.type === 'snow' ? '❄️' : '🌧️';
    
    return new DataPoint(
        id,
        DataSourceType.PRECIPITATION,
        precip.lat,
        precip.lon,
        `${precip.type.charAt(0).toUpperCase() + precip.type.slice(1)}`,
        `Intensity: ${precip.intensity}mm/h`,
        severity,
        precip.time || Date.now(),
        emoji,
        {
            type: precip.type,
            intensity: precip.intensity,
            accumulation: precip.accumulation
        }
    );
}

/**
 * Convert rocket launch data to DataPoint
 * @param {object} rocket - Raw rocket launch data
 * @returns {DataPoint}
 */
export function rocketToDataPoint(rocket) {
    const uniqueId = rocket.id || `${rocket.site.replace(/\s+/g, '-').toLowerCase()}-${rocket.mission.replace(/\s+/g, '-')}`;
    const id = `${DataSourcePrefix[DataSourceType.ROCKET]}-${uniqueId}`;
    
    const severity = getRocketLaunchSeverity();
    
    return new DataPoint(
        id,
        DataSourceType.ROCKET,
        rocket.lat,
        rocket.lon,
        rocket.mission,
        `${rocket.rocketType} from ${rocket.site}, ${rocket.country}`,
        severity,
        rocket.launchTime || Date.now(),
        '🚀',
        {
            site: rocket.site,
            country: rocket.country,
            rocketType: rocket.rocketType,
            launchTime: rocket.launchTime,
            status: rocket.status
        }
    );
}

/**
 * Convert conflict data to DataPoint
 * @param {object} conflict - Raw conflict data
 * @returns {DataPoint}
 */
export function conflictToDataPoint(conflict) {
    const uniqueId = conflict.id || `${conflict.name.replace(/\s+/g, '-').toLowerCase()}`;
    const id = `${DataSourcePrefix[DataSourceType.CONFLICT]}-${uniqueId}`;
    
    const severity = getConflictSeverity(conflict.intensity);
    
    return new DataPoint(
        id,
        DataSourceType.CONFLICT,
        conflict.lat,
        conflict.lon,
        conflict.name,
        `${conflict.type}, Intensity: ${conflict.intensity}`,
        severity,
        conflict.time || Date.now(),
        '⚔️',
        {
            type: conflict.type,
            intensity: conflict.intensity,
            recentIncidents: conflict.recentIncidents
        }
    );
}

/**
 * Convert protest data to DataPoint
 * @param {object} protest - Raw protest data
 * @returns {DataPoint}
 */
export function protestToDataPoint(protest) {
    const uniqueId = protest.id || `${protest.city.replace(/\s+/g, '-').toLowerCase()}-${protest.time}`;
    const id = `${DataSourcePrefix[DataSourceType.PROTEST]}-${uniqueId}`;
    
    const severity = getProtestSeverity(protest.size);
    
    return new DataPoint(
        id,
        DataSourceType.PROTEST,
        protest.lat,
        protest.lon,
        `Protest in ${protest.city}`,
        `${protest.cause}, ${protest.size.toLocaleString()} participants`,
        severity,
        protest.time || Date.now(),
        '✊',
        {
            city: protest.city,
            country: protest.country,
            cause: protest.cause,
            size: protest.size,
            duration: protest.duration,
            status: protest.status
        }
    );
}

/**
 * Convert social unrest data to DataPoint
 * @param {object} unrest - Raw social unrest data
 * @returns {DataPoint}
 */
export function unrestToDataPoint(unrest) {
    const uniqueId = unrest.id || `${unrest.location.replace(/\s+/g, '-').toLowerCase()}`;
    const id = `${DataSourcePrefix[DataSourceType.UNREST]}-${uniqueId}`;
    
    const severity = getSocialUnrestSeverity(unrest.severity);
    
    return new DataPoint(
        id,
        DataSourceType.UNREST,
        unrest.lat,
        unrest.lon,
        `Unrest in ${unrest.location}`,
        `${unrest.type}, Severity: ${unrest.severity}`,
        severity,
        unrest.time || Date.now(),
        '⚠️',
        {
            location: unrest.location,
            country: unrest.country,
            severity: unrest.severity,
            type: unrest.type,
            affectedPopulation: unrest.affectedPopulation
        }
    );
}

/**
 * Convert disease outbreak data to DataPoint
 * @param {object} disease - Raw disease outbreak data
 * @returns {DataPoint}
 */
export function diseaseToDataPoint(disease) {
    const uniqueId = disease.id || `${disease.location.replace(/\s+/g, '-').toLowerCase()}-${disease.disease.replace(/\s+/g, '-')}`;
    const id = `${DataSourcePrefix[DataSourceType.DISEASE]}-${uniqueId}`;
    
    const severity = getDiseaseSeverity(disease.severity, disease.cases);
    
    return new DataPoint(
        id,
        DataSourceType.DISEASE,
        disease.lat,
        disease.lon,
        `${disease.disease} Outbreak`,
        `${disease.location}, ${disease.cases.toLocaleString()} cases`,
        severity,
        disease.time || Date.now(),
        '🦠',
        {
            location: disease.location,
            disease: disease.disease,
            cases: disease.cases,
            severity: disease.severity,
            status: disease.status
        }
    );
}

/**
 * Convert array of raw data to array of DataPoints
 * @param {Array} rawData 
 * @param {Function} converter 
 * @returns {Array<DataPoint>}
 */
export function convertBatch(rawData, converter) {
    if (!rawData || !Array.isArray(rawData)) return [];
    return rawData.map(item => converter(item));
}

