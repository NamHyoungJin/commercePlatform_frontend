'use client';

import { useMemo } from 'react';
import {
  blackKeyJunctionPercents,
  midiToPianoCenterPercent,
  PIANO_WHITE_COUNT,
  PIANO_WHITE_MIDIS,
  pianoRangeOverlayPercent,
} from '@/lib/pianoKeyboardLayout';

type PianoKeyboard88Props = {
  userMin: number;
  userMax: number;
  songMin: number;
  songMax: number;
};

/**
 * 실제 피아노 배치: 52흰 + 36검. 레이아웃은 pianoKeyboardLayout과 동기.
 */
export default function PianoKeyboard88({ userMin, userMax, songMin, songMax }: PianoKeyboard88Props) {
  const userLo = Math.min(userMin, userMax);
  const userHi = Math.max(userMin, userMax);
  const songLo = Math.min(songMin, songMax);
  const songHi = Math.max(songMin, songMax);

  const blackPositions = useMemo(() => blackKeyJunctionPercents(), []);

  const songOv = pianoRangeOverlayPercent(songLo, songHi);
  const userOv = pianoRangeOverlayPercent(userLo, userHi);

  const c4Idx = PIANO_WHITE_MIDIS.indexOf(60);
  const c4LeftPct =
    c4Idx >= 0 ? ((c4Idx + 0.5) / PIANO_WHITE_COUNT) * 100 : midiToPianoCenterPercent(60);

  const blackW = `calc((100% / ${PIANO_WHITE_COUNT}) * 0.58)`;

  return (
    <div className="w-full">
      <div className="w-full overflow-x-hidden pb-1">
        <div className="relative w-full select-none overflow-hidden rounded-md ring-1 ring-black/40" style={{ height: '8.25rem' }}>
          {songOv.width > 0 ? (
            <div
              className="pointer-events-none absolute bottom-1 top-0 z-0 bg-emerald-500/40 ring-1 ring-emerald-400/40"
              style={{
                left: `${songOv.left}%`,
                width: `${songOv.width}%`,
              }}
              aria-hidden
            />
          ) : null}

          {userOv.width > 0 ? (
            <div
              className="pointer-events-none absolute bottom-1 top-0 z-[1] bg-cyan-400/20 ring-1 ring-cyan-300/30"
              style={{
                left: `${userOv.left}%`,
                width: `${userOv.width}%`,
              }}
              aria-hidden
            />
          ) : null}

          <div className="absolute inset-0 z-10 flex h-full w-full min-w-0 flex-row divide-x divide-[#0a0a0a]">
            {PIANO_WHITE_MIDIS.map((m) => (
              <div key={m} className="relative flex min-h-0 min-w-0 flex-1 flex-col">
                <div
                  className="h-full w-full min-h-0 rounded-b-[4px] border-t border-stone-300/60 bg-gradient-to-b from-stone-50 via-stone-100 to-stone-300/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_2px_3px_rgba(0,0,0,0.12)]"
                  title={`MIDI ${m}`}
                />
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute inset-0 z-20">
            {blackPositions.map(({ midi, leftPct }) => (
              <div
                key={midi}
                className="absolute top-0 -translate-x-1/2"
                style={{
                  left: `${leftPct}%`,
                  height: '58%',
                  width: blackW,
                  minWidth: '3px',
                  maxWidth: '14px',
                }}
                title={`MIDI ${midi}`}
              >
                <div className="h-full w-full rounded-b-[3px] border-x border-b border-black/95 bg-gradient-to-b from-neutral-500 via-neutral-800 to-neutral-950 shadow-[0_2px_5px_rgba(0,0,0,0.5)]" />
              </div>
            ))}
          </div>

          <div
            className="pointer-events-none absolute bottom-1.5 z-[40] flex justify-center"
            style={{ left: `${c4LeftPct}%`, width: `${100 / PIANO_WHITE_COUNT}%`, transform: 'translateX(-50%)' }}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-500 bg-neutral-600/95 text-[10px] font-bold text-white shadow">
              C
            </span>
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-800/80 pt-2 text-[10px] text-neutral-500">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-2 w-4 rounded-sm bg-emerald-500/55 ring-1 ring-emerald-400/40" aria-hidden />
          곡 음역 (선택 Key 기준)
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-2 w-4 rounded-sm bg-cyan-400/35 ring-1 ring-cyan-300/30" aria-hidden />
          내 음역
        </span>
        <span className="tabular-nums text-neutral-600">88건반 · 52흰 + 36검 · A0–C8</span>
      </div>
    </div>
  );
}
