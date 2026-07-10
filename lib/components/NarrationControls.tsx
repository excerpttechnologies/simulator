import React, { useState, useEffect } from 'react';

interface Props {
  simRef: React.RefObject<any>;
}

const NarrationControls: React.FC<Props> = ({ simRef }) => {
  const [enabled, setEnabled] = useState(true);
  const [volume, setVolume] = useState(0.85);
  const [rate, setRate] = useState(0.95);
  const [showSettings, setShowSettings] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(1);
  
  // ── Init from sim once available ──
  useEffect(() => {
    const check = setInterval(() => {
      if (simRef.current?.narration) {
        setEnabled(simRef.current.narration.isEnabled());
        setCurrentSpeed(simRef.current.speed || 1);
        clearInterval(check);
      }
    }, 100);
    return () => clearInterval(check);
  }, [simRef]);

  // ── Track simulation speed changes ──
  useEffect(() => {
    const onSpeedChange = (event: Event) => {
      const detail = (event as CustomEvent<{ speed: number }>).detail;
      if (typeof detail?.speed === 'number') {
        setCurrentSpeed(detail.speed);
      }
    };
    window.addEventListener('sim:speed', onSpeedChange as EventListener);
    return () => window.removeEventListener('sim:speed', onSpeedChange as EventListener);
  }, []);

  // ── Allow external controls (speed changes) to update the button state ──
  useEffect(() => {
    const onNarrationEnabled = (event: Event) => {
      const detail = (event as CustomEvent<{ enabled: boolean }>).detail;
      if (typeof detail?.enabled === 'boolean') {
        setEnabled(detail.enabled);
      }
    };

    window.addEventListener('sim:narration-enabled', onNarrationEnabled as EventListener);
    // Listen for global simulation reset so we can clear any local caches and sync UI
    const onSimReset = () => {
      const sim = simRef.current;
      if (sim?.narration) {
        try { sim.narration.stop?.(); } catch (e) {}
        try { sim.narration.reset?.(); } catch (e) {}
        try { setEnabled(sim.narration.isEnabled()); } catch (e) {}
      }
      // Ensure UI shows speed 1 if sim reset
      try { if (sim) { sim.speed = 1; setCurrentSpeed(1); window.dispatchEvent(new CustomEvent('sim:speed', { detail: { speed: 1 } })); } } catch (e) {}
    };
    window.addEventListener('sim:reset', onSimReset as EventListener);
    return () => {
      window.removeEventListener('sim:narration-enabled', onNarrationEnabled as EventListener);
      window.removeEventListener('sim:reset', onSimReset as EventListener);
    };
  }, []);
  
  const handleToggle = () => {
    const newState = !enabled;
    
    // ════════════════════════════════════════════════════════════════════════════
    // NARRATION SPEED LOCK: Narration only works at 1x speed
    // If enabling narration while speed > 1x, automatically switch to 1x first
    // ════════════════════════════════════════════════════════════════════════════
    if (newState && currentSpeed !== 1) {
      // Switch to 1x speed before enabling narration
      if (simRef.current) {
        simRef.current.speed = 1;
        setCurrentSpeed(1);
        window.dispatchEvent(new CustomEvent('sim:speed', { detail: { speed: 1 } }));
      }
    }
    
    setEnabled(newState);
    simRef.current?.narration?.setEnabled(newState);
    
    // Announce the narration state change
    if (newState && simRef.current?.narration) {
      const step = simRef.current.getActiveProcessStepInfo?.() ?? simRef.current.getCurrentStepInfo();
      if (step) {
        import('../../lib/narrationScripts').then(({ getStepNarration }) => {
          const script = getStepNarration(step.id);
          if (script?.starting) {
            simRef.current?.narration?.speak(`Narration enabled at ${step.name}. ${script.starting}`, 'high');
          }
        }).catch(() => {});
      }
    }
  };
  
  const handleVolume = (v: number) => {
    setVolume(v);
    simRef.current?.narration?.setVolume(v);
  };
  
  const handleRate = (r: number) => {
    setRate(r);
    simRef.current?.narration?.setRate(r);
  };
  
  // Disable narration toggle when speed > 1x
  const isDisabled = currentSpeed !== 1;
  
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* ── Toggle button ── */}
      <button
        onClick={handleToggle}
        disabled={isDisabled}
        onContextMenu={(e) => {
          e.preventDefault();
          if (!isDisabled) {
            setShowSettings(!showSettings);
          }
        }}
        title={
          isDisabled 
            ? `Narration is only available at 1× speed. Current speed: ${currentSpeed}×` 
            : "Click to toggle narration. Right-click for settings."
        }
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '7px 14px',
          background: isDisabled
            ? 'rgba(120,120,120,0.3)'
            : enabled
            ? 'linear-gradient(135deg, #0066ee 0%, #0099ff 100%)'
            : 'rgba(255,255,255,0.95)',
          color: isDisabled 
            ? '#888' 
            : enabled ? '#fff' : '#0055cc',
          border: isDisabled
            ? '1px solid rgba(120,120,120,0.3)'
            : enabled ? '1px solid #0099ff' : '1px solid rgba(0,80,180,0.20)',
          borderRadius: '8px',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '1.2px',
          transition: 'all 0.2s ease',
          boxShadow: isDisabled
            ? 'none'
            : enabled 
            ? '0 2px 12px rgba(0, 102, 238, 0.4)' 
            : '0 2px 8px rgba(0,80,180,0.10)',
          opacity: isDisabled ? 0.5 : 1,
        }}
      >
        <span style={{
          fontSize: '14px',
        }}>
          {isDisabled ? '🔇' : enabled ? '🔊' : '🔇'}
        </span>
        <span>NARRATION</span>
        <span style={{ fontSize: '9px', opacity: 0.85, fontWeight: 600 }}>
          {isDisabled ? `${currentSpeed}×` : enabled ? '● ON' : 'OFF'}
        </span>
        {!isDisabled && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              setShowSettings(!showSettings);
            }}
            style={{
              marginLeft: '4px',
              padding: '0 4px',
              cursor: 'pointer',
              opacity: 0.7,
            }}
          >
            ⚙
          </span>
        )}
      </button>
      
      {/* ── Settings popup ── */}
      {showSettings && !isDisabled && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          right: 0,
          width: '240px',
          background: 'rgba(8, 12, 22, 0.97)',
          border: '1px solid #33ddff',
          borderRadius: '8px',
          padding: '14px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          zIndex: 200,
        }}>
          <div style={{
            color: '#33ddff',
            fontSize: '11px',
            fontWeight: 'bold',
            letterSpacing: '1.5px',
            marginBottom: '12px',
          }}>
            NARRATION SETTINGS
          </div>
          
          {/* Volume slider */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#aab', fontSize: '11px' }}>VOLUME</span>
              <span style={{ color: '#fff', fontSize: '11px' }}>{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolume(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#33ddff' }}
            />
          </div>
          
          {/* Speed slider */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#aab', fontSize: '11px' }}>SPEED</span>
              <span style={{ color: '#fff', fontSize: '11px' }}>{rate.toFixed(2)}×</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={rate}
              onChange={(e) => handleRate(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#33ddff' }}
            />
          </div>
          
          {/* Test button */}
          <button
            onClick={() => {
              simRef.current?.narration?.speak(
                'Testing narration. This is your avatar voice.',
                'high'
              );
            }}
            style={{
              width: '100%',
              padding: '6px',
              background: '#1a4458',
              color: '#fff',
              border: '1px solid #33ddff',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 'bold',
              letterSpacing: '0.5px',
            }}
          >
            ▶ TEST VOICE
          </button>
        </div>
      )}
    </div>
  );
};

export default NarrationControls;
