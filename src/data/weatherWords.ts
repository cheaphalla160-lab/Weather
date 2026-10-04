import sunnyImg from '../assets/images/weather_sunny_1791100743870.jpg';
import windyImg from '../assets/images/weather_windy_1791100753784.jpg';
import rainyImg from '../assets/images/weather_rainy_1791100764767.jpg';
import stormyImg from '../assets/images/weather_stormy_1791100773815.jpg';
import snowyImg from '../assets/images/weather_snowy_1791100785102.jpg';
import cloudyImg from '../assets/images/weather_cloudy_1791100798229.jpg';

export type WeatherId = 'sunny' | 'windy' | 'rainy' | 'stormy' | 'snowy' | 'cloudy';

export interface WeatherWordItem {
  id: WeatherId;
  word: string;
  rootWord: string;
  suffix: string;
  spellingNote: string;
  phonetic: string;
  zhMeaning: string;
  question: string;
  questionZh: string;
  sentence: string;
  sentenceZh: string;
  colorNameEn: string;
  colorNameZh: string;
  colorSentence: string;
  colorHex: string;
  rootColorClass: string;
  suffixColorClass: string;
  surfaceTintClass: string;
  borderAccentClass: string;
  image: string;
  tprAction: string;
  soundClue: string;
}

export const WEATHER_WORDS: WeatherWordItem[] = [
  {
    id: 'sunny',
    word: 'sunny',
    rootWord: 'sunn',
    suffix: 'y',
    spellingNote: 'sun + n + y (双写 n 加 y)',
    phonetic: '/ˈsʌn.i/',
    zhMeaning: '晴朗的',
    question: "What’s the weather like?",
    questionZh: '天气怎么样？',
    sentence: "It’s sunny.",
    sentenceZh: '天气是晴朗的。',
    colorNameEn: 'Golden Yellow',
    colorNameZh: '金黄色 (Yellow)',
    colorSentence: 'Yellow sun, yellow sun — It’s sunny!',
    colorHex: '#D97706',
    rootColorClass: 'text-amber-600',
    suffixColorClass: 'text-rose-600',
    surfaceTintClass: 'bg-amber-50/70',
    borderAccentClass: 'border-amber-300',
    image: sunnyImg,
    tprAction: '双手在头顶画一个大大的太阳圆圈，露出灿烂笑容',
    soundClue: 'Warm sunshine & singing birds'
  },
  {
    id: 'windy',
    word: 'windy',
    rootWord: 'wind',
    suffix: 'y',
    spellingNote: 'wind (风) + y',
    phonetic: '/ˈwɪn.di/',
    zhMeaning: '刮风的 / 有风的',
    question: "What’s the weather like?",
    questionZh: '天气怎么样？',
    sentence: "It’s windy.",
    sentenceZh: '天气是有风的。',
    colorNameEn: 'Emerald Green',
    colorNameZh: '翠绿色 (Green)',
    colorSentence: 'Green leaves flying — It’s windy!',
    colorHex: '#059669',
    rootColorClass: 'text-emerald-600',
    suffixColorClass: 'text-rose-600',
    surfaceTintClass: 'bg-emerald-50/70',
    borderAccentClass: 'border-emerald-300',
    image: windyImg,
    tprAction: '双手像风吹树枝一样左右摇摆，嘴里发出呼呼声 (Whoosh!)',
    soundClue: 'Whooshing breeze & rustling leaves'
  },
  {
    id: 'rainy',
    word: 'rainy',
    rootWord: 'rain',
    suffix: 'y',
    spellingNote: 'rain (雨) + y',
    phonetic: '/ˈreɪ.ni/',
    zhMeaning: '下雨的 / 多雨的',
    question: "What’s the weather like?",
    questionZh: '天气怎么样？',
    sentence: "It’s rainy.",
    sentenceZh: '天气是下雨的。',
    colorNameEn: 'Sky Blue',
    colorNameZh: '天蓝色 (Blue)',
    colorSentence: 'Blue raindrops falling — It’s rainy!',
    colorHex: '#0284C7',
    rootColorClass: 'text-sky-600',
    suffixColorClass: 'text-rose-600',
    surfaceTintClass: 'bg-sky-50/70',
    borderAccentClass: 'border-sky-300',
    image: rainyImg,
    tprAction: '十指从上往下轻轻抖动模仿雨滴落下，再做撑伞动作',
    soundClue: 'Pitter-patter raindrops on an umbrella'
  },
  {
    id: 'stormy',
    word: 'stormy',
    rootWord: 'storm',
    suffix: 'y',
    spellingNote: 'storm (暴风雨) + y',
    phonetic: '/ˈstɔːr.mi/',
    zhMeaning: '暴风雨的',
    question: "What’s the weather like?",
    questionZh: '天气怎么样？',
    sentence: "It’s stormy.",
    sentenceZh: '天气是暴风雨的。',
    colorNameEn: 'Royal Purple',
    colorNameZh: '深紫色 (Purple)',
    colorSentence: 'Purple sky & bright lightning — It’s stormy!',
    colorHex: '#7C3AED',
    rootColorClass: 'text-violet-700',
    suffixColorClass: 'text-rose-600',
    surfaceTintClass: 'bg-violet-50/70',
    borderAccentClass: 'border-violet-300',
    image: stormyImg,
    tprAction: '用手指在空中画一道之字形闪电 (Zigzag)，轻轻拍手模仿雷声',
    soundClue: 'Rumbling thunder & crackling lightning'
  },
  {
    id: 'snowy',
    word: 'snowy',
    rootWord: 'snow',
    suffix: 'y',
    spellingNote: 'snow (雪) + y',
    phonetic: '/ˈsnoʊ.i/',
    zhMeaning: '下雪的',
    question: "What’s the weather like?",
    questionZh: '天气怎么样？',
    sentence: "It’s snowy.",
    sentenceZh: '天气是下雪的。',
    colorNameEn: 'Icy Cyan & White',
    colorNameZh: '冰雪白与冰蓝 (White & Cyan)',
    colorSentence: 'White snowman in the snow — It’s snowy!',
    colorHex: '#0891B2',
    rootColorClass: 'text-cyan-700',
    suffixColorClass: 'text-rose-600',
    surfaceTintClass: 'bg-cyan-50/70',
    borderAccentClass: 'border-cyan-300',
    image: snowyImg,
    tprAction: '双臂抱紧自己假装好冷发抖 (Brrr!)，再做堆雪人动作',
    soundClue: 'Crunching snow & sleigh bells'
  },
  {
    id: 'cloudy',
    word: 'cloudy',
    rootWord: 'cloud',
    suffix: 'y',
    spellingNote: 'cloud (云) + y',
    phonetic: '/ˈklaʊ.di/',
    zhMeaning: '多云的',
    question: "What’s the weather like?",
    questionZh: '天气怎么样？',
    sentence: "It’s cloudy.",
    sentenceZh: '天气是多云的。',
    colorNameEn: 'Silver Gray',
    colorNameZh: '银灰色 (Gray)',
    colorSentence: 'Soft gray clouds floating — It’s cloudy!',
    colorHex: '#475569',
    rootColorClass: 'text-slate-700',
    suffixColorClass: 'text-rose-600',
    surfaceTintClass: 'bg-slate-100/80',
    borderAccentClass: 'border-slate-300',
    image: cloudyImg,
    tprAction: '双手在空中画蓬松的棉花糖云朵，轻轻遮住眼睛上方',
    soundClue: 'Soft drifting clouds in a quiet sky'
  }
];
