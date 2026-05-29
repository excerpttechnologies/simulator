import React from 'react';

interface Props {
  enabled: boolean;
  onToggle: () => void;
}

const ComponentInfoToggle: React.FC<Props> = ({ enabled, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '7px 14px',
        background: enabled
          ? 'linear-gradient(135deg, #0066ee 0%, #0099ff 100%)'
          : 'rgba(255,255,255,0.95)',
        color: enabled ? '#fff' : '#0055cc',
        border: enabled ? '1px solid #0099ff' : '1px solid rgba(0,80,180,0.20)',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '1.2px',
        transition: 'all 0.2s ease',
        boxShadow: enabled 
          ? '0 2px 12px rgba(0, 102, 238, 0.4)' 
          : '0 2px 8px rgba(0,80,180,0.10)',
      }}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: enabled ? '#fff' : '#0055cc',
          boxShadow: enabled ? '0 0 6px rgba(255,255,255,0.8)' : 'none',
        }}
      />
      <span>COMPONENT INFO</span>
      <span
        style={{
          fontSize: '9px',
          opacity: 0.85,
          fontWeight: 600,
        }}
      >
        {enabled ? '● ON' : 'OFF'}
      </span>
    </button>
  );
};

export default ComponentInfoToggle;
