import './Legend.css';

export default function Legend() {
    return (
        <div id="legend" className="show">
            <h3 style={{ marginBottom: '0.75rem' }}>Data Legend</h3>
            
            <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#374151', borderRadius: '0.25rem' }}>
                <strong style={{ fontSize: '0.875rem', color: '#fbbf24' }}>✨ Animation Key</strong>
                <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: '#d1d5db' }}>
                    🆕 Bouncing = Brand new event!<br />
                    💫 Pulsing = Recent activity
                </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
                <strong style={{ fontSize: '0.875rem' }}>Earthquakes (Magnitude)</strong>
                <div className="legend-item">
                    <div className="legend-color" style={{ background: '#ff0000' }}></div>
                    <span>6.0+ Major</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color" style={{ background: '#ff6600' }}></div>
                    <span>5.0-5.9 Moderate</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color" style={{ background: '#ff9900' }}></div>
                    <span>4.0-4.9 Light</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color" style={{ background: '#ffcc00' }}></div>
                    <span>3.0-3.9 Minor</span>
                </div>
            </div>
            
            <div>
                <strong style={{ fontSize: '0.875rem' }}>Space Station</strong>
                <div className="legend-item">
                    <div className="legend-color" style={{ background: '#a855f7', border: '2px solid white' }}></div>
                    <span>ISS Position</span>
                </div>
            </div>
        </div>
    );
}

