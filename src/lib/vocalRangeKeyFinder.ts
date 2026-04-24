/**
 * Vocal Range Key Finder — 스펙: _DocPlan/KeyCheckPlan.md
 * 계산은 sharp/NOTE_MAP, UI 라벨은 DISPLAY_KEYS.
 */

export type SongRange = {
  originalKey: string;
  min: string;
  max: string;
};

export type KeyStatus = 'Too High' | 'Too Low' | 'Too Wide' | 'Comfortable';

export type ScoreDetail = {
  score: number;
  coverage: number;
  centerScore: number;
  highStress: number;
  lowStress: number;
  totalStress: number;
  stressPenalty: number;
};

export type RecommendedKey = {
  key: string;
  score: number;
  diff: number;
  coverage: number;
  centerScore: number;
  highStress: number;
  lowStress: number;
  totalStress: number;
  status: KeyStatus;
};

export type RecommendationViewModel = {
  topKeys: RecommendedKey[];
  originalKey: RecommendedKey;
  showOriginalSeparately: boolean;
};

export const NOTE_MAP: Record<string, number> = {
  C: 0,
  'C#': 1,
  D: 2,
  'D#': 3,
  E: 4,
  F: 5,
  'F#': 6,
  G: 7,
  'G#': 8,
  A: 9,
  'A#': 10,
  B: 11,
};

export const FLAT_TO_SHARP: Record<string, string> = {
  Bb: 'A#',
  Db: 'C#',
  Eb: 'D#',
  Gb: 'F#',
  Ab: 'G#',
  Cb: 'B',
  Fb: 'E',
  'E#': 'F',
  'B#': 'C',
};

export const DISPLAY_KEYS = [
  'C',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'Gb',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
] as const;

const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export function normalizeKey(key: string): string {
  return FLAT_TO_SHARP[key] ?? key;
}

/** pitch class(0–11) → sharp 이름 */
export function pitchClassToSharpName(pc: number): string {
  const i = ((pc % 12) + 12) % 12;
  return SHARP_NAMES[i];
}

export function parseNote(note: string): { pitch: string; octave: number } {
  const match = note.match(/^([A-G]#?|[A-G]b?)(\d+)$/);
  if (!match) throw new Error(`Invalid note: ${note}`);

  let [, pitch, octaveStr] = match;
  pitch = FLAT_TO_SHARP[pitch] ?? pitch;

  if (NOTE_MAP[pitch] === undefined) {
    throw new Error(`Unknown pitch: ${pitch}`);
  }

  return {
    pitch,
    octave: parseInt(octaveStr, 10),
  };
}

export function noteToNumber(note: string): number {
  const { pitch, octave } = parseNote(note);
  return octave * 12 + NOTE_MAP[pitch];
}

/** MIDI 번호 → NOTE_MAP 키 문자열 (예: 60 → "C4") */
export function midiToNote(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const pitch = pitchClassToSharpName(midi);
  return `${pitch}${octave}`;
}

/**
 * 추천 Key: -6 ~ +6 짧은 경로.
 * 반주 transpose 직접 제어 시에는 transposeSemitone 별도 상태 검토.
 */
export function getTransposeDiff(fromKey: string, toKey: string): number {
  const from = normalizeKey(fromKey);
  const to = normalizeKey(toKey);

  let diff = NOTE_MAP[to] - NOTE_MAP[from];

  if (diff > 6) diff -= 12;
  if (diff < -6) diff += 12;

  return diff;
}

export function getKeyRange(selectedKey: string, song: SongRange): { min: number; max: number } {
  const diff = getTransposeDiff(song.originalKey, selectedKey);
  return {
    min: noteToNumber(song.min) + diff,
    max: noteToNumber(song.max) + diff,
  };
}

const HIGH_STRESS_WEIGHT = 1.5;

export function evaluateKey(
  userMin: number,
  userMax: number,
  keyMin: number,
  keyMax: number,
): ScoreDetail {
  const total = keyMax - keyMin;
  const userRange = userMax - userMin;

  if (total <= 0 || userRange <= 0) {
    return {
      score: 0,
      coverage: 0,
      centerScore: 0,
      highStress: 0,
      lowStress: 0,
      totalStress: 0,
      stressPenalty: 0,
    };
  }

  const overlap = Math.min(userMax, keyMax) - Math.max(userMin, keyMin);
  const coverage = Math.max(0, overlap / total);

  const userCenter = (userMin + userMax) / 2;
  const keyCenter = (keyMin + keyMax) / 2;
  const distance = Math.abs(userCenter - keyCenter);

  const centerScore = Math.max(0, Math.min(1, 1 - distance / userRange));

  const highStress = keyMax > userMax ? (keyMax - userMax) * HIGH_STRESS_WEIGHT : 0;
  const lowStress = keyMin < userMin ? userMin - keyMin : 0;
  const totalStress = highStress + lowStress;
  const stressPenalty = totalStress / userRange;

  const rawScore = coverage * 0.6 + centerScore * 0.3 - stressPenalty * 0.5;

  return {
    score: Math.max(0, Math.min(1, rawScore)),
    coverage,
    centerScore,
    highStress,
    lowStress,
    totalStress,
    stressPenalty,
  };
}

export function getScore(userMin: number, userMax: number, keyMin: number, keyMax: number): number {
  return evaluateKey(userMin, userMax, keyMin, keyMax).score;
}

export function getKeyStatus(
  userMin: number,
  userMax: number,
  keyMin: number,
  keyMax: number,
): KeyStatus {
  const margin = 2;

  const tooHigh = keyMax > userMax + margin;
  const tooLow = keyMin < userMin - margin;

  if (tooHigh && tooLow) return 'Too Wide';
  if (tooHigh) return 'Too High';
  if (tooLow) return 'Too Low';
  return 'Comfortable';
}

export function getRecommendedKeys(
  userMin: number,
  userMax: number,
  song: SongRange,
): RecommendedKey[] {
  return DISPLAY_KEYS.map((key) => {
    const { min, max } = getKeyRange(key, song);
    const detail = evaluateKey(userMin, userMax, min, max);
    const diff = getTransposeDiff(song.originalKey, key);
    const status = getKeyStatus(userMin, userMax, min, max);

    return {
      key,
      score: detail.score,
      diff,
      coverage: detail.coverage,
      centerScore: detail.centerScore,
      highStress: detail.highStress,
      lowStress: detail.lowStress,
      totalStress: detail.totalStress,
      status,
    };
  }).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.totalStress !== b.totalStress) return a.totalStress - b.totalStress;
    return Math.abs(a.diff) - Math.abs(b.diff);
  });
}

