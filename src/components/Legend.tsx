import { useState } from 'react';
import './Legend.css';
import { DataSourceType } from '../models/DataPoint';

interface LegendProps {
    counts?: Record<string, number>;
    lastUpdate?: string;
    showSimulatedData?: boolean;
    onToggleSimulatedData?: (value: boolean) => void;
}

export default function Legend({ 
    counts = {}, 
    lastUpdate = '',
    showSimulatedData = false,
    onToggleSimulatedData
}: LegendProps) {
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
            
            {/* Simulated Data Toggle */}
            {onToggleSimulatedData && (
                <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#374151', borderRadius: '0.25rem', borderLeft: '3px solid #3b82f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <strong style={{ fontSize: '0.75rem', color: '#3b82f6' }}>🧪 Simulated Data</strong>
                            <div style={{ fontSize: '0.65rem', marginTop: '0.25rem', color: '#9ca3af' }}>
                                Show sample data when real data unavailable
                            </div>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={showSimulatedData}
                                onChange={(e) => onToggleSimulatedData(e.target.checked)}
                                style={{
                                    width: '16px',
                                    height: '16px',
                                    cursor: 'pointer',
                                    accentColor: '#3b82f6'
                                }}
                            />
                        </label>
                    </div>
                </div>
            )}
            
            <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#1f2937', borderRadius: '0.25rem', borderLeft: '3px solid #10b981' }}>
                <strong style={{ fontSize: '0.75rem', color: '#10b981' }}>📊 Active Data Points</strong>
                <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', color: '#d1d5db', lineHeight: '1.4' }}>
                    <span style={{ color: '#fbbf24' }}>🔴</span> EQ: {counts[DataSourceType.EARTHQUAKE] || 0} | 
                    <span style={{ color: '#ff0000' }}>🌋</span> Vol: {counts[DataSourceType.VOLCANO] || 0} | 
                    <span style={{ color: '#ff6600' }}>🌀</span> Hur: {counts[DataSourceType.HURRICANE] || 0} | 
                    <span style={{ color: '#ff9900' }}>🌪️</span> Tor: {counts[DataSourceType.TORNADO] || 0}<br/>
                    <span style={{ color: '#00ff88' }}>🌌</span> Aur: {counts[DataSourceType.AURORA] || 0} | 
                    <span style={{ color: '#ffff00' }}>💨</span> Wind: {counts[DataSourceType.WIND] || 0} | 
                    <span style={{ color: '#00aaff' }}>🌧️</span> Precip: {counts[DataSourceType.PRECIPITATION] || 0} | 
                    <span style={{ color: '#00ff00' }}>🚀</span> Rocket: {counts[DataSourceType.ROCKET] || 0}<br/>
                    <span style={{ color: '#ff0000' }}>⚔️</span> Conflict: {counts[DataSourceType.CONFLICT] || 0} | 
                    <span style={{ color: '#ff6600' }}>✊</span> Protest: {counts[DataSourceType.PROTEST] || 0} | 
                    <span style={{ color: '#ff9900' }}>⚠️</span> Unrest: {counts[DataSourceType.UNREST] || 0} | 
                    <span style={{ color: '#ff0000' }}>🦠</span> Disease: {counts[DataSourceType.DISEASE] || 0} | 
                    <span style={{ color: '#a855f7' }}>🛰️</span> ISS: {counts[DataSourceType.ISS] ? 1 : 0}
                </div>
                <div style={{ fontSize: '0.65rem', marginTop: '0.5rem', color: '#9ca3af' }}>
                    Last updated: {lastUpdate || '--:--:--'}
                </div>
            </div>
            
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
                <strong style={{ fontSize: '0.875rem' }}>Wind Patterns (Speed)</strong>
                <div className="legend-item">
                    <div style={{ fontSize: '0.8rem', color: '#8b00ff' }}>➤</div>
                    <span>40+ mph (Fast)</span>
                </div>
                <div className="legend-item">
                    <div style={{ fontSize: '0.8rem', color: '#c71585' }}>➤</div>
                    <span>25-39 mph</span>
                </div>
                <div className="legend-item">
                    <div style={{ fontSize: '0.8rem', color: '#ff69b4' }}>➤</div>
                    <span>15-24 mph</span>
                </div>
                <div className="legend-item">
                    <div style={{ fontSize: '0.8rem', color: '#ffff00' }}>➤</div>
                    <span>7-14 mph</span>
                </div>
                <div className="legend-item">
                    <div style={{ fontSize: '0.8rem', color: '#00ff00' }}>➤</div>
                    <span>5-6 mph (Light)</span>
                </div>
                <div style={{ fontSize: '0.65rem', marginTop: '0.25rem', color: '#9ca3af' }}>
                    🌈 Green→Purple gradient. Arrows show direction, sampled every 20° globally (real-time API)
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

