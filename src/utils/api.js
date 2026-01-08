// Sample data generators for when APIs fail or are blocked
export function generateSampleEarthquakes() {
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
    
    const earthquakes = [];
    const now = Date.now();
    
    zones.forEach((zone) => {
        const count = Math.floor(Math.random() * 5) + 3;
        for (let i = 0; i < count; i++) {
            const mag = 2.5 + Math.random() * 4.5;
            const lat = zone.lat + (Math.random() - 0.5) * 10;
            const lon = zone.lon + (Math.random() - 0.5) * 10;
            const time = now - Math.random() * 86400000; // Within last 24 hours
            
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

export function generateSampleFires() {
    // More comprehensive list of fire-prone regions with tighter spreads to avoid oceans
    const regions = [
        // North America
        { lat: 37, lon: -120, name: 'California', spread: 3 }, // Reduced spread for California
        { lat: 45, lon: -120, name: 'Pacific Northwest', spread: 4 },
        { lat: 35, lon: -110, name: 'Arizona', spread: 3 },
        { lat: 40, lon: -105, name: 'Colorado', spread: 3 },
        { lat: 30, lon: -100, name: 'Texas', spread: 5 },
        { lat: 45, lon: -95, name: 'Great Plains', spread: 5 },
        { lat: 50, lon: -110, name: 'Canada Prairies', spread: 4 },
        { lat: 60, lon: -140, name: 'Alaska', spread: 5 },
        
        // South America
        { lat: -10, lon: -55, name: 'Amazon', spread: 8 },
        { lat: -15, lon: -60, name: 'Bolivia', spread: 4 },
        { lat: -25, lon: -55, name: 'Paraguay', spread: 3 },
        { lat: -35, lon: -70, name: 'Chile', spread: 4 },
        { lat: -40, lon: -65, name: 'Argentina', spread: 5 },
        
        // Europe
        { lat: 40, lon: 3, name: 'Spain', spread: 3 },
        { lat: 42, lon: 2, name: 'France', spread: 2 },
        { lat: 38, lon: 24, name: 'Greece', spread: 2 },
        { lat: 45, lon: 10, name: 'Italy', spread: 3 },
        { lat: 50, lon: 20, name: 'Poland', spread: 3 },
        { lat: 55, lon: 37, name: 'Russia West', spread: 5 },
        
        // Africa
        { lat: 5, lon: 20, name: 'Central Africa', spread: 8 },
        { lat: -5, lon: 15, name: 'Congo', spread: 6 },
        { lat: -20, lon: 30, name: 'Zimbabwe', spread: 4 },
        { lat: -25, lon: 28, name: 'South Africa', spread: 4 },
        { lat: 15, lon: 0, name: 'Sahel', spread: 8 },
        { lat: 30, lon: 32, name: 'Egypt', spread: 2 },
        
        // Asia
        { lat: 55, lon: 95, name: 'Siberia', spread: 10 },
        { lat: 50, lon: 120, name: 'Mongolia', spread: 5 },
        { lat: 40, lon: 110, name: 'China North', spread: 5 },
        { lat: 25, lon: 100, name: 'China South', spread: 5 },
        { lat: 20, lon: 100, name: 'Thailand', spread: 3 },
        { lat: 15, lon: 105, name: 'Vietnam', spread: 3 },
        { lat: 0, lon: 115, name: 'Borneo', spread: 4 },
        { lat: -5, lon: 120, name: 'Sulawesi', spread: 3 },
        { lat: -6, lon: 130, name: 'Indonesia', spread: 5 },
        { lat: 15, lon: 120, name: 'Philippines', spread: 3 },
        { lat: 25, lon: 80, name: 'India', spread: 6 },
        { lat: 35, lon: 50, name: 'Iran', spread: 4 },
        
        // Australia & Oceania
        { lat: -25, lon: 135, name: 'Australia Central', spread: 8 },
        { lat: -30, lon: 150, name: 'Australia East', spread: 5 },
        { lat: -35, lon: 140, name: 'Australia South', spread: 4 },
        { lat: -40, lon: 175, name: 'New Zealand', spread: 3 }
    ];
    
    const fires = [];
    regions.forEach(region => {
        const count = Math.floor(Math.random() * 50) + 15; // Reduced from 80+20 to 50+15 for better distribution
        const spread = region.spread || 5;
        
        for (let i = 0; i < count; i++) {
            // Use tighter spread to keep fires on land
            const lat = region.lat + (Math.random() - 0.5) * spread;
            const lon = region.lon + (Math.random() - 0.5) * spread;
            
            // Basic check to avoid obvious ocean coordinates (simple heuristic)
            // This is not perfect but helps reduce ocean fires
            const isLikelyOcean = 
                (lon < -125 && lat > 30 && lat < 50) || // Pacific off US West Coast
                (lon > 140 && lat > 30 && lat < 50) ||  // Pacific off Japan
                (lon < -60 && lat > 50) ||               // North Atlantic
                (lon > 100 && lat < -30) ||              // Southern Indian Ocean
                (lon < -100 && lat < -30);               // South Pacific
            
            if (!isLikelyOcean) {
                fires.push({
                    id: `fire-${region.name}-${i}-${Date.now()}`,
                    lat: lat,
                    lon: lon,
                    brightness: 300 + Math.random() * 100,
                    confidence: Math.random() > 0.7 ? 'high' : 'nominal'
                });
            }
        }
    });
    
    return fires;
}

let issOrbitPosition = Math.random() * Math.PI * 2;

export function generateSampleISS() {
    issOrbitPosition += 0.004;
    const inclination = 51.6 * Math.PI / 180;
    
    return {
        lat: Math.sin(issOrbitPosition) * inclination * 180 / Math.PI,
        lon: ((issOrbitPosition * 180 / Math.PI * 2) % 360) - 180,
        altitude: 420,
        velocity: 27600
    };
}

export async function fetchEarthquakes() {
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

export async function fetchFires() {
    try {
        // NASA FIRMS often blocks CORS, so we'll use sample data
        // In a real deployment, you'd need a backend proxy
        return { success: false, data: generateSampleFires() };
    } catch (error) {
        console.error('Error fetching fires:', error);
        return { success: false, data: generateSampleFires() };
    }
}

export async function fetchISS() {
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

// Volcanic Activity
export function generateSampleVolcanic() {
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
    const volcanic = [];
    const now = Date.now();
    
    volcanoes.forEach((volcano, idx) => {
        const alertLevel = alertLevels[Math.floor(Math.random() * alertLevels.length)];
        const lastEruption = now - Math.random() * 31536000000; // Within last year
        
        volcanic.push({
            id: `volcano-${volcano.name}-${idx}`,
            lat: volcano.lat + (Math.random() - 0.5) * 0.1,
            lon: volcano.lon + (Math.random() - 0.5) * 0.1,
            name: volcano.name,
            elevation: volcano.elevation,
            country: volcano.country,
            alertLevel: alertLevel,
            lastEruption: lastEruption,
            time: now - Math.random() * 86400000 // Activity within last 24 hours
        });
    });
    
    return volcanic;
}

export async function fetchVolcanic() {
    try {
        // USGS Volcano Hazards Program API (if available)
        // For now, use sample data
        return { success: false, data: generateSampleVolcanic() };
    } catch (error) {
        console.error('Error fetching volcanic activity:', error);
        return { success: false, data: generateSampleVolcanic() };
    }
}

// Hurricanes
export function generateSampleHurricanes() {
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

export async function fetchHurricanes() {
    try {
        // NOAA Hurricane API (if available)
        return { success: false, data: generateSampleHurricanes() };
    } catch (error) {
        console.error('Error fetching hurricanes:', error);
        return { success: false, data: generateSampleHurricanes() };
    }
}

// Tornadoes
export function generateSampleTornadoes() {
    const tornadoRegions = [
        { lat: 35.0, lon: -97.0, name: 'Oklahoma' },
        { lat: 39.0, lon: -95.0, name: 'Kansas' },
        { lat: 40.0, lon: -89.0, name: 'Illinois' },
        { lat: 33.0, lon: -87.0, name: 'Alabama' },
        { lat: 32.0, lon: -96.0, name: 'Texas' }
    ];
    
    const tornadoes = [];
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
                time: now - Math.random() * 3600000 // Within last hour
            });
        }
    });
    
    return tornadoes;
}

export async function fetchTornadoes() {
    try {
        // NOAA Storm Prediction Center API (if available)
        return { success: false, data: generateSampleTornadoes() };
    } catch (error) {
        console.error('Error fetching tornadoes:', error);
        return { success: false, data: generateSampleTornadoes() };
    }
}

// Aurora Activity
export function generateSampleAurora() {
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
        kpIndex: Math.floor(Math.random() * 9) + 1, // KP index 1-9
        visibility: Math.random() > 0.5 ? 'visible' : 'forecast',
        time: now - Math.random() * 3600000
    }));
}

