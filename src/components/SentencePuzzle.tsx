import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, RotateCcw, Lightbulb, ArrowRight, CheckCircle2 } from 'lucide-react';
import { WEATHER_WORDS, WeatherWordItem } from '../data/weatherWords';
import { WeatherIconGlyph } from './WeatherArtwork';
import { soundEngine } from '../utils/soundEngine';

interface ScrambledToken {
  id: string;
  text: string;
  used: boolean;
}

const QUADRANT_POSITIONS = [
  '0% 0%',     // 0: top-left
  '100% 0%',   // 1: top-right
  '0% 100%',   // 2: bottom-left
  '100% 100%'  // 3: bottom-right
];

function createScrambledQuadrants(): number[] {
  const arr = [0, 1, 2, 3];
  // Guarantee at least one swap so it starts scrambled
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  if (arr.every((v, idx) => v === idx)) {
    [arr[0], arr[1]] = [arr[1], arr[0]];
  }
  return arr;
}

export const SentencePuzzle: React.FC = () => {
  const [levelIndex, setLevelIndex] = useState<number>(0);
  const [puzzleMode, setPuzzleMode] = useState<'DIALOGUE' | 'SPELLING'>('DIALOGUE');
  const [quadrants, setQuadrants] = useState<number[]>(() => createScrambledQuadrants());
  const [selectedQuadIdx, setSelectedQuadIdx] = useState<number | null>(null);

  const [tokens, setTokens] = useState<ScrambledToken[]>([]);
  const [selectedTokenIds, setSelectedTokenIds] = useState<string[]>([]);
  const [hintTier, setHintTier] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>(
    'Step 1: Swap picture tiles to restore the weather card. Step 2: Tap blocks to build the sentence!'
  );

  const currentWeather: WeatherWordItem = WEATHER_WORDS[levelIndex % WEATHER_WORDS.length];

  const targetSequence: string[] =
    puzzleMode === 'DIALOGUE'
      ? ['What’s', 'the', 'weather', 'like?', 'It’s', `${currentWeather.word}.`]
      : currentWeather.word.split('');

  const initTokens = useCallback(
    (weather: WeatherWordItem, mode: 'DIALOGUE' | 'SPELLING') => {
      const raw =
        mode === 'DIALOGUE'
          ? ['What’s', 'the', 'weather', 'like?', 'It’s', `${weather.word}.`]
          : weather.word.split('');

      const list: ScrambledToken[] = raw.map((text, idx) => ({
        id: `${mode}-${idx}-${text}`,
        text,
        used: false
      }));

      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }

      setTokens(list);
      setSelectedTokenIds([]);
      setHintTier(0);
    },
    []
  );

  useEffect(() => {
    setQuadrants(createScrambledQuadrants());
    setSelectedQuadIdx(null);
    initTokens(currentWeather, puzzleMode);
    setStatusMessage(
      `Level ${levelIndex + 1}: Restore the ${currentWeather.colorNameZh} weather picture & build the ${
        puzzleMode === 'DIALOGUE' ? 'dialogue' : 'word spelling'
      }!`
    );
  }, [levelIndex, puzzleMode, currentWeather, initTokens]);

  const isPictureSolved = quadrants.every((val, idx) => val === idx);

  const builtTexts = selectedTokenIds.map(
    (id) => tokens.find((t) => t.id === id)?.text || ''
  );

  const isSequenceSolved =
    builtTexts.length === targetSequence.length &&
    builtTexts.every((val, idx) => val === targetSequence[idx]);

  const handleQuadrantClick = (slotIdx: number) => {
    if (isPictureSolved) return;
    soundEngine.playSfx('pop');

    if (selectedQuadIdx === null) {
      setSelectedQuadIdx(slotIdx);
    } else if (selectedQuadIdx === slotIdx) {
      setSelectedQuadIdx(null);
    } else {
      const next = [...quadrants];
      [next[selectedQuadIdx], next[slotIdx]] = [next[slotIdx], next[selectedQuadIdx]];
      setQuadrants(next);
      setSelectedQuadIdx(null);

      if (next.every((val, idx) => val === idx)) {
        soundEngine.playSfx('correct');
        soundEngine.playWeatherSound(currentWeather.id);
        setStatusMessage(
          `Picture solved! Look, it’s ${currentWeather.word}! Now finish the word blocks on the right.`
        );
      }
    }
  };

  const handleTokenSelect = (token: ScrambledToken) => {
    if (token.used) return;
    const expectedNext = targetSequence[selectedTokenIds.length];

    if (token.text === expectedNext) {
      soundEngine.playSfx('pop');
      const nextSelected = [...selectedTokenIds, token.id];
      setSelectedTokenIds(nextSelected);
      setTokens((prev) =>
        prev.map((t) => (t.id === token.id ? { ...t, used: true } : t))
      );

      if (nextSelected.length === targetSequence.length) {
        soundEngine.playSfx('bingo');
        soundEngine.speakText(
          `What's the weather like? It's ${currentWeather.word}!`
        );
        setStatusMessage(
          `Great job! “What’s the weather like? It’s ${currentWeather.word}.”`
        );
      }
    } else {
      soundEngine.playSfx('wrong');
      setStatusMessage(
        `Try another block! Next expected piece is “${expectedNext}”.`
      );
    }
  };

  const handleUseHint = () => {
    const nextTier = Math.min(hintTier + 1, 3);
    setHintTier(nextTier);
    soundEngine.playSfx('pop');

    if (nextTier === 1) {
      soundEngine.playWeatherSound(currentWeather.id);
      setStatusMessage(
        `Hint 1 (Color & Sound): Theme color is ${currentWeather.colorNameZh} — ${currentWeather.colorSentence}`
      );
    } else if (nextTier === 2) {
      // Auto-place the next required token if not solved
      if (selectedTokenIds.length < targetSequence.length) {
        const expectedNext = targetSequence[selectedTokenIds.length];
        const candidate = tokens.find((t) => !t.used && t.text === expectedNext);
        if (candidate) {
          handleTokenSelect(candidate);
        }
      }
      setQuadrants([0, 1, 2, 3]);
    } else {
      soundEngine.speakText(
        `What's the weather like? It's ${currentWeather.word}!`
      );
      setStatusMessage(
        `Hint 3 (Full Answer): “What’s the weather like? It’s ${currentWeather.word}.” (${currentWeather.spellingNote})`
      );
    }
  };

  const handleResetLevel = () => {
    soundEngine.playSfx('pop');
    setQuadrants(createScrambledQuadrants());
    setSelectedQuadIdx(null);
    initTokens(currentWeather, puzzleMode);
  };

  return (
    <section className="space-y-8">
      {/* Section Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-medium text-slate-500">
            03. Jigsaw &amp; Sentence Builder · 图像拼图与句型积木重组
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-slate-900">
            Weather Puzzle Workshop — 拼天气插画 · 搭英语句子
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setPuzzleMode('DIALOGUE')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                puzzleMode === 'DIALOGUE'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dialogue Puzzle (问答句型积木)
            </button>
            <button
              type="button"
              onClick={() => setPuzzleMode('SPELLING')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                puzzleMode === 'SPELLING'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Letter Spelling (字母自然拼读)
            </button>
          </div>

          <button
            type="button"
            onClick={handleUseHint}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors whitespace-nowrap"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            <span>Hint ({hintTier}/3)</span>
          </button>

          <button
            type="button"
            onClick={handleResetLevel}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Level Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {WEATHER_WORDS.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                soundEngine.playSfx('pop');
                setLevelIndex(idx);
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                levelIndex === idx
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.colorHex }}
              />
              <span>
                Level {idx + 1}: {item.word}
              </span>
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-600">{statusMessage}</p>
      </div>

      {/* Two-Column Puzzle Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 2x2 Picture Jigsaw (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Part 1: 2×2 Weather Picture Jigsaw
              </h2>
              <p className="text-xs text-slate-500">
                点击任意两块拼图即可交换位置，还原天气插画
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-700">
              {isPictureSolved ? '✓ Solved' : 'Swap Tiles'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 aspect-[4/3] rounded-xl bg-slate-100 p-2 border border-slate-200">
            {quadrants.map((pieceId, slotIdx) => {
              const isSelected = selectedQuadIdx === slotIdx;
              const isCorrectSpot = pieceId === slotIdx;
              return (
                <button
                  key={slotIdx}
                  type="button"
                  onClick={() => handleQuadrantClick(slotIdx)}
                  style={{
                    backgroundImage: `url(${currentWeather.image})`,
                    backgroundSize: '200% 200%',
                    backgroundPosition: QUADRANT_POSITIONS[pieceId]
                  }}
                  className={`relative overflow-hidden rounded-lg transition-transform duration-150 ${
                    isSelected
                      ? 'ring-4 ring-sky-500 scale-[0.97]'
                      : isCorrectSpot && isPictureSolved
                      ? 'ring-1 ring-emerald-500/50'
                      : 'hover:opacity-95'
                  }`}
                >
                  {!isPictureSolved && (
                    <span className="absolute bottom-1.5 right-1.5 rounded bg-black/65 px-1.5 py-0.5 font-mono-tabular text-[11px] font-semibold text-white">
                      #{pieceId + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-1 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <WeatherIconGlyph id={currentWeather.id} className="h-4 w-4" />
              <span>
                Color Clue: <strong className="text-slate-900">{currentWeather.colorNameZh}</strong>
              </span>
            </span>
            {!isPictureSolved && (
              <button
                type="button"
                onClick={() => {
                  setQuadrants([0, 1, 2, 3]);
                  soundEngine.playSfx('correct');
                }}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 underline whitespace-nowrap"
              >
                Auto-Complete Picture
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Sentence & Phonics Builder (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {puzzleMode === 'DIALOGUE'
                  ? 'Part 2: Build the Question & Answer'
                  : 'Part 2: Color Phonics Word Spelling'}
              </h2>
              <p className="text-xs text-slate-500">
                {puzzleMode === 'DIALOGUE'
                  ? '按正确语序点击下方单词积木，拼出完整问答句：What’s the weather like? It’s ...'
                  : `按字母顺序拼出 ${currentWeather.zhMeaning} (${currentWeather.spellingNote})`}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                soundEngine.speakText(
                  `What's the weather like? It's ${currentWeather.word}!`
                )
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition-colors whitespace-nowrap"
            >
              <Volume2 className="h-4 w-4" />
              <span>Listen Target</span>
            </button>
          </div>

          {/* Target Slots Tray */}
          <div className={`rounded-xl p-5 border ${currentWeather.surfaceTintClass} border-slate-200`}>
            <p className="text-xs font-medium text-slate-500 mb-3">
              {puzzleMode === 'DIALOGUE'
                ? '天气问答句：天气怎么样？它是' + currentWeather.zhMeaning + '。'
                : `拼写目标：${currentWeather.zhMeaning} (${currentWeather.phonetic})`}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 min-h-[56px]">
              {targetSequence.map((expected, idx) => {
                const placedText = builtTexts[idx];
                const isRootLetter =
                  puzzleMode === 'SPELLING' && idx < currentWeather.rootWord.length;

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-center rounded-xl px-4 py-3 font-display text-lg sm:text-xl font-bold transition-all duration-150 ${
                      placedText
                        ? 'bg-white border-2 border-emerald-500 text-slate-900 shadow-xs'
                        : 'bg-white/60 border-2 border-dashed border-slate-300 text-slate-400 min-w-[68px]'
                    }`}
                  >
                    {placedText ? (
                      puzzleMode === 'SPELLING' ? (
                        <span
                          className={
                            isRootLetter
                              ? currentWeather.rootColorClass
                              : currentWeather.suffixColorClass
                          }
                        >
                          {placedText}
                        </span>
                      ) : (
                        <span>{placedText}</span>
                      )
                    ) : (
                      <span className="text-xs font-sans font-normal text-slate-400">
                        #{idx + 1}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Available Scrambled Word/Letter Blocks */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-3">
              Word / Letter Bank · 点击正确的积木块放入上方横线
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {tokens.map((token) => (
                <button
                  key={token.id}
                  type="button"
                  disabled={token.used}
                  onClick={() => handleTokenSelect(token)}
                  className={`rounded-xl px-4 py-3 font-display text-lg font-bold border-2 transition-all duration-150 whitespace-nowrap ${
                    token.used
                      ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed scale-95'
                      : 'bg-white border-slate-300 text-slate-900 hover:border-sky-500 hover:-translate-y-0.5 active:scale-95 shadow-xs'
                  }`}
                >
                  {token.text}
                </button>
              ))}
            </div>
          </div>

          {/* Completion Banner & Next Level CTA */}
          {isSequenceSolved && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-emerald-950">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold">
                    Awesome! “What’s the weather like? It’s {currentWeather.word}.”
                  </p>
                  <p className="text-xs text-emerald-800">
                    Color Phonics: {currentWeather.spellingNote} · {currentWeather.colorNameZh}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playSfx('pop');
                  setLevelIndex((prev) => (prev + 1) % WEATHER_WORDS.length);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors whitespace-nowrap"
              >
                <span>Next Weather Puzzle</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
