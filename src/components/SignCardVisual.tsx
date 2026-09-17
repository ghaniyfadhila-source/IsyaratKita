import React from 'react';
import { SibiSign } from '../types';
import { HandSignIllustration } from './HandSignIllustration';
import { Sparkles, MoveRight } from 'lucide-react';

interface SignCardVisualProps {
  sign: SibiSign;
  size?: 'sm' | 'md' | 'lg' | 'compact';
  highlight?: boolean;
  onClick?: () => void;
}

export const SignCardVisual: React.FC<SignCardVisualProps> = ({
  sign,
  size = 'md',
  highlight = false,
  onClick
}) => {
  // Dimension configurations
  const config = {
    compact: {
      container: 'w-24 h-32 p-2 text-xs',
      illusSize: 52,
      showDesc: false,
      showBadge: false,
      titleSize: 'text-sm font-bold'
    },
    sm: {
      container: 'w-full h-full min-h-[240px] p-3 text-xs',
      illusSize: 88,
      showDesc: true,
      showBadge: true,
      titleSize: 'text-base font-bold'
    },
    md: {
      container: 'w-52 min-h-[280px] p-4 text-sm',
      illusSize: 110,
      showDesc: true,
      showBadge: true,
      titleSize: 'text-lg font-bold'
    },
    lg: {
      container: 'w-64 min-h-[320px] p-5 text-base',
      illusSize: 130,
      showDesc: true,
      showBadge: true,
      titleSize: 'text-xl font-bold'
    }
  }[size];

  const categoryColorMap: Record<string, { bg: string; text: string }> = {
    alfabet: { bg: 'bg-teal-50 text-teal-700 border-teal-200', text: 'Alfabet' },
    sapaan: { bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'Sapaan' },
    'kata-dasar': { bg: 'bg-sky-50 text-sky-700 border-sky-200', text: 'Kata Dasar' },
    angka: { bg: 'bg-purple-50 text-purple-700 border-purple-200', text: 'Angka' }
  };

  const catStyle = categoryColorMap[sign.category] || categoryColorMap['alfabet'];

  return (
    <div
      id={`sign-card-${sign.id}`}
      onClick={onClick}
      className={`group relative flex flex-col items-center justify-between rounded-2xl border transition-all duration-200 select-none ${
        config.container
      } ${
        highlight
          ? 'bg-teal-50/90 border-teal-500 shadow-md ring-2 ring-teal-400/30'
          : 'bg-white border-slate-200 shadow-xs hover:border-teal-300 hover:shadow-md'
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Top Bar: Letter/Word Badge & Category */}
      <div className="w-full flex items-center justify-between gap-1 mb-1">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-teal-600 text-white font-mono font-bold text-sm shadow-xs">
            {sign.label.length <= 2 ? sign.label : sign.label.charAt(0)}
          </span>
          <span className={`${config.titleSize} text-slate-800 tracking-tight line-clamp-1`}>
            {sign.label}
          </span>
        </div>

        {config.showBadge && (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${catStyle.bg}`}
          >
            {catStyle.text}
          </span>
        )}
      </div>

      {/* Hand Gesture Illustration Graphic */}
      <div className="flex-1 flex flex-col items-center justify-center my-1 w-full relative">
        <div className="rounded-2xl p-1 bg-gradient-to-b from-slate-50 to-teal-50/30 border border-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
          <HandSignIllustration
            signId={sign.id}
            size={config.illusSize}
            animate={true}
          />
        </div>

        {/* Dynamic motion indicator badge if sign has dynamic motion */}
        {sign.motion && (
          <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-semibold">
            <MoveRight className="w-3 h-3 text-teal-600" />
            <span className="line-clamp-1">{sign.motion}</span>
          </div>
        )}
      </div>

      {/* Brief Description & Guide on Card */}
      {config.showDesc && (
        <div className="w-full mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1 text-left">
          <p className="text-[11px] font-medium text-slate-700 line-clamp-2 leading-tight">
            {sign.shortDesc || sign.description}
          </p>

          {sign.fingerGuide && size !== 'compact' && (
            <p className="text-[10px] text-teal-700 bg-teal-50/80 rounded px-1.5 py-0.5 line-clamp-1 font-mono">
              💡 {sign.fingerGuide}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