export async function fetchAurora() {
    try {
        // NOAA Space Weather API (if available)
        return { success: false, data: generateSampleAurora() };
    } catch (error) {
        console.error('Error fetching aurora activity:', error);
        return { success: false, data: generateSampleAurora() };
    }
}

// Wind Patterns
export function generateSampleWindPatterns() {
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

export async function fetchWindPatterns() {
    try {
        // Weather API (if available)
        return { success: false, data: generateSampleWindPatterns() };
    } catch (error) {
        console.error('Error fetching wind patterns:', error);
        return { success: false, data: generateSampleWindPatterns() };
    }
}

// Precipitation
export function generateSamplePrecipitation() {
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

export async function fetchPrecipitation() {
    try {
        // Weather API (if available)
        return { success: false, data: generateSamplePrecipitation() };
    } catch (error) {
        console.error('Error fetching precipitation:', error);
        return { success: false, data: generateSamplePrecipitation() };
    }
}

// Rocket Launches
export function generateSampleRocketLaunches() {
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
        launchTime: now + Math.random() * 604800000, // Within next week
        status: Math.random() > 0.5 ? 'scheduled' : 'recent'
    }));
}

export async function fetchRocketLaunches() {
    try {
        // Launch Library API (if available)
        return { success: false, data: generateSampleRocketLaunches() };
    } catch (error) {
        console.error('Error fetching rocket launches:', error);
        return { success: false, data: generateSampleRocketLaunches() };
    }
}

