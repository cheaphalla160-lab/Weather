import React, { useState, useCallback, useMemo } from 'react';
import { Volume2, RotateCcw, Radio, CheckCircle2, HelpCircle } from 'lucide-react';
import { WEATHER_WORDS, WeatherId, WeatherWordItem } from '../data/weatherWords';
import { WeatherArtwork, WeatherIconGlyph } from './WeatherArtwork';
import { soundEngine } from '../utils/soundEngine';

interface BingoTile {
  index: number;
  isFreeCenter: boolean;
  weather: WeatherWordItem | null;
  variant: 'PICTURE' | 'COLOR_SENTENCE' | 'FREE';
  stamped: boolean;
}

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generateBingoGrid(): BingoTile[] {
  const shuffledSix = shuffleArray(WEATHER_WORDS);
  const bonusTwo = shuffleArray(WEATHER_WORDS).slice(0, 2);

  const eightItems: Array<{ item: WeatherWordItem; variant: 'PICTURE' | 'COLOR_SENTENCE' }> = [
    ...shuffledSix.map((item) => ({ item, variant: 'PICTURE' as const })),
    ...bonusTwo.map((item) => ({ item, variant: 'COLOR_SENTENCE' as const }))
  ];

  const randomizedEight = shuffleArray(eightItems);
  const tiles: BingoTile[] = [];
  let ptr = 0;

  for (let i = 0; i < 9; i++) {
    if (i === 4) {
      tiles.push({
        index: i,
        isFreeCenter: true,
        weather: null,
        variant: 'FREE',
        stamped: true
      });
    } else {
      const entry = randomizedEight[ptr++];
      tiles.push({
        index: i,
        isFreeCenter: false,
        weather: entry.item,
        variant: entry.variant,
        stamped: false
      });
    }
  }
  return tiles;
}

