'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { midiToPianoCenterPercent, pianoPercentToNearestMidi } from '@/lib/pianoKeyboardLayout';

type DragEnd = 'min' | 'max' | null;

type VocalRangeRailProps = {
  userMin: number;
  userMax: number;
  onUserRangeChange: (min: number, max: number) => void;
  lowLabel: string;
  highLabel: string;
};

/**
 * 건반과 동일 좌표계(흰건반 중심 %)로 최저·최고 핸들을 드래그.
 * 드롭다운과 동기화하려면 부모 state를 onUserRangeChange로 갱신.
 */
export default function VocalRangeRail({
  userMin,
  userMax,
  onUserRangeChange,
  lowLabel,
  highLabel,
}: VocalRangeRailProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragEnd>(null);

  const lo = Math.min(userMin, userMax);
  const hi = Math.max(userMin, userMax);
  const minPct = midiToPianoCenterPercent(lo);
  const maxPct = midiToPianoCenterPercent(hi);

  const clientXToMidi = useCallback((clientX: number) => {
    const el = trackRef.current;
    if (!el) return lo;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / Math.max(rect.width, 1)) * 100;
    return pianoPercentToNearestMidi(pct);
  }, [lo]);

  useEffect(() => {
    if (!drag) return;

    const onMove = (e: PointerEvent) => {
      const midi = clientXToMidi(e.clientX);
      if (drag === 'min') {
        const next = Math.min(midi, hi - 1);
        onUserRangeChange(Math.max(21, next), hi);
      } else {
        const next = Math.max(midi, lo + 1);
        onUserRangeChange(lo, Math.min(108, next));
      }
    };

    const onUp = () => setDrag(null);

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [drag, clientXToMidi, hi, lo, onUserRangeChange]);

  const onTrackPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-handle]')) return;
    const el = trackRef.current;
    if (!el) return;
    const midi = clientXToMidi(e.clientX);
    const dMin = Math.abs(midi - lo);
    const dMax = Math.abs(midi - hi);
    if (dMin <= dMax) {
      const next = Math.min(midi, hi - 1);
      onUserRangeChange(Math.max(21, next), hi);
    } else {
      const next = Math.max(midi, lo + 1);
      onUserRangeChange(lo, Math.min(108, next));
    }
  };

  const handleCls =
    'absolute bottom-0 z-10 flex -translate-x-1/2 cursor-grab touch-none flex-col items-center active:cursor-grabbing';

  return (
    <div className="mt-3 w-full px-0.5">
      <p className="mb-1 text-center text-[11px] font-medium tracking-wide text-neutral-500">내 음역</p>

      <div
        ref={trackRef}
        role="slider"
        aria-label="음역 범위 조절"
        className="relative mx-auto h-12 w-full max-w-full touch-none select-none"
        onPointerDown={onTrackPointerDown}
      >
        {/* 기준선 */}
        <div className="absolute bottom-[11px] left-0 right-0 h-px bg-neutral-600" />

        {/* 선택 구간 */}
        <div
          className="pointer-events-none absolute bottom-[11px] h-[3px] rounded-full bg-cyan-500/55"
          style={{
            left: `${minPct}%`,
            width: `${Math.max(maxPct - minPct, 0.4)}%`,
            transform: 'translateX(0)',
          }}
        />

        {/* 최저 핸들 — 위를 향한 오각형 느낌 */}
        <button
          type="button"
          data-handle="min"
          className={handleCls}
          style={{ left: `${minPct}%` }}
          onPointerDown={(e) => {
            e.stopPropagation();
            setDrag('min');
          }}
          aria-label={`최저 음 ${lowLabel}`}
        >
          <span className="mb-0.5 rounded border border-neutral-500 bg-neutral-800 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-neutral-100 shadow">
            {lowLabel}
          </span>
          <span
            className="h-0 w-0 border-x-[7px] border-b-[9px] border-x-transparent border-b-neutral-500 drop-shadow-sm"
            aria-hidden
          />
        </button>

        <button
          type="button"
          data-handle="max"
          className={handleCls}
          style={{ left: `${maxPct}%` }}
          onPointerDown={(e) => {
            e.stopPropagation();
            setDrag('max');
          }}
          aria-label={`최고 음 ${highLabel}`}
        >
          <span className="mb-0.5 rounded border border-neutral-500 bg-neutral-800 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-neutral-100 shadow">
            {highLabel}
          </span>
          <span
            className="h-0 w-0 border-x-[7px] border-b-[9px] border-x-transparent border-b-neutral-500 drop-shadow-sm"
            aria-hidden
          />
        </button>
      </div>
    </div>
  );
}