export function getRecommendationViewModel(
  userMin: number,
  userMax: number,
  song: SongRange,
): RecommendationViewModel {
  const recommended = getRecommendedKeys(userMin, userMax, song);
  const topKeys = recommended.slice(0, 3);

  const originalKey =
    recommended.find((item) => item.key === song.originalKey) ??
    recommended.find((item) => normalizeKey(item.key) === normalizeKey(song.originalKey));

  if (!originalKey) {
    throw new Error(`Original key not found: ${song.originalKey}`);
  }

  const showOriginalSeparately = !topKeys.some(
    (item) => normalizeKey(item.key) === normalizeKey(song.originalKey),
  );

  return {
    topKeys,
    originalKey,
    showOriginalSeparately,
  };
}

export function getTransposeLabel(diff: number): string {
  if (diff === 0) return '원곡과 동일';

  const direction = diff > 0 ? '올림' : '낮춤';
  const abs = Math.abs(diff);

  let degree = '많이';
  if (abs === 1) degree = '약간';
  else if (abs <= 3) degree = '조금';

  return `원곡 대비 ${diff > 0 ? '+' : ''}${diff} 반음 (${degree} ${direction})`;
}

export function getRecommendationReason(item: RecommendedKey): string {
  if (item.status === 'Too High') {
    return '고음 부담이 있어 조금 낮춘 Key가 더 편할 수 있습니다.';
  }
  if (item.status === 'Too Low') {
    return '저음 부담이 있어 조금 올린 Key가 더 편할 수 있습니다.';
  }
  if (item.status === 'Too Wide') {
    return '곡 음역이 넓어 일부 구간이 부담될 수 있습니다.';
  }
  if (item.centerScore >= 0.85 && item.coverage >= 0.9) {
    return '사용자 음역 중심과 곡 음역이 잘 맞습니다.';
  }
  if (item.coverage >= 0.9) {
    return '대부분의 음이 사용자 음역 안에 들어옵니다.';
  }
  return '전반적인 음역 부담이 가장 적은 Key입니다.';
}

export function assertUserRange(userMin: number, userMax: number): void {
  if (userMin > userMax) throw new Error('Invalid vocal range');

  if (userMax - userMin < 5) {
    console.warn('Vocal range very narrow (< 5 semitones)');
  }
}

export function assertSong(song: SongRange): void {
  if (!song.min || !song.max) throw new Error('Song range missing');

  const originalKey = normalizeKey(song.originalKey);
  if (NOTE_MAP[originalKey] === undefined) {
    throw new Error(`Invalid originalKey: ${song.originalKey}`);
  }

  const min = noteToNumber(song.min);
  const max = noteToNumber(song.max);

  if (min > max) {
    throw new Error(`Invalid song range: ${song.min} ~ ${song.max}`);
  }
}

/** 조표 문자열에서 장·단조 루트를 추정해 DISPLAY_KEYS 스타일 원곡 Key */
export function inferDisplayOriginalKey(chordName: string, chordScalesName?: string): string {
  const text = `${chordName || ''} ${chordScalesName || ''}`.trim();
  const m = text.match(/\b([A-G])(#{1,2}|b{1,2}|♭|♯)?/i);
  let root = 'G';
  if (m) {
    root = m[1].toUpperCase();
    const acc = m[2] || '';
    if (acc === '#' || acc === '♯') root += '#';
    else if (acc === 'b' || acc === '♭') root += 'b';
  }

  const normalized = normalizeKey(root);
  if (NOTE_MAP[normalized] === undefined) return 'G';

  const hit = DISPLAY_KEYS.find((k) => normalizeKey(k) === normalized);
  return hit ?? pitchClassToSharpName(NOTE_MAP[normalized]);
}

/**
 * API에 곡 음역 필드가 없을 때: 루트 3옥타브 ~ 약 19반음 위(대략 루트 기준 5th+2옥) 스팬.
 * 추후 서버 필드로 대체.
 */
export function defaultSongRangeFromDisplayKey(displayKey: string): SongRange {
  const sharpRoot = normalizeKey(displayKey);
  const min = `${sharpRoot}3`;
  const minN = noteToNumber(min);
  const maxN = minN + 19;
  const max = midiToNote(maxN);
  const originalKey =
    DISPLAY_KEYS.find((k) => normalizeKey(k) === sharpRoot) ?? DISPLAY_KEYS[0];
  return {
    originalKey,
    min,
    max,
  };
}

export function keyStatusLabel(s: KeyStatus): string {
  switch (s) {
    case 'Comfortable':
      return '편안';
    case 'Too High':
      return '고음 부담';
    case 'Too Low':
      return '저음 부담';
    case 'Too Wide':
      return '음역 넓음';
    default:
      return s;
  }
}
