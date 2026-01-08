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

