/**
 * API Layer - Data fetching with fallback to sample data generators
 */

import type {
    RawEarthquake,
    RawISS,
    RawVolcano,
    RawHurricane,
    RawTornado,
    RawAurora,
    RawWind,
    RawPrecipitation,
    RawRocket,
    RawConflict,
    RawProtest,
    RawUnrest,
    RawDisease
} from './converters';

// ===== API Response Type =====

export interface APIResponse<T> {
    success: boolean;
    data: T;
}

// ===== Sample Data Generators =====

export function generateSampleEarthquakes(): RawEarthquake[] {
    const zones = [
        { lat: 35, lon: 140, name: 'Japan' },
        { lat: -15, lon: -72, name: 'Peru' },
        { lat: 37, lon: -122, name: 'California' },
        { lat: -6, lon: 130, name: 'Indonesia' },
        { lat: 19, lon: -155, name: 'Hawaii' },
        { lat: 40, lon: 143, name: 'Japan East' },
        { lat: -38, lon: 176, name: 'New Zealand' },
        { lat: 13, lon: 121, name: 'Philippines' },
        { lat: 61, lon: -150, name: 'Alaska' },
        { lat: -23, lon: -70, name: 'Chile' }
    ];
    
    const earthquakes: RawEarthquake[] = [];
    const now = Date.now();
    
    zones.forEach((zone) => {
        const count = Math.floor(Math.random() * 5) + 3;
        for (let i = 0; i < count; i++) {
            const mag = 2.5 + Math.random() * 4.5;
            const lat = zone.lat + (Math.random() - 0.5) * 10;
            const lon = zone.lon + (Math.random() - 0.5) * 10;
            const time = now - Math.random() * 86400000;
            
            earthquakes.push({
                id: `sample-${zone.name}-${i}-${Date.now()}`,
                geometry: { coordinates: [lon, lat] },
                properties: {
                    mag: parseFloat(mag.toFixed(1)),
                    place: `${Math.floor(Math.random() * 100)}km from ${zone.name}`,
                    time: time
                }
            });
        }
    });
    
    return earthquakes;
}

let issOrbitPosition = Math.random() * Math.PI * 2;

export function generateSampleISS(): RawISS {
    issOrbitPosition += 0.004;
    const inclination = 51.6 * Math.PI / 180;
    
    return {
        lat: Math.sin(issOrbitPosition) * inclination * 180 / Math.PI,
        lon: ((issOrbitPosition * 180 / Math.PI * 2) % 360) - 180,
        altitude: 420,
        velocity: 27600
    };
}

