import './Header.css';

export default function Header({ earthquakeCount, volcanicCount, hurricaneCount, tornadoCount, auroraCount, windCount, precipitationCount, rocketCount, conflictCount, protestCount, unrestCount, diseaseCount, lastUpdate }) {
    return (
        <div id="header">
            <div id="title">
                <h1>🌍 Global Data Screensaver</h1>
                <p id="lastUpdate">Last updated: {lastUpdate || '--:--:--'}</p>
                <p style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.25rem', lineHeight: '1.4' }}>
                    <span style={{ color: '#fbbf24' }}>●</span> EQ: {earthquakeCount} | 
                    <span style={{ color: '#ff0000' }}>🌋</span> Vol: {volcanicCount} | 
                    <span style={{ color: '#ff6600' }}>🌀</span> Hur: {hurricaneCount} | 
                    <span style={{ color: '#ff9900' }}>🌪️</span> Tor: {tornadoCount} | 
                    <span style={{ color: '#00ff88' }}>🌌</span> Aur: {auroraCount} | 
                    <span style={{ color: '#ffff00' }}>💨</span> Wind: {windCount} | 
                    <span style={{ color: '#00aaff' }}>🌧️</span> Precip: {precipitationCount} | 
                    <span style={{ color: '#00ff00' }}>🚀</span> Rocket: {rocketCount} | 
                    <span style={{ color: '#ff0000' }}>⚔️</span> Conflict: {conflictCount} | 
                    <span style={{ color: '#ff6600' }}>✊</span> Protest: {protestCount} | 
                    <span style={{ color: '#ff9900' }}>⚠️</span> Unrest: {unrestCount} | 
                    <span style={{ color: '#ff0000' }}>🦠</span> Disease: {diseaseCount} | 
                    <span style={{ color: '#a855f7' }}>🛰️</span> ISS: tracking
                </p>
            </div>
        </div>
    );
}

