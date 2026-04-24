'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Score } from '@/lib/scoresApi';
import {
  assertSong,
  assertUserRange,
  defaultSongRangeFromDisplayKey,
  DISPLAY_KEYS,
  evaluateKey,
  getKeyRange,
  getKeyStatus,
  getRecommendedKeys,
  getRecommendationReason,
  getRecommendationViewModel,
  getTransposeDiff,
  getTransposeLabel,
  inferDisplayOriginalKey,
  keyStatusLabel,
  midiToNote,
  noteToNumber,
  type RecommendedKey,
} from '@/lib/vocalRangeKeyFinder';
import KeyHeatStrip12 from '@/components/scores/KeyHeatStrip12';
import PianoKeyboard88 from '@/components/scores/PianoKeyboard88';
import VocalRangeRail from '@/components/scores/VocalRangeRail';

const panelClass =
  'mt-6 rounded-xl border border-neutral-800 bg-[#101010] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:p-6';

const subBtn =
  'rounded-lg border border-neutral-700 bg-neutral-900/80 px-3 py-1.5 text-xs font-medium text-neutral-200 transition hover:border-neutral-500 hover:bg-neutral-800';

const keyChip =
  'rounded-lg border px-3 py-2 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500/70';

/** MIDI 21(A0) ~ 108(C8) — 드래그 레일과 동일 범위, 라벨은 flat 선호 DISPLAY 패턴 */
function buildNoteSelectOptions(): { midi: number; label: string }[] {
  const out: { midi: number; label: string }[] = [];
  for (let midi = 21; midi <= 108; midi++) {
    const raw = midiToNote(midi);
    const m = raw.match(/^([A-G]#?)(\d+)$/);
    if (!m) continue;
    const [, sh, oct] = m;
    const display =
      DISPLAY_KEYS.find((k) => {
        try {
          return noteToNumber(`${k}${oct}`) === midi;
        } catch {
          return false;
        }
      }) ?? sh;
    out.push({ midi, label: `${display}${oct}` });
  }
  return out;
}

const NOTE_OPTIONS = buildNoteSelectOptions();

function labelForMidi(midi: number): string {
  const hit = NOTE_OPTIONS.find((o) => o.midi === midi);
  return hit?.label ?? midiToNote(midi);
}

/** 기준 음역 대비 +1옥타브(실제 프리셋 적용 값) */
const RANGE_PRESETS: { id: string; label: string; low: number; high: number }[] = [
  { id: 'male', label: '남성 일반', low: noteToNumber('A3'), high: noteToNumber('F5') },
  { id: 'female', label: '여성 일반', low: noteToNumber('C4'), high: noteToNumber('A5') },
  { id: 'tenor', label: '테너', low: noteToNumber('C4'), high: noteToNumber('G5') },
  { id: 'alto', label: '알토', low: noteToNumber('F4'), high: noteToNumber('D6') },
];

function RecommendedRow({
  item,
  rank,
  active,
  onPick,
}: {
  item: RecommendedKey;
  rank?: number;
  active: boolean;
  onPick: (key: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPick(item.key)}
      className={`${keyChip} w-full ${
        active
          ? 'border-orange-500/70 bg-orange-950/40 text-white ring-1 ring-orange-500/30'
          : 'border-neutral-700 bg-neutral-900/50 text-neutral-200 hover:border-neutral-500'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          {rank != null ? (
            <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-neutral-800 text-[10px] font-bold text-orange-400">
              {rank}
            </span>
          ) : null}
          <span className="font-semibold text-white">{item.key}</span>
          <span className="ml-2 text-xs text-neutral-500">적합도 {Math.round(item.score * 100)}%</span>
        </div>
        <span className="shrink-0 text-[11px] text-neutral-500">{keyStatusLabel(item.status)}</span>
      </div>
      <p className="mt-1.5 text-[11px] leading-snug text-neutral-400">{getRecommendationReason(item)}</p>
      <p className="mt-1 text-[11px] text-neutral-500">{getTransposeLabel(item.diff)}</p>
    </button>
  );
}

export default function VocalRangeKeyFinderSection({ score }: { score: Score }) {
  const displayKey = useMemo(
    () => inferDisplayOriginalKey(score.chord_name || '', score.chord_scales_name),
    [score.chord_name, score.chord_scales_name],
  );

  const song = useMemo(() => defaultSongRangeFromDisplayKey(displayKey), [displayKey]);

  const songOk = useMemo(() => {
    try {
      assertSong(song);
      return true;
    } catch {
      return false;
    }
  }, [song]);

  const [userMin, setUserMin] = useState(() => noteToNumber('A3'));
  const [userMax, setUserMax] = useState(() => noteToNumber('D5'));
  const [selectedKey, setSelectedKey] = useState(song.originalKey);

  useEffect(() => {
    setSelectedKey(song.originalKey);
    setUserMin(noteToNumber('A3'));
    setUserMax(noteToNumber('D5'));
  }, [score.score_sid, song.originalKey]);

  const vm = useMemo(() => {
    try {
      assertUserRange(userMin, userMax);
      return getRecommendationViewModel(userMin, userMax, song);
    } catch {
      return null;
    }
  }, [userMin, userMax, song]);

  const twelveKeys = useMemo(() => {
    try {
      if (userMin >= userMax) return null;
      return getRecommendedKeys(userMin, userMax, song);
    } catch {
      return null;
    }
  }, [userMin, userMax, song]);

  const pianoSongRange = useMemo(() => {
    try {
      return getKeyRange(selectedKey, song);
    } catch {
      return { min: 0, max: 0 };
    }
  }, [selectedKey, song]);

  const selectedDetail = useMemo(() => {
    try {
      const { min, max } = getKeyRange(selectedKey, song);
      const detail = evaluateKey(userMin, userMax, min, max);
      const status = getKeyStatus(userMin, userMax, min, max);
      const diff = getTransposeDiff(song.originalKey, selectedKey);
      const pseudo: RecommendedKey = {
        key: selectedKey,
        score: detail.score,
        diff,
        coverage: detail.coverage,
        centerScore: detail.centerScore,
        highStress: detail.highStress,
        lowStress: detail.lowStress,
        totalStress: detail.totalStress,
        status,
      };
      return { detail, pseudo, min, max };
    } catch {
      return null;
    }
  }, [selectedKey, song, userMin, userMax]);

  const applyPreset = useCallback((low: number, high: number) => {
    setUserMin(low);
    setUserMax(high);
  }, []);

  const setUserRange = useCallback((min: number, max: number) => {
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    if (hi <= lo) return;
    setUserMin(lo);
    setUserMax(hi);
  }, []);

  const lowLabel = useMemo(() => labelForMidi(userMin), [userMin]);
  const highLabel = useMemo(() => labelForMidi(userMax), [userMax]);

  const onPickKey = useCallback((key: string) => {
    setSelectedKey(key);
  }, []);

  if (!songOk) return null;

  return (
    <section className={panelClass} aria-labelledby="vocal-key-finder-heading">
      <div className="flex flex-col gap-1 border-b border-neutral-800/90 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 id="vocal-key-finder-heading" className="text-lg font-semibold text-white md:text-xl">
            음역·Key 추천
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-neutral-500 md:text-sm">
            조표·대표 음역을 바탕으로 편하게 부를 수 있는 Key를 추천합니다. 내 음역을 맞추면 Top 3와 원곡 비교를
            볼 수 있습니다.
          </p>
        </div>
        <p className="mt-2 text-xs text-neutral-500 md:mt-0 md:text-right">
          원곡 조: <span className="font-medium text-neutral-300">{song.originalKey}</span>
          <span className="text-neutral-600"> · </span>
          추정 음역 <span className="tabular-nums text-neutral-400">{song.min}</span> ~{' '}
          <span className="tabular-nums text-neutral-400">{song.max}</span>
          <span className="block text-[10px] text-neutral-600">곡 음역은 조표 기준 추정입니다.</span>
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">내 음역 프리셋</span>
          <div className="flex flex-wrap gap-2">
            {RANGE_PRESETS.map((p) => (
              <button key={p.id} type="button" className={subBtn} onClick={() => applyPreset(p.low, p.high)}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-3 sm:max-w-md">
          <label className="block text-[11px] text-neutral-500">
            최저
            <select
              className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-2 py-2 text-sm text-neutral-100"
              value={userMin}
              onChange={(e) => setUserMin(Number(e.target.value))}
            >
              {NOTE_OPTIONS.map((o) => (
                <option key={`l-${o.midi}`} value={o.midi} disabled={o.midi >= userMax}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[11px] text-neutral-500">
            최고
            <select
              className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-2 py-2 text-sm text-neutral-100"
              value={userMax}
              onChange={(e) => setUserMax(Number(e.target.value))}
            >
              {NOTE_OPTIONS.map((o) => (
                <option key={`h-${o.midi}`} value={o.midi} disabled={o.midi <= userMin}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {twelveKeys ? (
        <div className="mt-4">
          <KeyHeatStrip12 items={twelveKeys} selectedKey={selectedKey} onPick={onPickKey} />
        </div>
      ) : null}

      <div className="mt-4 rounded-lg border border-neutral-800/90 bg-neutral-950/40 px-2 py-3 sm:px-3">
        <PianoKeyboard88
          userMin={userMin}
          userMax={userMax}
          songMin={pianoSongRange.min}
          songMax={pianoSongRange.max}
        />
        <VocalRangeRail
          userMin={userMin}
          userMax={userMax}
          onUserRangeChange={setUserRange}
          lowLabel={lowLabel}
          highLabel={highLabel}
        />
      </div>

      {userMax - userMin < 5 ? (
        <p className="mt-3 text-xs text-amber-600/90">음역 폭이 좁습니다. 최저·최고를 넓혀 주세요.</p>
      ) : null}

      {vm ? (
        <div className="mt-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-neutral-200">추천 Top 3</h3>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {vm.topKeys.map((item, i) => (
                <RecommendedRow
                  key={item.key}
                  item={item}
                  rank={i + 1}
                  active={selectedKey === item.key}
                  onPick={onPickKey}
                />
              ))}
            </div>
          </div>

          {vm.showOriginalSeparately ? (
            <div>
              <h3 className="text-sm font-semibold text-neutral-200">
                원곡 Key 비교 <span className="text-xs font-normal text-neutral-500">(Top3에 없음)</span>
              </h3>
              <div className="mt-2 max-w-md">
                <RecommendedRow
                  item={vm.originalKey}
                  active={selectedKey === vm.originalKey.key}
                  onPick={onPickKey}
                />
              </div>
            </div>
          ) : null}

          <div className="rounded-lg border border-neutral-800/80 bg-neutral-950/60 p-4">
            <h3 className="text-sm font-semibold text-orange-200/90">선택 Key: {selectedKey}</h3>
            {selectedDetail ? (
              <dl className="mt-3 space-y-1.5 text-sm text-neutral-300">
                <div className="flex flex-wrap gap-x-2">
                  <dt className="text-neutral-500">적합도</dt>
                  <dd className="font-medium tabular-nums">{Math.round(selectedDetail.detail.score * 100)}%</dd>
                </div>
                <div className="flex flex-wrap gap-x-2">
                  <dt className="text-neutral-500">원곡 대비</dt>
                  <dd>{getTransposeLabel(selectedDetail.pseudo.diff)}</dd>
                </div>
                <div className="flex flex-wrap gap-x-2">
                  <dt className="text-neutral-500">상태</dt>
                  <dd>{keyStatusLabel(selectedDetail.pseudo.status)}</dd>
                </div>
                <div className="pt-1">
                  <dt className="sr-only">설명</dt>
                  <dd className="text-xs leading-relaxed text-neutral-400">
                    {getRecommendationReason(selectedDetail.pseudo)}
                  </dd>
                </div>
              </dl>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-red-400/90">음역 설정이 올바른지 확인해 주세요.</p>
      )}
    </section>
  );
}
