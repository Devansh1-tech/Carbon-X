import { useState, useRef, useCallback } from "react";

export default function DualRangeSlider({ min, max, step = 1, value, onChange, formatLabel = (v) => v }) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(null);

  const pct = (v) => ((v - min) / (max - min)) * 100;

  const getVal = useCallback((clientX) => {
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const raw = min + ratio * (max - min);
    return Math.round(raw / step) * step;
  }, [min, max, step]);

  const onPointerDown = (handle) => (e) => {
    e.preventDefault();
    setDragging(handle);
    const onMove = (ev) => {
      const v = getVal(ev.clientX);
      if (handle === 0) onChange([Math.min(v, value[1] - step), value[1]]);
      else onChange([value[0], Math.max(v, value[0] + step)]);
    };
    const onUp = () => { setDragging(null); window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div className="pt-2 pb-1 select-none">
      <div ref={trackRef} className="dual-range-track">
        <div className="dual-range-fill" style={{ left: `${pct(value[0])}%`, width: `${pct(value[1]) - pct(value[0])}%` }} />
        <div className="dual-range-thumb" style={{ left: `${pct(value[0])}%` }} onPointerDown={onPointerDown(0)} />
        <div className="dual-range-thumb" style={{ left: `${pct(value[1])}%` }} onPointerDown={onPointerDown(1)} />
      </div>
      <div className="flex justify-between mt-2 text-[11px] text-gray-500">
        <span>{formatLabel(value[0])}</span>
        <span>{formatLabel(value[1])}</span>
      </div>
    </div>
  );
}
