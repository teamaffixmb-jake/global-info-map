import './Header.css';

export default function Header({ earthquakeCount, lastUpdate }) {
    return (
        <div id="header">
            <div id="title">
                <h1>🌍 Global Data Screensaver</h1>
                <p id="lastUpdate">Last updated: {lastUpdate || '--:--:--'}</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    <span style={{ color: '#fbbf24' }}>●</span> Earthquakes: <span id="eqCount">{earthquakeCount}</span> live | 
                    <span style={{ color: '#a855f7' }}>🛰️</span> ISS: tracking
                </p>
            </div>
        </div>
    );
}

