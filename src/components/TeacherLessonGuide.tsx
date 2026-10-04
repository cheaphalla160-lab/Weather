import React, { useState } from 'react';
import { Volume2, Play, BookOpen, CheckSquare } from 'lucide-react';
import { WEATHER_WORDS } from '../data/weatherWords';
import { soundEngine } from '../utils/soundEngine';

const CHANT_LINES = [
  {
    en: "What’s the weather like? What’s the weather like?",
    zh: '天气怎么样？天气怎么样？（全班拍手打节拍）',
    colorHex: '#0284C7'
  },
  {
    en: "Look at the yellow sun — It’s sunny! It’s sunny!",
    zh: '看看金黄色的太阳 —— 它是晴朗的！',
    colorHex: '#D97706'
  },
  {
    en: "Look at the green leaves — It’s windy! It’s windy!",
    zh: '看看飞舞的绿树叶 —— 它是有风的！',
    colorHex: '#059669'
  },
  {
    en: "Look at the blue raindrops — It’s rainy! It’s rainy!",
    zh: '看看蓝色的雨滴 —— 它是下雨的！',
    colorHex: '#0284C7'
  },
  {
    en: "Look at the purple sky — It’s stormy! It’s stormy!",
    zh: '看看深紫色的雷雨云 —— 它是暴风雨的！',
    colorHex: '#7C3AED'
  },
  {
    en: "Look at the white snowman — It’s snowy! It’s snowy!",
    zh: '看看白色的雪人 —— 它是下雪的！',
    colorHex: '#0891B2'
  },
  {
    en: "Look at the gray clouds — It’s cloudy! It’s cloudy!",
    zh: '看看银灰色的云朵 —— 它是多云的！',
    colorHex: '#475569'
  }
];

const LESSON_STAGES = [
  {
    step: '01. Warm-up & Lead-in (5 mins)',
    title: 'Color & Window Guessing · 颜色导入与百叶窗猜天气',
    activity:
      '打开【Flashcards】模式的“Mystery Window (随机猜天气)”，先让学生听天气音效并观察颜色线索（Yellow / Blue / White 等），引出核心问句 “What’s the weather like?”。'
  },
  {
    step: '02. Presentation & Phonics (12 mins)',
    title: 'Root Noun + "-y" Color Rule · 名词加 -y 变天气形容词',
    activity:
      '开启“Color Phonics (颜色自然拼读)”，用双色高亮对比名词词根（sun, wind, rain, storm, snow, cloud）与红色词尾“-y”，特别提醒学生 sunny 需要双写 n (sun + n + y)。配合 TPR 肢体动作带读 “It’s + 天气”。'
  },
  {
    step: '03. Controlled Practice (13 mins)',
    title: 'Weather Radio Bingo & Sentence Puzzle · 宾果听音与积木拼图',
    activity:
      '先进入【Weather Bingo】进行全班听音辨色连连看：老师点击播报，全班齐声大喊 “What’s the weather like?”，被点到的学生上台点击对应天气格；随后在【Sentence Puzzle】中练习问答句语序重组。'
  },
  {
    step: '04. Production & PK Game (10 mins)',
    title: 'Sun Team vs. Cloud Team PK · 双人同屏抢答挑战赛',
    activity:
      '将全班分为红阳队 (Sun Team) 与蓝云队 (Cloud Team)，每轮派两名代表上台在【2-Player PK】同屏比拼，台下同学齐声提问 “What’s the weather like?”，台上代表抢答 “It’s ...!”。'
  }
];

