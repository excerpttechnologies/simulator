import React, { useState, useEffect, useRef } from 'react';

// ── Data shape matching COMPONENT_INFO in page.tsx ──────────────────────────
interface StepData {
  name: string;
  subtitle: string;
  hardware: string;
  process: string;
  specs: { label: string; value: string }[];
}

interface Props {
  /** navStep index (0-based) from parent state, updated on every sim:stepchange */
  stepIndex: number;
  /** Full data record keyed by step id */
  componentInfo: Record<string, { section: string; hardware: string; process: string; specs: Record<string, string> }>;
  /** ALL_STEPS array so we can resolve id + name by index */
  allSteps: { id: string; name: string; type: string; temp: number | null; time: number }[];
  /** Called when × CLOSE is clicked */
  onClose: () => void;
}

// ── Convert COMPONENT_INFO entry → StepData ─────────────────────────────────
function resolveStepData(
  idx: number,
  allSteps: Props['allSteps'],
  componentInfo: Props['componentInfo'],
): StepData | null {
  const step = allSteps[idx];
  if (!step) return null;
  const info = componentInfo[step.id];
  if (!info) return null;

  const specs = Object.entries(info.specs).map(([label, value]) => ({ label, value }));

  return {
    name:     step.name,
    subtitle: info.section,
    hardware: info.hardware,
    process:  info.process,
    specs,
  };
}

// ── Component ────────────────────────────────────────────────────────────────
const ComponentInfoPanel: React.FC<Props> = ({ stepIndex, componentInfo, allSteps, onClose }) => {
  const [displayed, setDisplayed]   = useState<StepData | null>(null);
  const [visible,   setVisible]     = useState(true);   // content opacity (fade)
  const pendingRef  = useRef<StepData | null>(null);
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When stepIndex changes: fade out → swap content → fade in
  useEffect(() => {
    const next = resolveStepData(stepIndex, allSteps, componentInfo);
    if (!next) return;

    // If nothing showing yet, just show immediately
    if (!displayed) {
      setDisplayed(next);
      setVisible(true);
      return;
    }

    // Same step — no animation needed
    if (displayed.name === next.name) return;

    pendingRef.current = next;

    // Fade out
    setVisible(false);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDisplayed(pendingRef.current);
      setVisible(true);
    }, 150);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [stepIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize on mount
  useEffect(() => {
    const init = resolveStepData(stepIndex, allSteps, componentInfo);
    if (init) { setDisplayed(init); setVisible(true); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={panelStyle}>
      {/* ── Header ── */}
      <div style={headerStyle}>
        <span style={{ color: '#33ddff', fontSize: 11, fontWeight: 700, letterSpacing: '1.5px' }}>
          COMPONENT INFO
        </span>
        <span
          onClick={onClose}
          title="Close"
          style={{ color: '#8899aa', fontSize: 13, cursor: 'pointer', lineHeight: 1, padding: '2px 4px', borderRadius: 3 }}
        >
          ✕
        </span>
      </div>

      {/* ── Content (fades on step change) ── */}
      <div style={{ transition: 'opacity 0.15s ease', opacity: visible ? 1 : 0 }}>
        {displayed ? (
          <>
            {/* Name + subtitle */}
            <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid #1a2a3a' }}>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginBottom: 3 }}>
                {displayed.name}
              </div>
              <div style={{ color: '#4488bb', fontSize: 9, letterSpacing: '1.8px', textTransform: 'uppercase' }}>
                {displayed.subtitle}
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '10px 14px', overflowY: 'auto', maxHeight: 'calc(100vh - 300px)' }}>
              {/* Hardware */}
              <SectionHeading>Hardware</SectionHeading>
              <p style={bodyTextStyle}>{displayed.hardware}</p>

              {/* Process */}
              <SectionHeading>Process</SectionHeading>
              <p style={bodyTextStyle}>{displayed.process}</p>

              {/* Specs */}
              <SectionHeading>Specs</SectionHeading>
              <div style={{ marginBottom: 6 }}>
                {displayed.specs.map(({ label, value }) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '4px 0',
                      borderBottom: '1px solid rgba(0,100,180,0.12)',
                      fontSize: 10,
                    }}
                  >
                    <span style={{ color: '#6699bb' }}>{label}</span>
                    <span style={{ color: '#ddeeff', fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: '30px 20px', textAlign: 'center', color: '#556', fontSize: 11 }}>
            No data for this step
          </div>
        )}
      </div>
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 9, letterSpacing: '2px', color: '#4488bb',
      textTransform: 'uppercase', marginBottom: 3, marginTop: 8,
    }}>
      {children}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const panelStyle: React.CSSProperties = {
  width: 300,
  background: 'rgba(8,12,22,0.96)',
  border: '1px solid #1a2a3a',
  borderRadius: 8,
  backdropFilter: 'blur(8px)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

const headerStyle: React.CSSProperties = {
  padding: '10px 14px',
  background: 'linear-gradient(90deg, #0a1525 0%, #0e1d35 100%)',
  borderBottom: '1px solid #1a2a3a',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexShrink: 0,
};

const bodyTextStyle: React.CSSProperties = {
  color: '#b8cfe4',
  fontSize: 10,
  lineHeight: 1.55,
  margin: '0 0 6px',
};

export default ComponentInfoPanel;