export const WeatherBingo: React.FC = () => {
  const [tiles, setTiles] = useState<BingoTile[]>(() => generateBingoGrid());
  const [callDeck, setCallDeck] = useState<WeatherWordItem[]>(() => shuffleArray(WEATHER_WORDS));
  const [callIndex, setCallIndex] = useState<number>(-1);
  const [difficulty, setDifficulty] = useState<'VISUAL' | 'LISTENING'>('VISUAL');
  const [feedbackMsg, setFeedbackMsg] = useState<string>(
    'Click “Call Next Weather” to start the Classroom Bingo broadcast!'
  );
  const [feedbackState, setFeedbackState] = useState<'IDLE' | 'SUCCESS' | 'WARN'>('IDLE');
  const [score, setScore] = useState<number>(0);

  const currentCalledWeather: WeatherWordItem | null =
    callIndex >= 0 && callIndex < callDeck.length ? callDeck[callIndex] : null;

  const calledHistoryIds = useMemo(() => {
    if (callIndex < 0) return new Set<WeatherId>();
    return new Set(callDeck.slice(0, callIndex + 1).map((w) => w.id));
  }, [callDeck, callIndex]);

  const completedLines = useMemo(() => {
    return WINNING_LINES.filter((line) => line.every((idx) => tiles[idx]?.stamped));
  }, [tiles]);

  const winningTileIndices = useMemo(() => {
    const set = new Set<number>();
    completedLines.forEach((line) => line.forEach((idx) => set.add(idx)));
    return set;
  }, [completedLines]);

  const handleNewGame = useCallback(() => {
    soundEngine.playSfx('pop');
    setTiles(generateBingoGrid());
    setCallDeck(shuffleArray(WEATHER_WORDS));
    setCallIndex(-1);
    setScore(0);
    setFeedbackState('IDLE');
    setFeedbackMsg('Fresh Bingo card dealt! Click “Call Next Weather” to begin.');
  }, []);

  const handleCallNext = () => {
    const nextIdx = callIndex + 1;
    if (nextIdx >= callDeck.length) {
      // Reshuffle if all 6 have been called
      const freshDeck = shuffleArray(WEATHER_WORDS);
      setCallDeck(freshDeck);
      setCallIndex(0);
      const target = freshDeck[0];
      soundEngine.playWeatherSound(target.id);
      soundEngine.speakText(`What's the weather like? It's ${target.word}!`);
      setFeedbackState('IDLE');
      setFeedbackMsg(`Broadcast: “What’s the weather like? — It’s ${target.word}!” Find & stamp it!`);
      return;
    }

    setCallIndex(nextIdx);
    const target = callDeck[nextIdx];
    soundEngine.playWeatherSound(target.id);
    soundEngine.speakText(`What's the weather like? It's ${target.word}!`);
    setFeedbackState('IDLE');
    setFeedbackMsg(
      difficulty === 'VISUAL'
        ? `Caller asks: “What’s the weather like?” → Answer: “It’s ${target.word}!”`
        : `Listening Clue: Color is ${target.colorNameZh}. Tap the matching weather square!`
    );
  };

  const handleReplayAudio = () => {
    if (!currentCalledWeather) {
      soundEngine.speakText("What's the weather like?");
      return;
    }
    soundEngine.playWeatherSound(currentCalledWeather.id);
    soundEngine.speakText(
      `What's the weather like? It's ${currentCalledWeather.word}!`
    );
  };

  const handleTileClick = (tile: BingoTile) => {
    if (tile.isFreeCenter) {
      soundEngine.playSfx('pop');
      soundEngine.speakText("What's the weather like?");
      return;
    }

    if (tile.stamped) {
      if (tile.weather) {
        soundEngine.speakText(`It's ${tile.weather.word}.`);
      }
      return;
    }

    if (!currentCalledWeather) {
      soundEngine.playSfx('wrong');
      setFeedbackState('WARN');
      setFeedbackMsg('Teacher Tip: Please click “Call Next Weather” first to broadcast a weather clue!');
      return;
    }

    if (tile.weather && calledHistoryIds.has(tile.weather.id)) {
      const nextTiles = tiles.map((t) =>
        t.index === tile.index ? { ...t, stamped: true } : t
      );
      setTiles(nextTiles);

      const newLines = WINNING_LINES.filter((line) =>
        line.every((idx) => nextTiles[idx]?.stamped)
      );

      if (newLines.length > completedLines.length) {
        soundEngine.playSfx('bingo');
        soundEngine.speakText(`Bingo! Awesome job! It's ${tile.weather.word}!`);
        setScore((s) => s + 30);
        setFeedbackState('SUCCESS');
        setFeedbackMsg(
          `BINGO! 3 in a row completed with “It’s ${tile.weather.word}!” (+30 pts)`
        );
      } else {
        soundEngine.playSfx('correct');
        soundEngine.speakText(`Yes! It's ${tile.weather.word}!`);
        setScore((s) => s + 10);
        setFeedbackState('SUCCESS');
        setFeedbackMsg(
          `Correct! “What’s the weather like? It’s ${tile.weather.word}!” (+10 pts)`
        );
      }
    } else {
      soundEngine.playSfx('wrong');
      setFeedbackState('WARN');
      setFeedbackMsg(
        `Not quite! That square is “It’s ${tile.weather?.word}”. Listen again for “It’s ${currentCalledWeather.word}!”`
      );
    }
  };

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-medium text-slate-500">
            02. Listening &amp; Recognition Game · 3×3 课堂天气宾果游戏
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-slate-900">
            Weather Radio Bingo — 听音辨色连连看
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setDifficulty('VISUAL');
                soundEngine.playSfx('pop');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                difficulty === 'VISUAL'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Visual + Audio (图文播报)
            </button>
            <button
              type="button"
              onClick={() => {
                setDifficulty('LISTENING');
                soundEngine.playSfx('pop');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                difficulty === 'LISTENING'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Blind Listening + Color (盲听辨色)
            </button>
          </div>

          <button
            type="button"
            onClick={handleNewGame}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>New Bingo Card (换卡)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Zone: Weather Radio Caller Station (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <Radio className="h-5 w-5 text-sky-600" />
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Weather Broadcast Station
                </h2>
                <p className="text-xs text-slate-500">
                  点击播报按钮，全班齐问 “What’s the weather like?”
                </p>
              </div>
            </div>
            <div className="text-right font-mono-tabular">
              <span className="text-xs text-slate-500">Bingo Lines: </span>
              <strong className="text-sm text-emerald-700">{completedLines.length}</strong>
              <span className="mx-1.5 text-slate-300">·</span>
              <span className="text-xs text-slate-500">Score: </span>
              <strong className="text-sm text-slate-900">{score}</strong>
            </div>
          </div>

          {/* Active Broadcast Card */}
          <div className="rounded-xl bg-slate-50 p-5 border border-slate-200/80">
            {currentCalledWeather ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Current Call #{callIndex + 1} of 6</span>
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: currentCalledWeather.colorHex }}
                    />
                    <span>Color Clue: {currentCalledWeather.colorNameZh}</span>
                  </span>
                </div>

                {difficulty === 'VISUAL' ? (
                  <div className="space-y-3">
                    <WeatherArtwork
                      item={currentCalledWeather}
                      aspectClass="aspect-[16/9]"
                      hideColorOverlay={true}
                    />
                    <div>
                      <p className="text-xs text-slate-500">
                        Q: What’s the weather like?
                      </p>
                      <p className="font-display text-2xl font-bold text-slate-900 mt-0.5">
                        A: “It’s{' '}
                        <span className={currentCalledWeather.rootColorClass}>
                          {currentCalledWeather.rootWord}
                        </span>
                        <span className={currentCalledWeather.suffixColorClass}>
                          {currentCalledWeather.suffix}
                        </span>
                        !”
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center space-y-3">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                      <HelpCircle className="h-8 w-8" />
                    </div>
                    <p className="font-display text-xl font-semibold text-slate-900">
                      “What’s the weather like?”
                    </p>
                    <p className="text-sm text-slate-600">
                      Listen carefully to the voice &amp; color clue:{' '}
                      <strong className="text-slate-900">
                        {currentCalledWeather.colorNameZh}
                      </strong>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center space-y-2">
                <p className="font-display text-lg font-semibold text-slate-800">
                  Ready to Broadcast!
                </p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Press “Call Next Weather” below to play the weather sound effect and announce the target sentence.
                </p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleCallNext}
                className="flex-1 rounded-lg bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-sky-700 transition-colors whitespace-nowrap"
              >
                {callIndex < 0 ? 'Start Broadcast (开始播报)' : 'Call Next Weather (下一个天气)'}
              </button>

              <button
                type="button"
                onClick={handleReplayAudio}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                <Volume2 className="h-4 w-4" />
                <span>Replay Audio</span>
              </button>
            </div>
          </div>

          {/* Status Feedback Banner (Non-hue-only with explicit icon/text) */}
          <div
            className={`rounded-xl p-3.5 text-xs font-medium flex items-start gap-2.5 ${
              feedbackState === 'SUCCESS'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : feedbackState === 'WARN'
                ? 'bg-amber-50 text-amber-900 border border-amber-200'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{feedbackMsg}</span>
          </div>

          {/* Called History Tracker */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">
              Called Weather History · 已播报的单词 ({calledHistoryIds.size}/6)
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {WEATHER_WORDS.map((w) => {
                const isCalled = calledHistoryIds.has(w.id);
                return (
                  <span
                    key={w.id}
                    className={`font-medium ${
                      isCalled ? 'text-slate-900 underline decoration-sky-500 decoration-2' : 'text-slate-400'
                    }`}
                  >
                    {isCalled ? `✓ ${w.word}` : `· ${w.word}`}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Zone: 3x3 Interactive Bingo Grid (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                3×3 Weather Bingo Card
              </h2>
              <p className="text-xs text-slate-500">
                横排、竖排或斜排连成 3 格即可达成 BINGO！部分格子为“颜色句子挑战格”。
              </p>
            </div>
            {completedLines.length > 0 && (
              <span className="text-xs font-semibold text-emerald-700">
                ★ BINGO ACHIEVED ({completedLines.length} {completedLines.length === 1 ? 'Line' : 'Lines'})
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {tiles.map((tile) => {
              const isWinningTile = winningTileIndices.has(tile.index);

              if (tile.isFreeCenter) {
                return (
                  <button
                    key={tile.index}
                    type="button"
                    onClick={() => handleTileClick(tile)}
                    className={`relative flex flex-col items-center justify-center rounded-xl p-3 sm:p-4 text-center border-2 transition-transform duration-150 active:scale-95 min-h-[130px] sm:min-h-[160px] ${
                      isWinningTile
                        ? 'bg-amber-50 border-amber-500'
                        : 'bg-sky-50/70 border-sky-300'
                    }`}
                  >
                    <span className="text-xs font-semibold text-sky-700">
                      ★ FREE SPACE ★
                    </span>
                    <p className="mt-1.5 font-display text-sm sm:text-base font-bold text-slate-900">
                      What’s the weather like?
                    </p>
                    <span className="mt-1 text-xs text-slate-600">
                      Tap to chant question!
                    </span>
                  </button>
                );
              }

              const weather = tile.weather!;
              return (
                <button
                  key={tile.index}
                  type="button"
                  onClick={() => handleTileClick(tile)}
                  className={`group relative flex flex-col justify-between rounded-xl p-2.5 sm:p-3 text-left border-2 transition-all duration-150 active:scale-95 min-h-[130px] sm:min-h-[160px] ${
                    tile.stamped
                      ? isWinningTile
                        ? 'bg-emerald-50/90 border-emerald-600'
                        : 'bg-sky-50/60 border-sky-500'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {tile.variant === 'PICTURE' ? (
                    <WeatherArtwork
                      item={weather}
                      aspectClass="aspect-[16/10]"
                      hideColorOverlay={true}
                      className="w-full mb-2"
                    />
                  ) : (
                    <div
                      className={`flex flex-1 flex-col justify-center rounded-lg p-3 mb-2 ${weather.surfaceTintClass}`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: weather.colorHex }}
                        />
                        <span>{weather.colorNameZh}</span>
                      </div>
                      <p className="mt-1.5 font-display text-sm sm:text-base font-bold text-slate-900">
                        “It’s {weather.word}!”
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between w-full">
                    <div>
                      <span className="font-display text-sm sm:text-base font-bold text-slate-900">
                        <span className={weather.rootColorClass}>{weather.rootWord}</span>
                        <span className={weather.suffixColorClass}>{weather.suffix}</span>
                      </span>
                      <span className="ml-1.5 text-xs text-slate-500 hidden sm:inline">
                        {weather.zhMeaning}
                      </span>
                    </div>

                    <WeatherIconGlyph id={weather.id} className="h-4 w-4 shrink-0" />
                  </div>

                  {/* Stamped Star Overlay */}
                  {tile.stamped && (
                    <div className="pointer-events-none absolute top-2 right-2 rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
                      ✓ STAMPED
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
