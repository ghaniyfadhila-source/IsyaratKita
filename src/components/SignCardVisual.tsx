import React from 'react';
import { SibiSign } from '../types';
import { HandSignIllustration } from './HandSignIllustration';
import { ArrowUpRight } from 'lucide-react';

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
  const config = {
    compact: {
      container: 'w-24 h-32 p-2.5 text-xs',
      illusSize: 52,
      showDesc: false,
      showBadge: false,
      titleSize: 'text-sm font-bold'
    },
    sm: {
      container: 'w-full h-full min-h-[224px] p-4 text-xs',
      illusSize: 88,
      showDesc: true,
      showBadge: true,
      titleSize: 'text-base font-bold'
    },
    md: {
      container: 'w-52 min-h-[270px] p-4 text-sm',
      illusSize: 104,
      showDesc: true,
      showBadge: true,
      titleSize: 'text-lg font-bold'
    },
    lg: {
      container: 'w-64 min-h-[310px] p-5 text-base',
      illusSize: 124,
      showDesc: true,
      showBadge: true,
      titleSize: 'text-xl font-bold'
    }
  }[size];

  const categoryColorMap: Record<string, { bg: string; text: string }> = {
    alfabet: { bg: 'bg-blue-50 text-blue-800 border-blue-200', text: 'Alfabet' },
    sapaan: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', text: 'Sapaan' },
    'kata-dasar': { bg: 'bg-slate-100 text-slate-700 border-slate-200', text: 'Kata Dasar' },
    angka: { bg: 'bg-sky-50 text-sky-800 border-sky-200', text: 'Angka' }
  };

  const catStyle = categoryColorMap[sign.category] || categoryColorMap['alfabet'];

  return (
    <div
      id={`sign-card-${sign.id}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`group relative flex flex-col items-center justify-between rounded-2xl liquid-glass-card select-none transition-all duration-200 ${
        config.container
      } ${
        highlight
          ? 'ring-2 ring-blue-600 bg-white/95 shadow-md'
          : 'hover:border-blue-300'
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Top Bar: Letter/Word Badge & Category */}
      <div className="w-full flex items-center justify-between gap-1.5 mb-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs shrink-0">
            {sign.label.length <= 2 ? sign.label : sign.label.charAt(0)}
          </span>
          <span className={`${config.titleSize} text-slate-900 tracking-tight truncate`}>
            {sign.label}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {config.showBadge && (
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${catStyle.bg}`}
            >
              {catStyle.text}
            </span>
          )}
          {onClick && (
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          )}
        </div>
      </div>

      {/* Hand Gesture Illustration Graphic (flat hierarchy, no nested card box) */}
      <div className="flex-1 flex flex-col items-center justify-center my-2 w-full relative group-hover:scale-105 transition-transform duration-200">
        <HandSignIllustration
          signId={sign.id}
          size={config.illusSize}
          animate={true}
        />
      </div>

      {/* Description Snippet */}
      {config.showDesc && (
        <div className="w-full text-center mt-1 border-t border-slate-200/70 pt-2.5">
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {sign.shortDesc || sign.description}
          </p>
        </div>
      )}
    </div>
  );
};