// Active Conflicts
export function generateSampleConflicts() {
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

export async function fetchConflicts() {
    try {
        // Conflict data API (if available)
        return { success: false, data: generateSampleConflicts() };
    } catch (error) {
        console.error('Error fetching conflicts:', error);
        return { success: false, data: generateSampleConflicts() };
    }
}

// Protests/Demonstrations
export function generateSampleProtests() {
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
        duration: Math.floor(Math.random() * 48) + 1, // hours
        status: Math.random() > 0.3 ? 'active' : 'recent',
        time: now - Math.random() * 86400000
    }));
}

export async function fetchProtests() {
    try {
        // News/social media API (if available)
        return { success: false, data: generateSampleProtests() };
    } catch (error) {
        console.error('Error fetching protests:', error);
        return { success: false, data: generateSampleProtests() };
    }
}

// Social Unrest
export function generateSampleSocialUnrest() {
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
        time: now - Math.random() * 604800000 // Within last week
    }));
}

export async function fetchSocialUnrest() {
    try {
        // Social data API (if available)
        return { success: false, data: generateSampleSocialUnrest() };
    } catch (error) {
        console.error('Error fetching social unrest:', error);
        return { success: false, data: generateSampleSocialUnrest() };
    }
}

// Disease Outbreaks
export function generateSampleDiseaseOutbreaks() {
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
        time: now - Math.random() * 2592000000 // Within last month
    }));
}

export async function fetchDiseaseOutbreaks() {
    try {
        // WHO/CDC API (if available)
        return { success: false, data: generateSampleDiseaseOutbreaks() };
    } catch (error) {
        console.error('Error fetching disease outbreaks:', error);
        return { success: false, data: generateSampleDiseaseOutbreaks() };
    }
}

