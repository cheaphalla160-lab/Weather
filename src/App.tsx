import React, { useState } from 'react';
import { Music, Volume2, VolumeX } from 'lucide-react';
import { FlashcardStudio } from './components/FlashcardStudio';
import { WeatherBingo } from './components/WeatherBingo';
import { SentencePuzzle } from './components/SentencePuzzle';
import { ClassroomPKGame } from './components/ClassroomPKGame';
import { TeacherLessonGuide } from './components/TeacherLessonGuide';
import { soundEngine } from './utils/soundEngine';

type ActiveModule = 'FLASHCARDS' | 'BINGO' | 'PUZZLE' | 'PK_GAME' | 'TEACHER_GUIDE';

const NAV_ITEMS: Array<{ id: ActiveModule; label: string }> = [
  { id: 'FLASHCARDS', label: 'Flashcards' },
  { id: 'BINGO', label: 'Weather Bingo' },
  { id: 'PUZZLE', label: 'Sentence Puzzle' },
  { id: 'PK_GAME', label: '2-Player PK' },
  { id: 'TEACHER_GUIDE', label: 'Teacher Guide' }
];

export default function App() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('FLASHCARDS');
  const [isBgmPlaying, setIsBgmPlaying] = useState<boolean>(false);
  const [isSfxOn, setIsSfxOn] = useState<boolean>(true);
  const [masteredIds, setMasteredIds] = useState<string[]>(['sunny']);

  const handleToggleBgm = () => {
    const nextState = soundEngine.toggleBgm();
    setIsBgmPlaying(nextState);
  };

  const handleToggleSfx = () => {
    const next = !isSfxOn;
    setIsSfxOn(next);
    soundEngine.setSfxEnabled(next);
    if (next) {
      soundEngine.playSfx('pop');
    }
  };

  const handlePracticeComplete = (wordId: string) => {
    setMasteredIds((prev) => (prev.includes(wordId) ? prev : [...prev, wordId]));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-200">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveModule('FLASHCARDS');
            soundEngine.playSfx('pop');
          }}
          className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          Weather Wonderland
        </a>

        {/* Zone 2: 5 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          {NAV_ITEMS.map((item) => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveModule(item.id);
                  soundEngine.playSfx('pop');
                }}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  isActive
                    ? 'border-sky-600 text-slate-900 font-semibold'
                    : 'border-transparent hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 2 primary actions (Cheerful BGM Toggle & SFX/Voice Toggle) */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleToggleBgm}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              isBgmPlaying
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <Music className="h-3.5 w-3.5" />
            <span>{isBgmPlaying ? 'BGM: Playing' : 'Play BGM (背景音乐)'}</span>
          </button>

          <button
            type="button"
            onClick={handleToggleSfx}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            title="Toggle Classroom Sound Effects"
          >
            {isSfxOn ? (
              <>
                <Volume2 className="h-3.5 w-3.5 text-sky-600" />
                <span className="hidden sm:inline">SFX On</span>
              </>
            ) : (
              <>
                <VolumeX className="h-3.5 w-3.5 text-slate-400" />
                <span className="hidden sm:inline">SFX Muted</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Bar (visible only below md breakpoint) */}
      <div className="md:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 bg-white border-b border-slate-200">
        {NAV_ITEMS.map((item) => {
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveModule(item.id);
                soundEngine.playSfx('pop');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Container (1440px desktop baseline, 1200px max-w container) */}
      <main className="flex-1 w-full max-w-[1220px] mx-auto px-4 sm:px-8 py-8">
        {activeModule === 'FLASHCARDS' && (
          <FlashcardStudio
            onPracticeComplete={handlePracticeComplete}
            masteredIds={masteredIds}
          />
        )}

        {activeModule === 'BINGO' && <WeatherBingo />}

        {activeModule === 'PUZZLE' && <SentencePuzzle />}

        {activeModule === 'PK_GAME' && <ClassroomPKGame />}

        {activeModule === 'TEACHER_GUIDE' && <TeacherLessonGuide />}
      </main>

      {/* Quiet Classroom Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 px-4 sm:px-8">
        <div className="max-w-[1220px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-800">Weather Wonderland</span>
            <span aria-hidden="true">·</span>
            <span>Target Words: sunny · windy · rainy · stormy · snowy · cloudy</span>
            <span aria-hidden="true">·</span>
            <span>Sentence Pattern: “What’s the weather like? It’s ...”</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                soundEngine.speakText(
                  "What's the weather like? It's sunny, windy, rainy, stormy, snowy, and cloudy!"
                )
              }
              className="text-sky-700 hover:underline font-medium whitespace-nowrap"
            >
              Read All 6 Words Aloud
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
