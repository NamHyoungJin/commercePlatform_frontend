/** 88건반 피아노 레이아웃 — PianoKeyboard88 / VocalRangeRail 공통 */

export const PIANO_MIDI_MIN = 21;
export const PIANO_MIDI_MAX = 108;

function isBlackKey(midi: number): boolean {
  const n = ((midi % 12) + 12) % 12;
  return [1, 3, 6, 8, 10].includes(n);
}

function buildWhiteMidis(): number[] {
  const out: number[] = [];
  for (let m = PIANO_MIDI_MIN; m <= PIANO_MIDI_MAX; m++) {
    if (!isBlackKey(m)) out.push(m);
  }
  return out;
}

export const PIANO_WHITE_MIDIS = buildWhiteMidis();
export const PIANO_WHITE_COUNT = PIANO_WHITE_MIDIS.length;

export function buildBlackMidis(): number[] {
  const out: number[] = [];
  for (let m = PIANO_MIDI_MIN; m <= PIANO_MIDI_MAX; m++) {
    if (isBlackKey(m)) out.push(m);
  }
  return out;
}

/** 흰건반 중심(또는 검은건반 경계) 기준 가로 % — 레일 핸들·역매핑에 사용 */
export function midiToPianoCenterPercent(midi: number): number {
  const m = Math.max(PIANO_MIDI_MIN, Math.min(PIANO_MIDI_MAX, midi));
  if (!isBlackKey(m)) {
    const idx = PIANO_WHITE_MIDIS.indexOf(m);
    if (idx >= 0) return ((idx + 0.5) / PIANO_WHITE_COUNT) * 100;
  }
  const lo = m - 1;
  const hi = m + 1;
  const iLo = PIANO_WHITE_MIDIS.indexOf(lo);
  const iHi = PIANO_WHITE_MIDIS.indexOf(hi);
  if (iLo >= 0 && iHi >= 0) return ((iLo + 1) / PIANO_WHITE_COUNT) * 100;
  return ((m - PIANO_MIDI_MIN) / (PIANO_MIDI_MAX - PIANO_MIDI_MIN)) * 100;
}

function whiteLeftEdgePercent(midi: number): number {
  const m = Math.max(PIANO_MIDI_MIN, Math.min(PIANO_MIDI_MAX, Math.round(midi)));
  const pitch = isBlackKey(m) ? m - 1 : m;
  const i = PIANO_WHITE_MIDIS.indexOf(pitch);
  if (i >= 0) return (i / PIANO_WHITE_COUNT) * 100;
  return midiToPianoCenterPercent(m);
}

function whiteRightEdgePercent(midi: number): number {
  const m = Math.max(PIANO_MIDI_MIN, Math.min(PIANO_MIDI_MAX, Math.round(midi)));
  const pitch = isBlackKey(m) ? m + 1 : m;
  const i = PIANO_WHITE_MIDIS.indexOf(pitch);
  if (i >= 0) return ((i + 1) / PIANO_WHITE_COUNT) * 100;
  return midiToPianoCenterPercent(m);
}

export function pianoRangeOverlayPercent(low: number, high: number): { left: number; width: number } {
  const lo = Math.max(PIANO_MIDI_MIN, Math.min(PIANO_MIDI_MAX, Math.min(low, high)));
  const hi = Math.max(PIANO_MIDI_MIN, Math.min(PIANO_MIDI_MAX, Math.max(low, high)));
  const L = whiteLeftEdgePercent(lo);
  const R = whiteRightEdgePercent(hi);
  const w = Math.max(R - L, (1 / PIANO_WHITE_COUNT) * 100 * 0.25);
  return { left: L, width: w };
}

/** 클릭/드래그 X% → 가장 가까운 MIDI (건반 중심 거리) */
export function pianoPercentToNearestMidi(percent: number): number {
  const p = Math.max(0, Math.min(100, percent));
  let best = PIANO_MIDI_MIN;
  let bestD = Infinity;
  for (let m = PIANO_MIDI_MIN; m <= PIANO_MIDI_MAX; m++) {
    const d = Math.abs(midiToPianoCenterPercent(m) - p);
    if (d < bestD) {
      bestD = d;
      best = m;
    }
  }
  return best;
}

export function blackKeyJunctionPercents(): { midi: number; leftPct: number }[] {
  return buildBlackMidis()
    .map((b) => {
      const prevW = b - 1;
      const idx = PIANO_WHITE_MIDIS.indexOf(prevW);
      if (idx < 0) return null;
      return { midi: b, leftPct: ((idx + 1) / PIANO_WHITE_COUNT) * 100 };
    })
    .filter(Boolean) as { midi: number; leftPct: number }[];
}
