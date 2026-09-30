import React from 'react';

export const MetricCard = ({ title, value, subtext, theme = "theme-blue", icon: Icon, onClick, clickable = false }) => {
  return (
    <div
      className={`metric-card ${theme} ${clickable ? 'clickable' : ''}`}
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <div className="metric-top">
        <span className="metric-title">{title}</span>
        {Icon && (
          <div className="metric-icon-badge">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="metric-value">{value !== undefined && value !== null ? value.toLocaleString() : '0'}</div>
      {subtext && <div className="metric-subtext">{subtext}</div>}
      {clickable && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span>Click to view breakdown</span>
          <span>→</span>
        </div>
      )}
    </div>
  );
};