export function generateSampleVolcanic(): RawVolcano[] {
    const volcanoes = [
        { lat: 19.4069, lon: -155.2834, name: 'Kilauea', elevation: 1247, country: 'Hawaii, USA' },
        { lat: 64.0700, lon: -19.2700, name: 'Eyjafjallajökull', elevation: 1666, country: 'Iceland' },
        { lat: 63.6300, lon: -19.6200, name: 'Katla', elevation: 1512, country: 'Iceland' },
        { lat: 40.8200, lon: 14.4300, name: 'Vesuvius', elevation: 1281, country: 'Italy' },
        { lat: 37.7510, lon: 14.9934, name: 'Etna', elevation: 3357, country: 'Italy' },
        { lat: 35.3606, lon: 138.7274, name: 'Mount Fuji', elevation: 3776, country: 'Japan' },
        { lat: 33.2933, lon: 131.4233, name: 'Aso', elevation: 1592, country: 'Japan' },
        { lat: -6.1020, lon: 105.4230, name: 'Krakatoa', elevation: 813, country: 'Indonesia' },
        { lat: -7.5400, lon: 110.4450, name: 'Merapi', elevation: 2910, country: 'Indonesia' },
        { lat: 14.4800, lon: 121.0200, name: 'Taal', elevation: 311, country: 'Philippines' },
        { lat: 13.2570, lon: 123.6850, name: 'Mayon', elevation: 2463, country: 'Philippines' },
        { lat: 19.2300, lon: -155.2900, name: 'Mauna Loa', elevation: 4169, country: 'Hawaii, USA' },
        { lat: 46.2000, lon: 122.1900, name: 'Mount St. Helens', elevation: 2549, country: 'Washington, USA' },
        { lat: 45.3740, lon: -121.6950, name: 'Mount Hood', elevation: 3426, country: 'Oregon, USA' },
        { lat: 19.4750, lon: -155.6080, name: 'Mauna Kea', elevation: 4207, country: 'Hawaii, USA' },
        { lat: -41.2920, lon: 174.7580, name: 'Ruapehu', elevation: 2797, country: 'New Zealand' },
        { lat: -37.8530, lon: 175.0680, name: 'Ngauruhoe', elevation: 2291, country: 'New Zealand' },
        { lat: 4.8950, lon: -75.3230, name: 'Nevado del Ruiz', elevation: 5321, country: 'Colombia' },
        { lat: -0.0300, lon: -78.4400, name: 'Cotopaxi', elevation: 5897, country: 'Ecuador' },
        { lat: -16.2700, lon: -68.0900, name: 'Illimani', elevation: 6438, country: 'Bolivia' }
    ];
    
    const alertLevels = ['normal', 'advisory', 'watch', 'warning'];
    const volcanic: RawVolcano[] = [];
    const now = Date.now();
    
    volcanoes.forEach((volcano, idx) => {
        const alertLevel = alertLevels[Math.floor(Math.random() * alertLevels.length)];
        const lastEruption = now - Math.random() * 31536000000;
        
        volcanic.push({
            id: `volcano-${volcano.name}-${idx}`,
            lat: volcano.lat + (Math.random() - 0.5) * 0.1,
            lon: volcano.lon + (Math.random() - 0.5) * 0.1,
            name: volcano.name,
            elevation: volcano.elevation,
            country: volcano.country,
            alertLevel: alertLevel,
            lastEruption: lastEruption,
            time: now - Math.random() * 86400000
        });
    });
    
    return volcanic;
}

export function generateSampleHurricanes(): RawHurricane[] {
    const hurricanes = [
        { lat: 25.0, lon: -80.0, name: 'Hurricane Alpha', category: 3, windSpeed: 120, pressure: 950, direction: 'NNE' },
        { lat: 15.0, lon: -60.0, name: 'Hurricane Beta', category: 1, windSpeed: 85, pressure: 980, direction: 'W' },
        { lat: 20.0, lon: -100.0, name: 'Hurricane Gamma', category: 4, windSpeed: 140, pressure: 930, direction: 'NW' },
        { lat: 10.0, lon: 130.0, name: 'Typhoon Delta', category: 2, windSpeed: 100, pressure: 965, direction: 'NE' },
        { lat: 18.0, lon: 145.0, name: 'Typhoon Epsilon', category: 5, windSpeed: 160, pressure: 910, direction: 'N' },
        { lat: 12.0, lon: -45.0, name: 'Hurricane Zeta', category: 1, windSpeed: 75, pressure: 990, direction: 'WNW' }
    ];
    
    const now = Date.now();
    return hurricanes.map((hurricane, idx) => ({
        id: `hurricane-${hurricane.name}-${idx}`,
        lat: hurricane.lat + (Math.random() - 0.5) * 2,
        lon: hurricane.lon + (Math.random() - 0.5) * 2,
        name: hurricane.name,
        category: hurricane.category,
        windSpeed: hurricane.windSpeed,
        pressure: hurricane.pressure,
        direction: hurricane.direction,
        time: now - Math.random() * 86400000
    }));
}

export function generateSampleTornadoes(): RawTornado[] {
    const tornadoRegions = [
        { lat: 35.0, lon: -97.0, name: 'Oklahoma' },
        { lat: 39.0, lon: -95.0, name: 'Kansas' },
        { lat: 40.0, lon: -89.0, name: 'Illinois' },
        { lat: 33.0, lon: -87.0, name: 'Alabama' },
        { lat: 32.0, lon: -96.0, name: 'Texas' }
    ];
    
    const tornadoes: RawTornado[] = [];
    const now = Date.now();
    const efScale = [0, 1, 2, 3, 4, 5];
    
    tornadoRegions.forEach((region, idx) => {
        const count = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < count; i++) {
            tornadoes.push({
                id: `tornado-${region.name}-${idx}-${i}`,
                lat: region.lat + (Math.random() - 0.5) * 3,
                lon: region.lon + (Math.random() - 0.5) * 3,
                location: region.name,
                intensity: efScale[Math.floor(Math.random() * efScale.length)],
                time: now - Math.random() * 3600000
            });
        }
    });
    
    return tornadoes;
}

