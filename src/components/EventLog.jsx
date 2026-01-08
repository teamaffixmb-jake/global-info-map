import { useState, useEffect, useRef } from 'react';
import './EventLog.css';
import { SEVERITY, SEVERITY_LABELS } from '../utils/severity';

export default function EventLog({ events, onEventClick, severityThreshold, onSeverityChange }) {
    const [isMinimized, setIsMinimized] = useState(false);
    const contentRef = useRef(null);

    // Auto-scroll to bottom only if already at bottom
    useEffect(() => {
        if (contentRef.current && !isMinimized) {
            const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
            const isAtBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px threshold
            
            if (isAtBottom) {
                contentRef.current.scrollTop = scrollHeight;
            }
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
                <h3>📋 Event Log ({events.length})</h3>
                <button className="toggle-button" onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}>
                    {isMinimized ? '▲' : '▼'}
                </button>
            </div>
            {!isMinimized && (
                <div className="severity-filter" onClick={(e) => e.stopPropagation()}>
                    <label style={{ fontSize: '0.75rem', color: '#d1d5db', marginRight: '0.5rem' }}>
                        Min Severity:
                    </label>
                    <select 
                        value={severityThreshold}
                        onChange={(e) => onSeverityChange(Number(e.target.value))}
                        style={{
                            background: 'rgba(55, 65, 81, 0.5)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                        }}
                    >
                        <option value={SEVERITY.LOW}>Low</option>
                        <option value={SEVERITY.MEDIUM}>Medium</option>
                        <option value={SEVERITY.HIGH}>High</option>
                        <option value={SEVERITY.CRITICAL}>Critical</option>
                    </select>
                </div>
            )}
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
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                        <div style={{ fontWeight: 'bold' }}>
                                            {event.title}
                                        </div>
                                        <span className={`severity-badge severity-${event.severity}`}>
                                            {SEVERITY_LABELS[event.severity]}
                                        </span>
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

