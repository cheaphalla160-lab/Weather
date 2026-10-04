import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Volume2, Trophy, Play, RotateCcw, Users, Bot } from 'lucide-react';
import { WEATHER_WORDS, WeatherWordItem } from '../data/weatherWords';
import { WeatherArtwork } from './WeatherArtwork';
import { soundEngine } from '../utils/soundEngine';

type GameState = 'TITLE_MENU' | 'PLAYING' | 'ROUND_SUMMARY' | 'GAME_OVER';

interface PKQuestion {
  target: WeatherWordItem;
  options: WeatherWordItem[];
  promptType: 'PICTURE_AND_QUESTION' | 'COLOR_AND_AUDIO';
}

function generatePKQuestions(totalRounds: number): PKQuestion[] {
  const questions: PKQuestion[] = [];
  for (let i = 0; i < totalRounds; i++) {
    const target = WEATHER_WORDS[i % WEATHER_WORDS.length];
    const distractors = WEATHER_WORDS.filter((w) => w.id !== target.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    const options = [target, ...distractors].sort(() => Math.random() - 0.5);
    questions.push({
      target,
      options,
      promptType: i % 2 === 0 ? 'PICTURE_AND_QUESTION' : 'COLOR_AND_AUDIO'
    });
  }
  return questions.sort(() => Math.random() - 0.5);
}

export const ClassroomPKGame: React.FC = () => {
  const TOTAL_ROUNDS = 6;
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [opponentMode, setOpponentMode] = useState<'TWO_STUDENTS' | 'VS_BOT'>('TWO_STUDENTS');
  const [questions, setQuestions] = useState<PKQuestion[]>(() =>
    generatePKQuestions(TOTAL_ROUNDS)
  );
  const [roundIndex, setRoundIndex] = useState<number>(0);

  const [teamSunScore, setTeamSunScore] = useState<number>(0);
  const [teamCloudScore, setTeamCloudScore] = useState<number>(0);
  const [roundWinner, setRoundWinner] = useState<'SUN' | 'CLOUD' | null>(null);
  const [roundLog, setRoundLog] = useState<string>('');
  const [lockedTeam, setLockedTeam] = useState<'SUN' | 'CLOUD' | null>(null);

  const botTimerRef = useRef<number | null>(null);

  const currentQuestion: PKQuestion = questions[roundIndex] || questions[0];

  const clearBotTimer = () => {
    if (botTimerRef.current !== null) {
      window.clearTimeout(botTimerRef.current);
      botTimerRef.current = null;
    }
  };

  const announceRoundQuestion = useCallback((q: PKQuestion) => {
    soundEngine.playWeatherSound(q.target.id);
    if (q.promptType === 'PICTURE_AND_QUESTION') {
      soundEngine.speakText("What's the weather like?");
    } else {
      soundEngine.speakText(`What's the weather like? Hint: ${q.target.colorNameEn}. It's ${q.target.word}!`);
    }
  }, []);

  const startNewPKMatch = () => {
    clearBotTimer();
    const fresh = generatePKQuestions(TOTAL_ROUNDS);
    setQuestions(fresh);
    setRoundIndex(0);
    setTeamSunScore(0);
    setTeamCloudScore(0);
    setRoundWinner(null);
    setLockedTeam(null);
    setRoundLog('Round 1! Listen & tap the matching “It’s + weather” answer!');
    setGameState('PLAYING');
    soundEngine.playSfx('pop');
    announceRoundQuestion(fresh[0]);
  };

  const handleAnswerAttempt = useCallback(
    (team: 'SUN' | 'CLOUD', chosen: WeatherWordItem) => {
      if (gameState !== 'PLAYING') return;
      if (lockedTeam === team) return;

      if (chosen.id === currentQuestion.target.id) {
        clearBotTimer();
        soundEngine.playSfx('correct');
        soundEngine.speakText(`Yes! It's ${chosen.word}!`);

        if (team === 'SUN') {
          setTeamSunScore((s) => s + 10);
        } else {
          setTeamCloudScore((s) => s + 10);
        }
        setRoundWinner(team);
        setRoundLog(
          `${
            team === 'SUN' ? 'Sun Team (红队)' : opponentMode === 'VS_BOT' ? 'Weather Bot (机器人)' : 'Cloud Team (蓝队)'
          } answered first: “It’s ${chosen.word}!” (+10 pts)`
        );
        setGameState('ROUND_SUMMARY');
      } else {
        soundEngine.playSfx('wrong');
        setLockedTeam(team);
        setRoundLog(
          `${
            team === 'SUN' ? 'Sun Team' : 'Cloud Team'
          } tapped “It’s ${chosen.word}” — Freeze for 1.5s! Other side can steal!`
        );
        window.setTimeout(() => {
          setLockedTeam((prev) => (prev === team ? null : prev));
        }, 1500);
      }
    },
    [gameState, lockedTeam, currentQuestion, opponentMode]
  );

  // Bot automatic turn logic when in VS_BOT mode
  useEffect(() => {
    clearBotTimer();
    if (gameState === 'PLAYING' && opponentMode === 'VS_BOT') {
      const delay = 2800 + Math.floor(Math.random() * 1100);
      botTimerRef.current = window.setTimeout(() => {
        handleAnswerAttempt('CLOUD', currentQuestion.target);
      }, delay);
    }
    return () => clearBotTimer();
  }, [gameState, opponentMode, roundIndex, currentQuestion, handleAnswerAttempt]);

  // Keyboard shortcuts for classroom duel: A/S/D for Sun Team, J/K/L for Cloud Team
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING') return;
      const key = e.key.toLowerCase();
      if (key === 'a' && currentQuestion.options[0]) {
        handleAnswerAttempt('SUN', currentQuestion.options[0]);
      } else if (key === 's' && currentQuestion.options[1]) {
        handleAnswerAttempt('SUN', currentQuestion.options[1]);
      } else if (key === 'd' && currentQuestion.options[2]) {
        handleAnswerAttempt('SUN', currentQuestion.options[2]);
      } else if (opponentMode === 'TWO_STUDENTS') {
        if (key === 'j' && currentQuestion.options[0]) {
          handleAnswerAttempt('CLOUD', currentQuestion.options[0]);
        } else if (key === 'k' && currentQuestion.options[1]) {
          handleAnswerAttempt('CLOUD', currentQuestion.options[1]);
        } else if (key === 'l' && currentQuestion.options[2]) {
          handleAnswerAttempt('CLOUD', currentQuestion.options[2]);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState, currentQuestion, opponentMode, handleAnswerAttempt]);

  const handleNextRound = () => {
    const nextIdx = roundIndex + 1;
    setLockedTeam(null);
    setRoundWinner(null);

    if (nextIdx >= TOTAL_ROUNDS) {
      soundEngine.playSfx('bingo');
      setGameState('GAME_OVER');
    } else {
      setRoundIndex(nextIdx);
      setGameState('PLAYING');
      setRoundLog(`Round ${nextIdx + 1} of ${TOTAL_ROUNDS}! What’s the weather like?`);
      announceRoundQuestion(questions[nextIdx]);
    }
  };

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-medium text-slate-500">
            04. Competitive Classroom Arena · 双人同屏 PK 抢答赛
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-slate-900">
            Weather Champions PK — 课堂红蓝战队大比拼
          </h1>
        </div>

        {/* Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setOpponentMode('TWO_STUDENTS');
                setGameState('TITLE_MENU');
                soundEngine.playSfx('pop');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                opponentMode === 'TWO_STUDENTS'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>2-Player Classroom PK (双人同台)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOpponentMode('VS_BOT');
                setGameState('TITLE_MENU');
                soundEngine.playSfx('pop');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                opponentMode === 'VS_BOT'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bot className="h-3.5 w-3.5" />
              <span>1-Player vs Weather Bot (挑战机器人)</span>
            </button>
          </div>
        </div>
      </div>

      {/* State 1: TITLE_MENU */}
      {gameState === 'TITLE_MENU' && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-10 text-center max-w-3xl mx-auto space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <Trophy className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Ready for the “What’s the weather like?” PK Match?
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              共 6 个回合，覆盖全部 6 个天气颜色单词（sunny, windy, rainy, stormy, snowy, cloudy）。看到天气画面或听到颜色线索后，最快点击正确回答句 <strong>“It’s + 天气!”</strong> 的队伍加 10 分！
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-xl mx-auto">
            <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-4">
              <p className="text-xs font-semibold text-amber-800">
                LEFT SIDE · SUN TEAM (红阳队)
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                触屏直接点击左侧按钮，或使用键盘快捷键 <span className="font-mono-tabular font-semibold">A / S / D</span>
              </p>
            </div>

            <div className="rounded-xl bg-sky-50/70 border border-sky-200 p-4">
              <p className="text-xs font-semibold text-sky-800">
                RIGHT SIDE · {opponentMode === 'VS_BOT' ? 'WEATHER BOT (电脑)' : 'CLOUD TEAM (蓝云队)'}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {opponentMode === 'VS_BOT'
                  ? '天气机器人会在约 3 秒后自动抢答，快在它之前选出正确答案！'
                  : '触屏直接点击右侧按钮，或使用键盘快捷键 J / K / L'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={startNewPKMatch}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            <Play className="h-4 w-4" />
            <span>Start Classroom PK Match (开始比赛)</span>
          </button>
        </div>
      )}

      {/* State 2 & 3: PLAYING or ROUND_SUMMARY */}
      {(gameState === 'PLAYING' || gameState === 'ROUND_SUMMARY') && (
        <div className="space-y-6">
          {/* Top Unobtrusive HUD Score & Tug-of-War Progress Bar */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="h-3.5 w-3.5 rounded-full bg-amber-500" />
                <div>
                  <p className="text-xs font-medium text-slate-500">Sun Team (红阳队)</p>
                  <p className="font-mono-tabular text-xl font-bold text-slate-900">
                    {teamSunScore} pts
                  </p>
                </div>
              </div>

              <div className="text-center">
                <p className="font-mono-tabular text-xs font-semibold text-slate-500">
                  ROUND {roundIndex + 1} OF {TOTAL_ROUNDS} · {gameState === 'PLAYING' ? 'LIVE' : 'ROUND COMPLETE'}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">{roundLog}</p>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    {opponentMode === 'VS_BOT' ? 'Weather Bot (电脑)' : 'Cloud Team (蓝云队)'}
                  </p>
                  <p className="font-mono-tabular text-xl font-bold text-slate-900">
                    {teamCloudScore} pts
                  </p>
                </div>
                <span className="h-3.5 w-3.5 rounded-full bg-sky-600" />
              </div>
            </div>
          </div>

          {/* Center Prompt & Two-Side Battle Zones */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Player 1 (Sun Team) Zone — 4 cols */}
            <div className="lg:col-span-4 rounded-2xl bg-white border border-slate-200 p-5 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Sun Team (Player 1)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Tap answer or press keys A / S / D
                  </p>
                </div>
                <span className="font-mono-tabular text-xs font-semibold text-amber-700">
                  {lockedTeam === 'SUN' ? 'FROZEN 1.5s' : 'READY'}
                </span>
              </div>

              <div className="space-y-3 my-auto">
                {currentQuestion.options.map((opt, idx) => {
                  const keyHint = ['A', 'S', 'D'][idx];
                  const isCorrectReveal =
                    gameState === 'ROUND_SUMMARY' && opt.id === currentQuestion.target.id;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={gameState !== 'PLAYING' || lockedTeam === 'SUN'}
                      onClick={() => handleAnswerAttempt('SUN', opt)}
                      className={`w-full flex items-center justify-between rounded-xl px-4 py-3.5 text-left border-2 transition-all duration-150 active:scale-98 ${
                        isCorrectReveal
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-950'
                          : lockedTeam === 'SUN'
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-amber-50/40 border-amber-200 hover:border-amber-500 hover:bg-amber-50 text-slate-900'
                      }`}
                    >
                      <div>
                        <span className="font-display text-lg font-bold">
                          It’s{' '}
                          <span className={opt.rootColorClass}>{opt.rootWord}</span>
                          <span className={opt.suffixColorClass}>{opt.suffix}</span>.
                        </span>
                        <span className="block text-xs text-slate-500">
                          {opt.zhMeaning} · {opt.colorNameZh}
                        </span>
                      </div>

                      <span className="font-mono-tabular text-xs font-semibold text-slate-500 border border-slate-200 rounded px-2 py-0.5 bg-white">
                        Key {keyHint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Center Battle Stage — 4 cols */}
            <div className="lg:col-span-4 rounded-2xl bg-white border border-slate-200 p-5 flex flex-col justify-between text-center space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Center Question Prompt
                </p>
                <h3 className="mt-1 font-display text-xl sm:text-2xl font-bold text-slate-900">
                  “What’s the weather like?”
                </h3>
                <p className="text-xs text-slate-500">天气怎么样？</p>
              </div>

              {currentQuestion.promptType === 'PICTURE_AND_QUESTION' ||
              gameState === 'ROUND_SUMMARY' ? (
                <WeatherArtwork
                  item={currentQuestion.target}
                  aspectClass="aspect-[4/3]"
                  hideColorOverlay={gameState === 'PLAYING'}
                />
              ) : (
                <div
                  className={`rounded-xl p-6 flex flex-col items-center justify-center aspect-[4/3] border border-slate-200 ${currentQuestion.target.surfaceTintClass}`}
                >
                  <span
                    className="h-12 w-12 rounded-full border-4 border-white shadow-sm mb-3"
                    style={{ backgroundColor: currentQuestion.target.colorHex }}
                  />
                  <p className="font-display text-lg font-bold text-slate-900">
                    Color &amp; Audio Challenge!
                  </p>
                  <p className="mt-1 text-xs text-slate-700">
                    Color Clue: <strong>{currentQuestion.target.colorNameZh}</strong>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {currentQuestion.target.soundClue}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => announceRoundQuestion(currentQuestion)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  <Volume2 className="h-4 w-4" />
                  <span>Replay Question Audio</span>
                </button>

                {gameState === 'ROUND_SUMMARY' && (
                  <button
                    type="button"
                    onClick={handleNextRound}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
                  >
                    <span>
                      {roundIndex + 1 >= TOTAL_ROUNDS ? 'See Final Winner' : 'Next Round →'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Player 2 (Cloud Team / Weather Bot) Zone — 4 cols */}
            <div className="lg:col-span-4 rounded-2xl bg-white border border-slate-200 p-5 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {opponentMode === 'VS_BOT'
                      ? 'Weather Bot (Auto Opponent)'
                      : 'Cloud Team (Player 2)'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {opponentMode === 'VS_BOT'
                      ? 'Bot thinks for ~3s then answers automatically'
                      : 'Tap answer or press keys J / K / L'}
                  </p>
                </div>
                <span className="font-mono-tabular text-xs font-semibold text-sky-700">
                  {lockedTeam === 'CLOUD'
                    ? 'FROZEN 1.5s'
                    : roundWinner === 'CLOUD'
                    ? 'WINNER!'
                    : 'READY'}
                </span>
              </div>

              <div className="space-y-3 my-auto">
                {currentQuestion.options.map((opt, idx) => {
                  const keyHint = ['J', 'K', 'L'][idx];
                  const isCorrectReveal =
                    gameState === 'ROUND_SUMMARY' && opt.id === currentQuestion.target.id;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={
                        gameState !== 'PLAYING' ||
                        lockedTeam === 'CLOUD' ||
                        opponentMode === 'VS_BOT'
                      }
                      onClick={() => handleAnswerAttempt('CLOUD', opt)}
                      className={`w-full flex items-center justify-between rounded-xl px-4 py-3.5 text-left border-2 transition-all duration-150 active:scale-98 ${
                        isCorrectReveal
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-950'
                          : lockedTeam === 'CLOUD'
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-sky-50/40 border-sky-200 hover:border-sky-500 hover:bg-sky-50 text-slate-900'
                      }`}
                    >
                      <div>
                        <span className="font-display text-lg font-bold">
                          It’s{' '}
                          <span className={opt.rootColorClass}>{opt.rootWord}</span>
                          <span className={opt.suffixColorClass}>{opt.suffix}</span>.
                        </span>
                        <span className="block text-xs text-slate-500">
                          {opt.zhMeaning} · {opt.colorNameZh}
                        </span>
                      </div>

                      <span className="font-mono-tabular text-xs font-semibold text-slate-500 border border-slate-200 rounded px-2 py-0.5 bg-white">
                        {opponentMode === 'VS_BOT' ? 'BOT' : `Key ${keyHint}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* State 4: GAME_OVER Victory Modal */}
      {gameState === 'GAME_OVER' && (
        <div className="rounded-2xl bg-white border border-slate-200 p-8 sm:p-10 text-center max-w-2xl mx-auto space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <Trophy className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-emerald-700">
              MATCH COMPLETE · 6 ROUNDS FINISHED
            </p>
            <h2 className="font-display text-3xl font-bold text-slate-900">
              {teamSunScore > teamCloudScore
                ? 'Sun Team (红阳队) Wins the Trophy!'
                : teamCloudScore > teamSunScore
                ? `${
                    opponentMode === 'VS_BOT'
                      ? 'Weather Bot Wins! Try Again!'
                      : 'Cloud Team (蓝云队) Wins the Trophy!'
                  }`
                : 'It’s a Tie! Both Teams Are Weather Champions!'}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="rounded-xl bg-amber-50 p-4 border border-amber-200">
              <p className="text-xs text-amber-800 font-semibold">Sun Team</p>
              <p className="font-mono-tabular text-3xl font-bold text-slate-900 mt-1">
                {teamSunScore} pts
              </p>
            </div>
            <div className="rounded-xl bg-sky-50 p-4 border border-sky-200">
              <p className="text-xs text-sky-800 font-semibold">
                {opponentMode === 'VS_BOT' ? 'Weather Bot' : 'Cloud Team'}
              </p>
              <p className="font-mono-tabular text-3xl font-bold text-slate-900 mt-1">
                {teamCloudScore} pts
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={startNewPKMatch}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Play Again (再来一局)</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