export function generateSampleAurora(): RawAurora[] {
    const auroraRegions = [
        { lat: 70.0, lon: -20.0, name: 'Iceland' },
        { lat: 65.0, lon: -150.0, name: 'Alaska' },
        { lat: 70.0, lon: 30.0, name: 'Northern Norway' },
        { lat: 65.0, lon: -100.0, name: 'Northern Canada' },
        { lat: -70.0, lon: 0.0, name: 'Antarctica' },
        { lat: -65.0, lon: 140.0, name: 'Southern Ocean' }
    ];
    
    const now = Date.now();
    return auroraRegions.map((region, idx) => ({
        id: `aurora-${region.name}-${idx}`,
        lat: region.lat + (Math.random() - 0.5) * 5,
        lon: region.lon + (Math.random() - 0.5) * 10,
        name: region.name,
        kpIndex: Math.floor(Math.random() * 9) + 1,
        visibility: Math.random() > 0.5 ? 'visible' : 'forecast',
        time: now - Math.random() * 3600000
    }));
}

export function generateSampleWindPatterns(): RawWind[] {
    const windRegions = [
        { lat: 40.0, lon: -70.0, speed: 25, direction: 270 },
        { lat: 50.0, lon: -10.0, speed: 30, direction: 225 },
        { lat: 30.0, lon: 120.0, speed: 20, direction: 180 },
        { lat: -30.0, lon: 150.0, speed: 35, direction: 315 },
        { lat: 0.0, lon: 0.0, speed: 15, direction: 90 },
        { lat: 20.0, lon: -30.0, speed: 18, direction: 45 }
    ];
    
    const now = Date.now();
    return windRegions.map((wind, idx) => ({
        id: `wind-${idx}`,
        lat: wind.lat,
        lon: wind.lon,
        speed: wind.speed,
        direction: wind.direction,
        gusts: wind.speed + Math.random() * 10,
        time: now
    }));
}

export function generateSamplePrecipitation(): RawPrecipitation[] {
    const precipRegions = [
        { lat: 45.0, lon: -75.0, type: 'rain', intensity: 15 },
        { lat: 50.0, lon: -5.0, type: 'rain', intensity: 20 },
        { lat: 60.0, lon: -150.0, type: 'snow', intensity: 10 },
        { lat: 45.0, lon: 10.0, type: 'rain', intensity: 12 },
        { lat: 35.0, lon: 140.0, type: 'rain', intensity: 25 },
        { lat: -40.0, lon: 175.0, type: 'rain', intensity: 18 }
    ];
    
    const now = Date.now();
    return precipRegions.map((precip, idx) => ({
        id: `precip-${idx}`,
        lat: precip.lat + (Math.random() - 0.5) * 2,
        lon: precip.lon + (Math.random() - 0.5) * 2,
        type: precip.type,
        intensity: precip.intensity,
        accumulation: precip.intensity * (Math.random() * 2 + 1),
        time: now - Math.random() * 3600000
    }));
}

export function generateSampleRocketLaunches(): RawRocket[] {
    const launchSites = [
        { lat: 28.5721, lon: -80.6480, name: 'Cape Canaveral', country: 'USA' },
        { lat: 45.9650, lon: 63.3050, name: 'Baikonur', country: 'Kazakhstan' },
        { lat: 34.6320, lon: -120.6100, name: 'Vandenberg', country: 'USA' },
        { lat: 28.2300, lon: 102.0300, name: 'Xichang', country: 'China' },
        { lat: 5.2390, lon: -52.7690, name: 'Kourou', country: 'French Guiana' },
        { lat: 13.7330, lon: 80.2350, name: 'Sriharikota', country: 'India' }
    ];
    
    const now = Date.now();
    const rocketTypes = ['Falcon 9', 'Soyuz', 'Long March', 'Ariane', 'PSLV'];
    
    return launchSites.map((site, idx) => ({
        id: `rocket-${site.name}-${idx}`,
        lat: site.lat,
        lon: site.lon,
        site: site.name,
        country: site.country,
        mission: `Mission ${String.fromCharCode(65 + idx)}`,
        rocketType: rocketTypes[Math.floor(Math.random() * rocketTypes.length)],
        launchTime: now + Math.random() * 604800000,
        status: Math.random() > 0.5 ? 'scheduled' : 'recent'
    }));
}

