import React, { useState } from 'react';
import { Sun, Wind, CloudRain, CloudLightning, Snowflake, Cloud } from 'lucide-react';
import { WeatherWordItem, WeatherId } from '../data/weatherWords';

interface WeatherArtworkProps {
  item: WeatherWordItem;
  className?: string;
  aspectClass?: string;
  hideColorOverlay?: boolean;
}

export function WeatherIconGlyph({ id, className = 'w-6 h-6' }: { id: WeatherId; className?: string }) {
  switch (id) {
    case 'sunny':
      return <Sun className={`${className} text-amber-500`} />;
    case 'windy':
      return <Wind className={`${className} text-emerald-600`} />;
    case 'rainy':
      return <CloudRain className={`${className} text-sky-600`} />;
    case 'stormy':
      return <CloudLightning className={`${className} text-violet-600`} />;
    case 'snowy':
      return <Snowflake className={`${className} text-cyan-600`} />;
    case 'cloudy':
      return <Cloud className={`${className} text-slate-600`} />;
  }
}

export const WeatherArtwork: React.FC<WeatherArtworkProps> = ({
  item,
  className = '',
  aspectClass = 'aspect-[4/3]',
  hideColorOverlay = false
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`relative overflow-hidden rounded-xl bg-slate-100 ${aspectClass} ${className}`}>
      {!imgError ? (
        <img
          src={item.image}
          alt={`${item.word} (${item.zhMeaning}) weather illustration`}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
      ) : (
        <div className={`flex h-full w-full flex-col items-center justify-center p-6 ${item.surfaceTintClass}`}>
          <WeatherIconGlyph id={item.id} className="h-16 w-16 mb-2" />
          <span className="font-display text-lg font-semibold text-slate-800">{item.word}</span>
          <span className="text-xs text-slate-500">{item.zhMeaning}</span>
        </div>
      )}

      {!hideColorOverlay && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-3.5 pt-8 pb-2.5">
          <div className="flex items-center justify-between text-xs font-medium text-white/95">
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full border border-white/80"
                style={{ backgroundColor: item.colorHex }}
              />
              <span>{item.colorNameZh}</span>
            </span>
            <span className="font-mono-tabular text-white/80">{item.phonetic}</span>
          </div>
        </div>
      )}
    </div>
  );
};
