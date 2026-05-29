import React, { useState, useEffect } from 'react';

interface ComponentInfo {
  stepIndex: number;
  stepId: string;
  name: string;
  temperature?: string;
  duration?: number;
  type?: string;
  description?: string;
  status?: 'idle' | 'active' | 'complete';
}

interface Props {
  simRef: React.RefObject<any>;
}

const ComponentInfoPanel: React.FC<Props> = ({ simRef }) => {
  const [info, setInfo] = useState<ComponentInfo | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // ── Listen for step changes ──
  useEffect(() => {
    const handler = (e: any) => {
      const step = e.detail.step;
      const idx = e.detail.currentIndex;
      if (!step) return;

      // Parse step info
      const tempMatch = step.name?.match(/(\d+)°C?/);
      const temperature = tempMatch ? `${tempMatch[1]}°C` : undefined;
      const cleanName = tempMatch ? step.name.replace(tempMatch[0], '').trim() : step.name;

      setInfo({
        stepIndex: idx,
        stepId: step.id,
        name: cleanName,
        temperature,
        duration: step.duration || 6,
        type: getStepType(step.id),
        description: getStepDescription(step.id),
        status: 'active',
      });
      setElapsedTime(0);
    };

    window.addEventListener('sim:flowchange', handler);
    window.addEventListener('sim:stepchange', handler);

    return () => {
      window.removeEventListener('sim:flowchange', handler);
      window.removeEventListener('sim:stepchange', handler);
    };
  }, []);

  // ── Tick elapsed time for current step ──
  useEffect(() => {
    if (!info || info.status !== 'active') return;
    const t = setInterval(() => setElapsedTime((e) => e + 0.1), 100);
    return () => clearInterval(t);
  }, [info?.stepIndex]);

  if (!info) {
    return (
      <div style={panelStyle}>
        <div style={emptyStyle}>
          <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.3 }}>⚙</div>
          <div style={{ color: '#556', fontSize: '12px', textAlign: 'center' }}>
            Waiting for process to start...
          </div>
        </div>
      </div>
    );
  }

  const progress = Math.min(elapsedTime / (info.duration || 1), 1);

  return (
    <div style={panelStyle}>
      {/* ─── Header ─── */}
      <div style={headerStyle}>
        <div
          style={{
            color: '#33ddff',
            fontSize: '11px',
            fontWeight: 'bold',
            letterSpacing: '1.5px',
          }}
        >
          COMPONENT INFO
        </div>
        <div
          style={{
            color: '#ff9933',
            fontSize: '10px',
            fontWeight: 'bold',
            padding: '2px 8px',
            background: 'rgba(255, 153, 51, 0.15)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 153, 51, 0.3)',
          }}
        >
          ● LIVE
        </div>
      </div>

      {/* ─── Step number badge ─── */}
      <div
        style={{
          background: 'linear-gradient(90deg, #1a4458 0%, #0a1a25 100%)',
          padding: '12px 16px',
          borderBottom: '1px solid #1a2a3a',
        }}
      >
        <div
          style={{
            color: '#33ddff',
            fontSize: '10px',
            letterSpacing: '1px',
            marginBottom: '4px',
            opacity: 0.7,
          }}
        >
          STEP {String(info.stepIndex + 1).padStart(2, '0')}
        </div>
        <div
          style={{
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          {info.name}
        </div>
      </div>

      {/* ─── Details grid ─── */}
      <div style={{ padding: '14px 16px' }}>
        {/* Type */}
        {info.type && (
          <InfoRow label="TYPE" value={info.type} valueColor="#33ddff" />
        )}

        {/* Temperature */}
        {info.temperature && (
          <InfoRow
            label="TEMPERATURE"
            value={info.temperature}
            valueColor="#ff5530"
            icon="🌡"
          />
        )}

        {/* Duration */}
        <InfoRow
          label="DURATION"
          value={`${info.duration}s`}
          valueColor="#fff"
          icon="⏱"
        />

        {/* Elapsed */}
        <InfoRow
          label="ELAPSED"
          value={`${elapsedTime.toFixed(1)}s`}
          valueColor="#22dd66"
        />

        {/* Progress bar */}
        <div style={{ marginTop: '10px', marginBottom: '12px' }}>
          <div
            style={{
              color: '#556',
              fontSize: '10px',
              letterSpacing: '1px',
              marginBottom: '4px',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>PROGRESS</span>
            <span style={{ color: '#22dd66' }}>
              {(progress * 100).toFixed(0)}%
            </span>
          </div>
          <div
            style={{
              height: '6px',
              background: 'rgba(0, 20, 40, 0.6)',
              borderRadius: '3px',
              overflow: 'hidden',
              border: '1px solid #1a2a3a',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress * 100}%`,
                background: 'linear-gradient(90deg, #22dd66 0%, #33ddff 100%)',
                transition: 'width 0.1s linear',
                boxShadow: '0 0 8px rgba(51, 221, 255, 0.5)',
              }}
            />
          </div>
        </div>

        {/* Description */}
        {info.description && (
          <div
            style={{
              padding: '10px 12px',
              background: 'rgba(0, 20, 40, 0.4)',
              borderLeft: '2px solid #33ddff',
              borderRadius: '4px',
              color: '#aab',
              fontSize: '12px',
              lineHeight: '1.5',
              marginTop: '8px',
            }}
          >
            {info.description}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Helper component ──
function InfoRow({
  label,
  value,
  valueColor,
  icon,
}: {
  label: string;
  value: string;
  valueColor: string;
  icon?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 0',
        borderBottom: '1px solid rgba(26, 42, 58, 0.5)',
      }}
    >
      <span
        style={{
          color: '#556',
          fontSize: '10px',
          letterSpacing: '1px',
          fontWeight: 'bold',
        }}
      >
        {icon && <span style={{ marginRight: '4px' }}>{icon}</span>}
        {label}
      </span>
      <span
        style={{
          color: valueColor,
          fontSize: '13px',
          fontWeight: 'bold',
          fontFamily: 'monospace',
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ── Step descriptions (customize per your process) ──
function getStepType(stepId: string): string {
  const map: Record<string, string> = {
    foup: 'INPUT',
    dehydration: 'HOT PROCESS',
    hmds: 'VAPOR PRIME',
    chill1: 'COLD PROCESS',
    pr_coat: 'COATING',
    pab: 'HOT PROCESS',
    chill2: 'COLD PROCESS',
    iface_in: 'TRANSFER',
    scanner: 'EXPOSURE',
    iface_out: 'TRANSFER',
    peb: 'HOT PROCESS',
    developer: 'DEVELOP',
    rinse: 'RINSE',
    spindry: 'DRY',
    chill3: 'COLD PROCESS',
    hardbake: 'HOT PROCESS',
  };
  return map[stepId] || 'PROCESS';
}

function getStepDescription(stepId: string): string {
  const map: Record<string, string> = {
    foup: 'Wafer loaded from Front Opening Unified Pod cassette.',
    dehydration: 'High-temperature bake to remove moisture from wafer surface.',
    hmds: 'Hexamethyldisilazane vapor prime improves resist adhesion.',
    chill1: 'Cool wafer to room temperature before coating.',
    pr_coat: 'Photoresist applied via spin coating at controlled RPM.',
    pab: 'Post-Apply Bake to evaporate solvents from resist.',
    chill2: 'Stabilize wafer temperature before exposure.',
    iface_in: 'Robot transfer to scanner interface.',
    scanner: '193nm DUV exposure pattern projection.',
    iface_out: 'Robot transfer from scanner back to track.',
    peb: 'Post-Exposure Bake activates chemical amplification.',
    developer: 'Develop liquid dissolves exposed (or unexposed) resist.',
    rinse: 'DI water rinse to remove developer residue.',
    spindry: 'High-speed spin + N₂ purge to dry the wafer.',
    chill3: 'Final cooling stage.',
    hardbake: 'Hard bake to stabilize resist pattern.',
  };
  return map[stepId] || 'Process step in semiconductor lithography track.';
}

// ── Styles ──
const panelStyle: React.CSSProperties = {
  width: '300px',
  background: 'rgba(8, 12, 22, 0.95)',
  border: '1px solid #1a2a3a',
  borderRadius: '8px',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  flexDirection: 'column',
  maxHeight: 'calc(100vh - 200px)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
  overflow: 'hidden',
};

const headerStyle: React.CSSProperties = {
  padding: '12px 14px',
  background: 'linear-gradient(90deg, #0a1525 0%, #0e1d35 100%)',
  borderBottom: '1px solid #1a2a3a',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const emptyStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px',
  minHeight: '200px',
};

export default ComponentInfoPanel;
