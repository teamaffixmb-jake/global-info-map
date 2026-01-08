import { useState } from 'react';
import './Legend.css';

export default function Legend() {
    const [isMinimized, setIsMinimized] = useState(false);

    return (
        <div id="legend" className={isMinimized ? 'show minimized' : 'show'}>
            <div className="legend-header" onClick={() => setIsMinimized(!isMinimized)}>
                <h3>Data Legend</h3>
                <button className="toggle-button" onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}>
                    {isMinimized ? '▲' : '▼'}
                </button>
            </div>
            <div className="legend-content">
            
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
            
            <div style={{ marginBottom: '1rem' }}>
                <strong style={{ fontSize: '0.875rem' }}>Volcanic Activity (Alert Level)</strong>
                <div className="legend-item">
                    <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '9px solid #ff0000' }}></div>
                    <span>Warning</span>
                </div>
                <div className="legend-item">
                    <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '9px solid #ff6600' }}></div>
                    <span>Watch</span>
                </div>
                <div className="legend-item">
                    <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '9px solid #ffcc00' }}></div>
                    <span>Advisory</span>
                </div>
                <div className="legend-item">
                    <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '9px solid #888888' }}></div>
                    <span>Normal</span>
                </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
                <strong style={{ fontSize: '0.875rem' }}>Hurricanes (Category)</strong>
                <div className="legend-item">
                    <div style={{ fontSize: '1.2rem' }}>🌀</div>
                    <span>Category 1-5 (Saffir-Simpson)</span>
                </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
                <strong style={{ fontSize: '0.875rem' }}>Tornadoes (EF Scale)</strong>
                <div className="legend-item">
                    <div style={{ fontSize: '1.2rem' }}>🌪️</div>
                    <span>EF0-EF5 intensity</span>
                </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
                <strong style={{ fontSize: '0.875rem' }}>Aurora Activity</strong>
                <div className="legend-item">
                    <div className="legend-color" style={{ background: '#00ff88' }}></div>
                    <span>KP Index 1-9</span>
                </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
                <strong style={{ fontSize: '0.875rem' }}>Wind Patterns</strong>
                <div className="legend-item">
                    <div style={{ fontSize: '1rem' }}>💨</div>
                    <span>Directional arrows</span>
                </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
                <strong style={{ fontSize: '0.875rem' }}>Precipitation</strong>
                <div className="legend-item">
                    <div style={{ fontSize: '1rem' }}>🌧️</div>
                    <span>Rain</span>
                </div>
                <div className="legend-item">
                    <div style={{ fontSize: '1rem' }}>❄️</div>
                    <span>Snow</span>
                </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
                <strong style={{ fontSize: '0.875rem' }}>Rocket Launches</strong>
                <div className="legend-item">
                    <div style={{ fontSize: '1rem' }}>🚀</div>
                    <span>Launch sites</span>
                </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
                <strong style={{ fontSize: '0.875rem' }}>Active Conflicts</strong>
                <div className="legend-item">
                    <div style={{ fontSize: '1rem' }}>⚔️</div>
                    <span>Conflict zones</span>
                </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
                <strong style={{ fontSize: '0.875rem' }}>Protests</strong>
                <div className="legend-item">
                    <div style={{ fontSize: '1rem' }}>✊</div>
                    <span>Demonstrations</span>
                </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
                <strong style={{ fontSize: '0.875rem' }}>Social Unrest</strong>
                <div className="legend-item">
                    <div style={{ fontSize: '1rem' }}>⚠️</div>
                    <span>Tension areas</span>
                </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
                <strong style={{ fontSize: '0.875rem' }}>Disease Outbreaks</strong>
                <div className="legend-item">
                    <div style={{ fontSize: '1rem' }}>🦠</div>
                    <span>Active outbreaks</span>
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
        </div>
    );
}

