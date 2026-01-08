import { useState, useEffect, useRef } from 'react';
import './EventLog.css';

export default function EventLog({ events, onEventClick }) {
    const [isMinimized, setIsMinimized] = useState(false);
    const contentRef = useRef(null);

    // Auto-scroll to bottom when new events are added
    useEffect(() => {
        if (contentRef.current && !isMinimized) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [events, isMinimized]);

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
    };

    return (
        <div id="event-log" className={isMinimized ? 'show minimized' : 'show'}>
            <div className="event-log-header" onClick={() => setIsMinimized(!isMinimized)}>
                <h3>📋 Event Log</h3>
                <button className="toggle-button" onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}>
                    {isMinimized ? '▲' : '▼'}
                </button>
            </div>
            <div className="event-log-content" ref={contentRef}>
                {events.length === 0 ? (
                    <div className="event-log-placeholder">
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 1rem' }}>
                            No events yet. Events will appear here as data changes are detected.
                        </p>
                    </div>
                ) : (
                    events.map((event) => (
                        <div 
                            key={event.id} 
                            className={`event-entry ${event.type}`}
                            onClick={() => onEventClick && onEventClick(event)}
                            style={{ cursor: onEventClick ? 'pointer' : 'default' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{event.emoji}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                                        {event.title}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#d1d5db' }}>
                                        {event.message}
                                    </div>
                                    <div className="event-timestamp">
                                        {formatTime(event.timestamp)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