export function generateSampleConflicts(): RawConflict[] {
    const conflictZones = [
        { lat: 48.3794, lon: 31.1656, name: 'Ukraine', type: 'military', intensity: 'high' },
        { lat: 31.9522, lon: 35.2332, name: 'Gaza', type: 'military', intensity: 'high' },
        { lat: 33.3152, lon: 44.3661, name: 'Iraq', type: 'insurgency', intensity: 'medium' },
        { lat: 34.8021, lon: 38.9968, name: 'Syria', type: 'civil war', intensity: 'high' },
        { lat: 4.5709, lon: -74.2973, name: 'Colombia', type: 'insurgency', intensity: 'low' }
    ];
    
    const now = Date.now();
    return conflictZones.map((zone, idx) => ({
        id: `conflict-${zone.name}-${idx}`,
        lat: zone.lat + (Math.random() - 0.5) * 1,
        lon: zone.lon + (Math.random() - 0.5) * 1,
        name: zone.name,
        type: zone.type,
        intensity: zone.intensity,
        recentIncidents: Math.floor(Math.random() * 10) + 1,
        time: now - Math.random() * 86400000
    }));
}

export function generateSampleProtests(): RawProtest[] {
    const cities = [
        { lat: 40.7128, lon: -74.0060, name: 'New York', country: 'USA' },
        { lat: 51.5074, lon: -0.1278, name: 'London', country: 'UK' },
        { lat: 48.8566, lon: 2.3522, name: 'Paris', country: 'France' },
        { lat: 35.6762, lon: 139.6503, name: 'Tokyo', country: 'Japan' },
        { lat: -33.8688, lon: 151.2093, name: 'Sydney', country: 'Australia' },
        { lat: -22.9068, lon: -43.1729, name: 'Rio de Janeiro', country: 'Brazil' }
    ];
    
    const causes = ['Climate', 'Labor', 'Political', 'Social', 'Economic'];
    const now = Date.now();
    
    return cities.map((city, idx) => ({
        id: `protest-${city.name}-${idx}`,
        lat: city.lat + (Math.random() - 0.5) * 0.1,
        lon: city.lon + (Math.random() - 0.5) * 0.1,
        city: city.name,
        country: city.country,
        cause: causes[Math.floor(Math.random() * causes.length)],
        size: Math.floor(Math.random() * 50000) + 1000,
        duration: Math.floor(Math.random() * 48) + 1,
        status: Math.random() > 0.3 ? 'active' : 'recent',
        time: now - Math.random() * 86400000
    }));
}

export function generateSampleSocialUnrest(): RawUnrest[] {
    const unrestAreas = [
        { lat: -26.2041, lon: 28.0473, name: 'Johannesburg', country: 'South Africa', severity: 'medium' },
        { lat: 19.4326, lon: -99.1332, name: 'Mexico City', country: 'Mexico', severity: 'low' },
        { lat: 39.9042, lon: 116.4074, name: 'Beijing', country: 'China', severity: 'low' },
        { lat: 55.7558, lon: 37.6173, name: 'Moscow', country: 'Russia', severity: 'medium' },
        { lat: -34.6037, lon: -58.3816, name: 'Buenos Aires', country: 'Argentina', severity: 'high' }
    ];
    
    const now = Date.now();
    return unrestAreas.map((area, idx) => ({
        id: `unrest-${area.name}-${idx}`,
        lat: area.lat + (Math.random() - 0.5) * 0.5,
        lon: area.lon + (Math.random() - 0.5) * 0.5,
        location: area.name,
        country: area.country,
        severity: area.severity,
        type: Math.random() > 0.5 ? 'economic' : 'political',
        affectedPopulation: Math.floor(Math.random() * 1000000) + 10000,
        time: now - Math.random() * 604800000
    }));
}