export const TeacherLessonGuide: React.FC = () => {
  const [activeChantIdx, setActiveChantIdx] = useState<number | null>(null);
  const [checkedSteps, setCheckedSteps] = useState<number[]>([0]);

  const handlePlayLine = (idx: number, text: string) => {
    setActiveChantIdx(idx);
    soundEngine.playSfx('pop');
    soundEngine.speakText(text, 0.88);
  };

  const handlePlayFullChant = () => {
    setActiveChantIdx(0);
    soundEngine.playSfx('correct');
    const fullText = CHANT_LINES.map((l) => l.en).join(' ');
    soundEngine.speakText(fullText, 0.9);
  };

  const toggleStep = (idx: number) => {
    soundEngine.playSfx('pop');
    setCheckedSteps((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-medium text-slate-500">
            05. Senior Lesson Prep Assistant · 40 分钟小学英语公开课备课教案与韵律 Chant
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-slate-900">
            Teacher Lesson Plan &amp; Classroom Chant
          </h1>
        </div>

        <button
          type="button"
          onClick={handlePlayFullChant}
          className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-sky-700 transition-colors whitespace-nowrap"
        >
          <Play className="h-4 w-4" />
          <span>Play Full Weather Chant (播放全班韵律歌)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 40-Minute Classroom Lesson Plan Flow (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <BookOpen className="h-5 w-5 text-sky-600" />
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  40-Minute Teaching Workflow (PPP 教学法流程)
                </h2>
                <p className="text-xs text-slate-500">
                  点击每个教学环节可标记课堂进度，直接对应顶部 4 个互动游戏模块
                </p>
              </div>
            </div>
            <span className="font-mono-tabular text-xs text-slate-500">
              Completed: {checkedSteps.length} / {LESSON_STAGES.length}
            </span>
          </div>

          <div className="space-y-4">
            {LESSON_STAGES.map((stage, idx) => {
              const isChecked = checkedSteps.includes(idx);
              return (
                <button
                  key={stage.step}
                  type="button"
                  onClick={() => toggleStep(idx)}
                  className={`w-full text-left rounded-xl p-4 border transition-colors ${
                    isChecked
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-tabular text-xs font-semibold text-sky-700">
                      {stage.step}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                      <CheckSquare className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{isChecked ? 'Done' : 'Mark Done'}</span>
                    </span>
                  </div>
                  <h3 className="mt-1 text-base font-semibold text-slate-900">
                    {stage.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                    {stage.activity}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Color + Weather Chant Board (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-semibold text-slate-900">
              Interactive Color &amp; Weather Chant (拍手韵律歌)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              点击任意一行即可朗读示范，将“颜色词”与“天气词”绑定记忆
            </p>
          </div>

          <div className="space-y-2.5">
            {CHANT_LINES.map((line, idx) => {
              const isActive = activeChantIdx === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePlayLine(idx, line.en)}
                  className={`w-full flex items-center justify-between gap-3 rounded-xl p-3 text-left border transition-colors ${
                    isActive
                      ? 'bg-sky-50 border-sky-400'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className="mt-1.5 h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: line.colorHex }}
                    />
                    <div>
                      <p className="font-display text-sm font-semibold text-slate-900">
                        {line.en}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{line.zh}</p>
                    </div>
                  </div>
                  <Volume2 className="h-4 w-4 text-slate-400 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Reference Table of 6 Words, Colors & Phonics */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">
          Vocabulary, Color &amp; Phonics Quick Reference (板书核心知识汇总表)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-3 pr-4">Weather Word</th>
                <th className="py-3 px-4">Color Phonics (词根+词尾)</th>
                <th className="py-3 px-4">Theme Color (代表颜色)</th>
                <th className="py-3 px-4">Target Q&amp;A Sentence</th>
                <th className="py-3 pl-4 text-right">Audio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {WEATHER_WORDS.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50/80">
                  <td className="py-3 pr-4 font-display font-bold text-base text-slate-900">
                    {w.word}{' '}
                    <span className="font-sans font-normal text-xs text-slate-500">
                      ({w.zhMeaning})
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono-tabular text-xs">
                    <span className={`font-bold ${w.rootColorClass}`}>{w.rootWord}</span>
                    <span className={`font-bold ${w.suffixColorClass}`}>+{w.suffix}</span>
                    <span className="text-slate-500 ml-2">({w.spellingNote})</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-700">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full mr-1.5 align-middle"
                      style={{ backgroundColor: w.colorHex }}
                    />
                    {w.colorNameZh}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-800">
                    What’s the weather like? → <strong>{w.sentence}</strong>
                  </td>
                  <td className="py-3 pl-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        soundEngine.speakText(
                          `What's the weather like? It's ${w.word}.`
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 whitespace-nowrap"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>Speak</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
