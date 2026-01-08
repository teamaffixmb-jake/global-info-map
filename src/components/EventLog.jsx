import './EventLog.css';

export default function EventLog() {
    return (
        <div id="event-log" className="show">
            <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>📊 Activity Log</h3>
            <div className="event-log-content">
                <div className="event-log-placeholder">
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 1rem' }}>
                        Event logging will be implemented here.<br/><br/>
                        This panel will display real-time updates when:<br/>
                        • New earthquakes are detected 🌍<br/>
                        • Volcanic activity changes 🌋<br/>
                        • Hurricanes form or strengthen 🌀<br/>
                        • Tornadoes are reported 🌪️<br/>
                        • Aurora activity increases 🌌<br/>
                        • Rockets launch 🚀<br/>
                        • Conflicts escalate ⚔️<br/>
                        • Protests begin ✊<br/>
                        • Disease outbreaks occur 🦠<br/>
                        • And more...
                    </p>
                </div>
            </div>
        </div>
    );
}