export function generateSampleDiseaseOutbreaks(): RawDisease[] {
    const outbreaks = [
        { lat: 23.1291, lon: 113.2644, name: 'Guangzhou', disease: 'Influenza', cases: 1250, severity: 'moderate' },
        { lat: -6.2088, lon: 106.8456, name: 'Jakarta', disease: 'Dengue', cases: 850, severity: 'moderate' },
        { lat: 19.0760, lon: 72.8777, name: 'Mumbai', disease: 'Malaria', cases: 2100, severity: 'high' },
        { lat: -15.7975, lon: -47.8919, name: 'Brasilia', disease: 'Yellow Fever', cases: 450, severity: 'moderate' },
        { lat: 4.7110, lon: -74.0721, name: 'Bogota', disease: 'Zika', cases: 320, severity: 'low' },
        { lat: 14.5995, lon: 120.9842, name: 'Manila', disease: 'Cholera', cases: 680, severity: 'high' }
    ];
    
    const now = Date.now();
    return outbreaks.map((outbreak, idx) => ({
        id: `disease-${outbreak.name}-${idx}`,
        lat: outbreak.lat + (Math.random() - 0.5) * 0.5,
        lon: outbreak.lon + (Math.random() - 0.5) * 0.5,
        location: outbreak.name,
        disease: outbreak.disease,
        cases: outbreak.cases,
        severity: outbreak.severity,
        status: Math.random() > 0.3 ? 'active' : 'contained',
        time: now - Math.random() * 2592000000
    }));
}

// ===== API Fetch Functions =====

export async function fetchEarthquakes(): Promise<APIResponse<RawEarthquake[]>> {
    try {
        const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson', {
            method: 'GET',
            mode: 'cors'
        });
        const data = await response.json();
        return { success: true, data: data.features };
    } catch (error) {
        console.error('Error fetching earthquakes:', error);
        return { success: false, data: generateSampleEarthquakes() };
    }
}

export async function fetchISS(): Promise<APIResponse<RawISS>> {
    try {
        const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544', {
            method: 'GET',
            mode: 'cors'
        });
        const data = await response.json();
        return {
            success: true,
            data: {
                lat: data.latitude,
                lon: data.longitude,
                altitude: data.altitude,
                velocity: data.velocity
            }
        };
    } catch (error) {
        console.error('Error fetching ISS:', error);
        return { success: false, data: generateSampleISS() };
    }
}

export async function fetchVolcanic(): Promise<APIResponse<RawVolcano[]>> {
    try {
        // USGS Volcano Hazards Program API - provides status for all U.S. volcanoes
        const response = await fetch('https://volcanoes.usgs.gov/vsc/api/volcanoApi/vhpstatus', {
            method: 'GET',
            mode: 'cors'
        });
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        
        const rawData = await response.json();
        
        // Transform USGS format to our RawVolcano format
        // Actual API fields: vName, lat, long, vnum, volcanoCd, alertLevel, colorCode, region, etc.
        const volcanoes: RawVolcano[] = rawData
            .map((v: any) => ({
                id: v.volcanoCd || v.vnum,
                lat: parseFloat(v.lat),
                lon: parseFloat(v.long), // API uses 'long' not 'lon'
                name: v.vName,
                elevation: 0, // Not provided by API, using placeholder
                country: 'USA', // USGS API covers U.S. volcanoes
                alertLevel: (v.alertLevel || 'UNASSIGNED').toLowerCase(),
                lastEruption: Date.now() - (Math.random() * 31536000000), // Placeholder
                time: Date.now()
            }))
            .filter((v: RawVolcano) => 
                v.lat && 
                !isNaN(v.lat) && 
                v.lon && 
                !isNaN(v.lon) &&
                v.alertLevel !== 'unassigned' // Filter out unassigned volcanoes
            );
        
        console.log(`✅ Fetched ${volcanoes.length} volcanoes from USGS API (filtered from ${rawData.length} total)`);
        return { success: true, data: volcanoes };
    } catch (error) {
        console.error('Error fetching volcanic activity from USGS, falling back to sample data:', error);
        return { success: false, data: generateSampleVolcanic() };
    }
}

