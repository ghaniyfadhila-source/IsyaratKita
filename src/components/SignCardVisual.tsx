import React from 'react';
import { SibiSign } from '../types';
import { MoveRight, Hand } from 'lucide-react';
import { HandSignIllustration } from './HandSignIllustration';

interface SignCardVisualProps {
  sign: SibiSign;
  size?: 'compact' | 'sm' | 'md' | 'lg';
  highlight?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

const TWO_HAND_IDS = new Set(['terima-kasih', 'sama-sama', 'tolong', 'perkenalkan', 'nama']);
const DYNAMIC_IDS = new Set([
  'j',
  'z',
  'halo',
  'terima-kasih',
  'sama-sama',
  'tolong',
  'maaf',
  'perkenalkan',
  'nama',
  'ya',
  'tidak',
]);

export const SignCardVisual: React.FC<SignCardVisualProps> = ({
  sign,
  size = 'md',
  highlight = false,
  isActive = false,
  onClick,
}) => {
  const active = highlight || isActive;
  const isTwoHand = TWO_HAND_IDS.has(sign.id);
  const isDynamic = DYNAMIC_IDS.has(sign.id) || Boolean(sign.motion);

  const sizeConfig = {
    compact: {
      card: 'w-28 sm:w-32 p-2.5',
      title: 'text-sm',
      illusSize: 54,
      showDesc: false,
      showBadge: false,
    },
    sm: {
      card: 'w-34 sm:w-38 p-3',
      title: 'text-base',
      illusSize: 64,
      showDesc: true,
      showBadge: true,
    },
    md: {
      card: 'w-44 sm:w-48 p-3.5',
      title: 'text-xl',
      illusSize: 88,
      showDesc: true,
      showBadge: true,
    },
    lg: {
      card: 'w-60 sm:w-64 p-5',
      title: 'text-3xl',
      illusSize: 120,
      showDesc: true,
      showBadge: true,
    },
  }[size];

  const categoryStamp =
    {
      alfabet: {
        bg: 'bg-[#DBEAFE]',
        text: 'text-[#1E3A8A]',
        label: 'Alfabet',
      },
      sapaan: {
        bg: 'bg-[#D1FAE5]',
        text: 'text-[#065F46]',
        label: 'Sapaan',
      },
      'kata-dasar': {
        bg: 'bg-[#FEF3C7]',
        text: 'text-[#92400E]',
        label: 'Kata Dasar',
      },
      angka: {
        bg: 'bg-[#FCE7F3]',
        text: 'text-[#9D174D]',
        label: 'Angka',
      },
    }[sign.category] || {
      bg: 'bg-[#EAE4D7]',
      text: 'text-[#141210]',
      label: 'SIBI',
    };

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`tactile-card rounded-2xl flex flex-col justify-between select-none relative overflow-hidden ${
        sizeConfig.card
      } ${onClick ? 'cursor-pointer' : ''} ${
        active
          ? 'ring-2 ring-[#1D4ED8] bg-[#EFF6FF] shadow-[5px_5px_0px_#1D4ED8] -translate-y-1'
          : ''
      }`}
    >
      {/* Top Index Header */}
      {sizeConfig.showBadge && (
        <div className="w-full flex items-center justify-between gap-1 mb-2">
          <span
            className={`font-mono text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#1C1917] ${categoryStamp.bg} ${categoryStamp.text}`}
          >
            {categoryStamp.label}
          </span>

          {isTwoHand ? (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#141210] text-[#FDE68A] font-mono text-xs font-bold"
              title="Gestur 2 Tangan"
            >
              <Hand className="w-3 h-3" />
              <span>2T</span>
            </span>
          ) : isDynamic ? (
            <span
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#FFEDD5] text-[#9A3412] border border-[#1C1917] font-mono text-xs font-bold"
              title="Gestur Dinamis (Bergerak)"
            >
              <MoveRight className="w-3 h-3" />
            </span>
          ) : null}
        </div>
      )}

      {/* Anatomical SVG Specimen Stage */}
      <div className="my-1 py-2 flex items-center justify-center w-full bg-[#F6F3EC] rounded-xl border border-[#D4CBB8]">
        <HandSignIllustration
          signId={sign.id}
          size={sizeConfig.illusSize}
          animate={active}
        />
      </div>

      {/* Sign Title & Movement Formula */}
      <div className="text-center w-full mt-2 pt-2 border-t border-[#E5DEC9]">
        <div
          className={`font-display font-extrabold tracking-tight text-[#141210] truncate ${sizeConfig.title}`}
        >
          {sign.label}
        </div>
        {sizeConfig.showDesc && (
          <p className="text-xs text-[#44403C] line-clamp-2 mt-1 leading-snug font-medium">
            {sign.shortDesc || sign.description}
          </p>
        )}
        {size === 'lg' && sign.motion && (
          <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-[#EAE4D7] border border-[#1C1917] text-xs font-bold text-[#141210] flex items-center justify-center gap-1.5">
            <MoveRight className="w-3.5 h-3.5 shrink-0 text-[#C2410C]" />
            <span>{sign.motion}</span>
          </div>
        )}
      </div>
    </div>
  );
};
