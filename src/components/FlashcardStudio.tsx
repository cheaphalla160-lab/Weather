import React, { useState } from 'react';
import { Volume2, Eye, EyeOff, Sparkles, Shuffle, Play } from 'lucide-react';
import { WEATHER_WORDS, WeatherWordItem } from '../data/weatherWords';
import { WeatherArtwork, WeatherIconGlyph } from './WeatherArtwork';
import { soundEngine } from '../utils/soundEngine';

interface FlashcardStudioProps {
  onPracticeComplete?: (wordId: string) => void;
  masteredIds: string[];
}

export const FlashcardStudio: React.FC<FlashcardStudioProps> = ({
  onPracticeComplete,
  masteredIds
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [colorPhonicsMode, setColorPhonicsMode] = useState<boolean>(true);
  const [mysteryMode, setMysteryMode] = useState<'OPEN' | 'PEEK' | 'HIDDEN'>('OPEN');
  const [activeSpeechTag, setActiveSpeechTag] = useState<string | null>(null);

  const currentWord: WeatherWordItem = WEATHER_WORDS[selectedIndex];

  const handleSelectWord = (index: number) => {
    setSelectedIndex(index);
    soundEngine.playSfx('pop');
    soundEngine.playWeatherSound(WEATHER_WORDS[index].id);
    if (mysteryMode === 'OPEN') {
      soundEngine.speakText(`${WEATHER_WORDS[index].word}. ${WEATHER_WORDS[index].sentence}`);
    }
    onPracticeComplete?.(WEATHER_WORDS[index].id);
  };

  const handleRandomMystery = () => {
    const nextIdx = Math.floor(Math.random() * WEATHER_WORDS.length);
    setSelectedIndex(nextIdx);
    setMysteryMode('PEEK');
    soundEngine.playSfx('pop');
    soundEngine.playWeatherSound(WEATHER_WORDS[nextIdx].id);
    soundEngine.speakText("What's the weather like?");
  };

  const triggerSpeech = (tag: string, text: string, rate = 0.86) => {
    setActiveSpeechTag(tag);
    soundEngine.playSfx('pop');
    soundEngine.speakText(text, rate);
    onPracticeComplete?.(currentWord.id);
    window.setTimeout(() => {
      setActiveSpeechTag((prev) => (prev === tag ? null : prev));
    }, 1800);
  };

  const spellWordText = (word: string) => {
    return `${word.split('').join(', ')}. ${word}!`;
  };

  return (
    <section className="space-y-8">
      {/* Section Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-medium text-slate-500">
            01. Presentation Stage · Color Phonics &amp; Target Dialogue
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-slate-900">
            What’s the weather like? — 单词颜色与句型互动黑板
          </h1>
        </div>

        {/* Interactive Mode Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setColorPhonicsMode(true);
                soundEngine.playSfx('pop');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                colorPhonicsMode
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Color Phonics (颜色自然拼读)
            </button>
            <button
              type="button"
              onClick={() => {
                setColorPhonicsMode(false);
                soundEngine.playSfx('pop');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                !colorPhonicsMode
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Whole Word (完整单词)
            </button>
          </div>

          <button
            type="button"
            onClick={handleRandomMystery}
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-sky-700 transition-colors whitespace-nowrap"
          >
            <Shuffle className="h-3.5 w-3.5" />
            <span>Mystery Window (随机猜天气)</span>
          </button>
        </div>
      </div>

      {/* Two-Zone Sandbox Layout (65% Interactive Stage / 35% Concept & Chant Deck) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Zone: Interactive Classroom Window Stage (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 p-5 sm:p-6">
          {/* Top Question Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-medium text-slate-500">
                Teacher Prompt · 课堂提问句型
              </span>
              <div className="mt-0.5 flex items-center gap-2">
                <h2 className="font-display text-xl sm:text-2xl font-semibold text-slate-900">
                  “What’s the weather like?”
                </h2>
                <span className="text-sm text-slate-500">· 天气怎么样？</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => triggerSpeech('question', "What's the weather like?")}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                activeSpeechTag === 'question'
                  ? 'bg-sky-600 text-white'
                  : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
              }`}
            >
              <Volume2 className="h-4 w-4" />
              <span>Play Question</span>
            </button>
          </div>

          {/* Interactive Weather Picture Window with Curtain Reveal */}
          <div className="relative overflow-hidden rounded-xl border border-slate-200">
            <WeatherArtwork
              item={currentWord}
              aspectClass="aspect-[16/10]"
              hideColorOverlay={mysteryMode !== 'OPEN'}
            />

            {/* Mystery Curtain Overlay for Classroom Guessing */}
            {mysteryMode !== 'OPEN' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/85 backdrop-blur-md p-6 text-center transition-opacity duration-200">
                {mysteryMode === 'PEEK' && (
                  <div className="mb-4 h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-md">
                    <img
                      src={currentWord.image}
                      alt="Mystery weather peek"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover scale-150"
                    />
                  </div>
                )}
                <p className="font-display text-xl font-semibold text-white">
                  {mysteryMode === 'PEEK'
                    ? 'Look through the spyglass! What’s the weather like?'
                    : 'Listen to the sound clue! What’s the weather like?'}
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  Clue: Color is {currentWord.colorNameZh} · {currentWord.soundClue}
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => soundEngine.playWeatherSound(currentWord.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-4 py-2 text-xs font-semibold text-white hover:bg-white/25 transition-colors whitespace-nowrap"
                  >
                    <Volume2 className="h-4 w-4" />
                    <span>Hear Sound Clue</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMysteryMode('OPEN');
                      soundEngine.playSfx('correct');
                      soundEngine.speakText(`It's ${currentWord.word}!`);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Open Window (揭晓答案)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Window Curtain Controls + Color Swatch Indicator */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-3.5 w-3.5 rounded-full border border-slate-300"
                style={{ backgroundColor: currentWord.colorHex }}
              />
              <span className="font-medium text-slate-800">
                Color Clue: {currentWord.colorNameZh}
              </span>
              <span aria-hidden="true">·</span>
              <span>{currentWord.colorSentence}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setMysteryMode((prev) => (prev === 'OPEN' ? 'PEEK' : 'OPEN'))
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                {mysteryMode === 'OPEN' ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" />
                    <span>Peek Mode (小孔猜词)</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" />
                    <span>Show Full Picture</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Zone: Color Word Card, Phonics & Target Answer Deck (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-5">
          {/* Target Answer Sentence Block */}
          <div className={`rounded-xl p-5 ${currentWord.surfaceTintClass}`}>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Target Answer · 核心回答句型</span>
              <span className="font-mono-tabular">{currentWord.phonetic}</span>
            </div>

            {/* Big Color-Coded Sentence & Word */}
            <div className="mt-3 flex items-baseline justify-between gap-3">
              <div>
                <p className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                  <span>It’s </span>
                  {colorPhonicsMode ? (
                    <span className="underline decoration-2 underline-offset-8 decoration-slate-300">
                      <span className={currentWord.rootColorClass}>{currentWord.rootWord}</span>
                      <span className={currentWord.suffixColorClass}>{currentWord.suffix}</span>
                    </span>
                  ) : (
                    <span className={currentWord.rootColorClass}>{currentWord.word}</span>
                  )}
                  <span>.</span>
                </p>
                <p className="mt-2 text-sm font-medium text-slate-700">
                  {currentWord.sentenceZh}（{currentWord.word} = {currentWord.zhMeaning}）
                </p>
              </div>

              <WeatherIconGlyph id={currentWord.id} className="h-10 w-10 shrink-0" />
            </div>

            {/* Phonics Color Rule Explanation */}
            <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-600">
              <span>
                拼读拆解：<strong className="text-slate-900">{currentWord.spellingNote}</strong>
              </span>
              <span>词尾 -y 读 /i/</span>
            </div>
          </div>

          {/* 3 Audio Pronunciation Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => triggerSpeech('word', `${currentWord.word}. ${currentWord.sentence}`)}
              className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                activeSpeechTag === 'word'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>Read “It’s {currentWord.word}”</span>
            </button>

            <button
              type="button"
              onClick={() => triggerSpeech('spell', spellWordText(currentWord.word), 0.8)}
              className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                activeSpeechTag === 'spell'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Spell Word (拼读)</span>
            </button>

            <button
              type="button"
              onClick={() => triggerSpeech('chant', currentWord.colorSentence, 0.88)}
              className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                activeSpeechTag === 'chant'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              <Play className="h-3.5 w-3.5" />
              <span>Color Chant (颜色韵律)</span>
            </button>
          </div>

          {/* Classroom TPR Action & Dialogue Guide */}
          <div className="space-y-3 pt-2 border-t border-slate-100 text-sm">
            <div>
              <p className="text-xs font-medium text-slate-500">
                TPR Classroom Action · 课堂肢体互动动作
              </p>
              <p className="mt-1 text-slate-800 leading-relaxed">
                {currentWord.tprAction}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Color &amp; Memory Hook · 颜色联想记忆
              </p>
              <p className="mt-1 text-slate-800">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full mr-1.5 align-middle"
                  style={{ backgroundColor: currentWord.colorHex }}
                />
                <span className="font-medium">{currentWord.colorNameZh}</span> — {currentWord.colorSentence}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 6 Weather Vocabulary Deck Selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">
            All 6 Weather Words · 点击卡片切换天气单词与音效
          </h3>
          <span className="text-xs text-slate-500 font-mono-tabular">
            Practiced: {masteredIds.length} / {WEATHER_WORDS.length} words
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {WEATHER_WORDS.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            const isMastered = masteredIds.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectWord(idx)}
                className={`group text-left rounded-xl p-3 transition-all duration-150 border ${
                  isSelected
                    ? 'bg-white border-sky-600 ring-2 ring-sky-500/20 shadow-sm -translate-y-0.5'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <WeatherArtwork
                  item={item}
                  aspectClass="aspect-[4/3]"
                  hideColorOverlay={true}
                  className="mb-2.5"
                />
                <div className="flex items-center justify-between">
                  <span className="font-display text-base font-semibold text-slate-900">
                    {colorPhonicsMode ? (
                      <>
                        <span className={item.rootColorClass}>{item.rootWord}</span>
                        <span className={item.suffixColorClass}>{item.suffix}</span>
                      </>
                    ) : (
                      item.word
                    )}
                  </span>
                  <span
                    className="h-3 w-3 rounded-full border border-slate-300 shrink-0"
                    style={{ backgroundColor: item.colorHex }}
                    title={item.colorNameZh}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>{item.zhMeaning}</span>
                  <span>{isMastered ? '✓ Read' : 'Tap'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
