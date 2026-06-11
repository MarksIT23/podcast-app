import { useState, useRef, useCallback, useEffect } from 'react';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function TrimRange({
  min = 0,
  max = 3600,
  startTime = 0,
  endTime = 60,
  onChange,
  step = 1,
  label = 'Clip Range',
}) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [localStart, setLocalStart] = useState(startTime);
  const [localEnd, setLocalEnd] = useState(endTime);

  useEffect(() => {
    setLocalStart(startTime);
    setLocalEnd(endTime);
  }, [startTime, endTime]);

  const clamp = (val) => Math.max(min, Math.min(max, Math.round(val / step) * step));

  const getTimeFromEvent = useCallback((clientX) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = (clientX - rect.left) / rect.width;
    return clamp(pct * (max - min) + min);
  }, [min, max, clamp]);

  const handleMouseDown = (handle) => (e) => {
    e.preventDefault();
    setDragging(handle);
  };

  useEffect(() => {
    if (dragging === null) return;

    const handleMouseMove = (e) => {
      const time = getTimeFromEvent(e.clientX);
      if (dragging === 'start') {
        const newStart = Math.min(time, localEnd - step);
        setLocalStart(newStart);
        if (onChange) onChange({ startTime: newStart, endTime: localEnd });
      } else if (dragging === 'end') {
        const newEnd = Math.max(time, localStart + step);
        setLocalEnd(newEnd);
        if (onChange) onChange({ startTime: localStart, endTime: newEnd });
      }
    };

    const handleMouseUp = () => setDragging(null);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, localStart, localEnd, getTimeFromEvent, onChange, step]);

  const totalPct = max - min || 1;
  const startPct = ((localStart - min) / totalPct) * 100;
  const endPct = ((localEnd - min) / totalPct) * 100;
  const rangePct = endPct - startPct;

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <label style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
            {label}
          </label>
          <div style={{ display: 'flex', gap: 12, fontSize: '0.82rem' }}>
            <span style={{ color: '#3B82F6', fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(localStart)}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span style={{ color: '#F97316', fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(localEnd)}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem', display: 'flex', alignItems: 'center' }}>
              ({formatTime(localEnd - localStart)})
            </span>
          </div>
        </div>
      )}

      {/* Track */}
      <div
        ref={trackRef}
        style={{
          position: 'relative',
          height: 36,
          borderRadius: 8,
          background: 'rgba(255,255,255,0.06)',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={(e) => {
          const time = getTimeFromEvent(e.clientX);
          const mid = (localStart + localEnd) / 2;
          if (time < mid) {
            const newStart = Math.min(time, localEnd - step);
            setLocalStart(newStart);
            if (onChange) onChange({ startTime: newStart, endTime: localEnd });
          } else {
            const newEnd = Math.max(time, localStart + step);
            setLocalEnd(newEnd);
            if (onChange) onChange({ startTime: localStart, endTime: newEnd });
          }
        }}
      >
        {/* Range highlight */}
        <div
          style={{
            position: 'absolute',
            left: `${startPct}%`,
            width: `${rangePct}%`,
            top: 0,
            height: '100%',
            background: 'linear-gradient(90deg, rgba(59,130,246,0.3), rgba(249,115,22,0.3))',
            borderRadius: 8,
            pointerEvents: 'none',
          }}
        />

        {/* Start handle */}
        <div
          onMouseDown={handleMouseDown('start')}
          style={{
            position: 'absolute',
            left: `${startPct}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#3B82F6',
            border: '3px solid #1a1a2e',
            cursor: 'ew-resize',
            zIndex: 2,
            boxShadow: dragging === 'start' ? '0 0 0 4px rgba(59,130,246,0.3)' : '0 2px 8px rgba(0,0,0,0.4)',
            transition: 'box-shadow 0.15s',
          }}
        />

        {/* End handle */}
        <div
          onMouseDown={handleMouseDown('end')}
          style={{
            position: 'absolute',
            left: `${endPct}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#F97316',
            border: '3px solid #1a1a2e',
            cursor: 'ew-resize',
            zIndex: 2,
            boxShadow: dragging === 'end' ? '0 0 0 4px rgba(249,115,22,0.3)' : '0 2px 8px rgba(0,0,0,0.4)',
            transition: 'box-shadow 0.15s',
          }}
        />

        {/* Tick marks */}
        <div style={{ position: 'absolute', bottom: 2, left: 4, right: 4, display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
          {[0, 25, 50, 75, 100].map((pct) => (
            <div key={pct} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 1, height: 6, background: 'rgba(255,255,255,0.12)', marginBottom: 2 }} />
              <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>
                {formatTime(min + (max - min) * (pct / 100))}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Time inputs for precise editing */}
      <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>
            Start (mm:ss)
          </label>
          <input
            type="text"
            value={formatTime(localStart)}
            onChange={(e) => {
              const parts = e.target.value.split(':');
              if (parts.length === 2) {
                const secs = parseInt(parts[0]) * 60 + parseInt(parts[1]);
                if (!isNaN(secs)) {
                  const newStart = clamp(secs);
                  if (newStart < localEnd) {
                    setLocalStart(newStart);
                    if (onChange) onChange({ startTime: newStart, endTime: localEnd });
                  }
                }
              }
            }}
            style={{
              width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)', color: '#3B82F6', fontSize: '0.82rem',
              fontVariantNumeric: 'tabular-nums', outline: 'none',
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>
            End (mm:ss)
          </label>
          <input
            type="text"
            value={formatTime(localEnd)}
            onChange={(e) => {
              const parts = e.target.value.split(':');
              if (parts.length === 2) {
                const secs = parseInt(parts[0]) * 60 + parseInt(parts[1]);
                if (!isNaN(secs)) {
                  const newEnd = clamp(secs);
                  if (newEnd > localStart) {
                    setLocalEnd(newEnd);
                    if (onChange) onChange({ startTime: localStart, endTime: newEnd });
                  }
                }
              }
            }}
            style={{
              width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)', color: '#F97316', fontSize: '0.82rem',
              fontVariantNumeric: 'tabular-nums', outline: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
}