export async function fetchHurricanes(): Promise<APIResponse<RawHurricane[]>> {
    try {
        // NOAA National Hurricane Center API - provides active tropical cyclones
        // Covers Atlantic, Eastern Pacific, and Central Pacific basins
        const response = await fetch('https://www.nhc.noaa.gov/CurrentStorms.json', {
            method: 'GET',
            mode: 'cors'
        });
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform NOAA format to our RawHurricane format
        const hurricanes: RawHurricane[] = (data.activeStorms || []).map((storm: any) => {
            // NOAA provides classification (e.g., "Hurricane", "Tropical Storm")
            // We'll estimate category based on wind speed if not provided
            const windSpeed = parseInt(storm.intensity) || 0;
            let category = 0;
            if (windSpeed >= 157) category = 5;
            else if (windSpeed >= 130) category = 4;
            else if (windSpeed >= 111) category = 3;
            else if (windSpeed >= 96) category = 2;
            else if (windSpeed >= 74) category = 1;
            
            return {
                id: storm.id || storm.stormId,
                lat: parseFloat(storm.lat || storm.latitude),
                lon: parseFloat(storm.lon || storm.longitude),
                name: storm.name || storm.stormName || 'Unnamed Storm',
                category: category,
                windSpeed: windSpeed,
                pressure: parseInt(storm.pressure) || 1000,
                direction: storm.movement || storm.direction || 'N',
                time: Date.now()
            };
        }).filter((h: RawHurricane) => h.lat && !isNaN(h.lat) && h.lon && !isNaN(h.lon));
        
        console.log(`✅ Fetched ${hurricanes.length} active hurricanes from NOAA NHC API`);
        
        // Return actual data (empty array if no active storms)
        // Sample data can be enabled via the "Simulated Data" toggle in the Legend
        return { success: true, data: hurricanes };
    } catch (error) {
        console.error('Error fetching hurricanes from NOAA, falling back to sample data:', error);
        return { success: false, data: generateSampleHurricanes() };
    }
}

export async function fetchTornadoes(): Promise<APIResponse<RawTornado[]>> {
    try {
        return { success: false, data: generateSampleTornadoes() };
    } catch (error) {
        console.error('Error fetching tornadoes:', error);
        return { success: false, data: generateSampleTornadoes() };
    }
}

export async function fetchAurora(): Promise<APIResponse<RawAurora[]>> {
    try {
        return { success: false, data: generateSampleAurora() };
    } catch (error) {
        console.error('Error fetching aurora activity:', error);
        return { success: false, data: generateSampleAurora() };
    }
}

export async function fetchWindPatterns(): Promise<APIResponse<RawWind[]>> {
    try {
        return { success: false, data: generateSampleWindPatterns() };
    } catch (error) {
        console.error('Error fetching wind patterns:', error);
        return { success: false, data: generateSampleWindPatterns() };
    }
}

export async function fetchPrecipitation(): Promise<APIResponse<RawPrecipitation[]>> {
    try {
        return { success: false, data: generateSamplePrecipitation() };
    } catch (error) {
        console.error('Error fetching precipitation:', error);
        return { success: false, data: generateSamplePrecipitation() };
    }
}

export async function fetchRocketLaunches(): Promise<APIResponse<RawRocket[]>> {
    try {
        return { success: false, data: generateSampleRocketLaunches() };
    } catch (error) {
        console.error('Error fetching rocket launches:', error);
        return { success: false, data: generateSampleRocketLaunches() };
    }
}

export async function fetchConflicts(): Promise<APIResponse<RawConflict[]>> {
    try {
        return { success: false, data: generateSampleConflicts() };
    } catch (error) {
        console.error('Error fetching conflicts:', error);
        return { success: false, data: generateSampleConflicts() };
    }
}

export async function fetchProtests(): Promise<APIResponse<RawProtest[]>> {
    try {
        return { success: false, data: generateSampleProtests() };
    } catch (error) {
        console.error('Error fetching protests:', error);
        return { success: false, data: generateSampleProtests() };
    }
}

export async function fetchSocialUnrest(): Promise<APIResponse<RawUnrest[]>> {
    try {
        return { success: false, data: generateSampleSocialUnrest() };
    } catch (error) {
        console.error('Error fetching social unrest:', error);
        return { success: false, data: generateSampleSocialUnrest() };
    }
}

export async function fetchDiseaseOutbreaks(): Promise<APIResponse<RawDisease[]>> {
    try {
        return { success: false, data: generateSampleDiseaseOutbreaks() };
    } catch (error) {
        console.error('Error fetching disease outbreaks:', error);
        return { success: false, data: generateSampleDiseaseOutbreaks() };
    }
}

