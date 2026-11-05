import React, { useState } from 'react';
import {
  Search,
  X,
  Camera,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Hand,
  MoveRight,
} from 'lucide-react';
import { SIBI_ALPHABET, SIBI_COMMON_WORDS } from '../data/sibiData';
import { SibiSign, TranslationMode } from '../types';
import { HandSignIllustration } from './HandSignIllustration';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectQuickTerm: (term: string) => void;
  currentMode: TranslationMode;
  onSwitchMode: (mode: TranslationMode) => void;
  onScrollToModules: () => void;
}

const ALL_SIGNS: SibiSign[] = [...SIBI_COMMON_WORDS, ...SIBI_ALPHABET];

const FEATURED_SPECIMEN_IDS = [
  'terima-kasih',
  'halo',
  'perkenalkan',
  'tolong',
  'sama-sama',
  'sayang',
  'a',
  'b',
];

const TWO_HAND_SET = new Set(['terima-kasih', 'sama-sama', 'tolong', 'perkenalkan', 'nama']);

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  onSelectQuickTerm,
  onSwitchMode,
  onScrollToModules,
}) => {
  const [specimenIndex, setSpecimenIndex] = useState(0);

  const featuredSigns = FEATURED_SPECIMEN_IDS.map((id) =>
    ALL_SIGNS.find((s) => s.id === id)
  ).filter((s): s is SibiSign => Boolean(s));

  const currentSpecimen = featuredSigns[specimenIndex] || ALL_SIGNS[0];
  const isSpecimenTwoHand = TWO_HAND_SET.has(currentSpecimen.id);

  const quickTerms = ['Terima Kasih', 'Halo', 'Sama-sama', 'Tolong', 'Perkenalkan', 'Sayang', 'A', 'B'];

  const handlePrevSpecimen = () => {
    setSpecimenIndex((prev) => (prev - 1 + featuredSigns.length) % featuredSigns.length);
  };

  const handleNextSpecimen = () => {
    setSpecimenIndex((prev) => (prev + 1) % featuredSigns.length);
  };

  return (
    <section className="relative pt-4 pb-2">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7 items-stretch">
        {/* Left 7 Columns: Editorial Thesis + Command Search */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-[#FFFDF9] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_#1C1917]">
          <div>
            {/* Top Editorial Index Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b-2 border-[#EAE4D7]">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#141210] bg-[#FDE68A] px-2.5 py-1 rounded border border-[#1C1917]">
                SISTEM ISYARAT BAHASA INDONESIA (SIBI)
              </span>
              <span className="font-mono text-xs font-bold text-[#57534E] tabular-nums">
                26 ALFABET · 13 KATA INTI · DETEKSI 1 &amp; 2 TANGAN
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-[#141210] leading-[1.08] mb-4">
              Jembatan Komunikasi{' '}
              <span className="underline decoration-[#1D4ED8] decoration-4 underline-offset-4">
                Dua Arah
              </span>{' '}
              Tanpa Batas Suara.
            </h1>

            <p className="text-base sm:text-lg text-[#44403C] leading-relaxed mb-6">
              Ubah ucapan atau teks Bahasa Indonesia menjadi rangkaian kartu visual SIBI, atau
              praktikkan isyarat 1 maupun 2 tangan di depan kamera untuk diterjemahkan menjadi
              kalimat bersuara secara instan.
            </p>
          </div>

          {/* Tactile Search Command Box */}
          <div className="w-full">
            <label
              htmlFor="hero-sign-search-input"
              className="block font-mono text-xs font-bold uppercase tracking-wider text-[#141210] mb-2"
            >
              Cari Cepat Kamus &amp; Gestur SIBI
            </label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  onScrollToModules();
                }
              }}
              className="relative flex items-center bg-[#F6F3EC] rounded-2xl p-1.5 border-2 border-[#1C1917] shadow-[3px_3px_0px_#1C1917] focus-within:bg-[#FFFFFF] transition-colors"
            >
              <Search className="w-5 h-5 text-[#141210] ml-3 mr-2 shrink-0" />
              <input
                id="hero-sign-search-input"
                type="text"
                aria-label="Cari kata atau huruf bahasa isyarat SIBI"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Ketik huruf (A-Z) atau kata (Halo, Terima Kasih, Perkenalkan)..."
                className="w-full py-2.5 px-2 bg-transparent text-[#141210] placeholder:text-[#57534E] focus:outline-none text-sm sm:text-base font-bold"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Bersihkan pencarian"
                  onClick={() => onSearchChange('')}
                  className="p-2 text-[#44403C] hover:text-[#141210] rounded-xl hover:bg-[#EAE4D7] transition-colors mr-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="tactile-btn px-4 py-2 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-bold shrink-0 cursor-pointer"
              >
                Cari Isyarat
              </button>
            </form>

            {/* Physical Keycap Chips */}
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#57534E] uppercase">
                Populer:
              </span>
              {quickTerms.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => onSelectQuickTerm(term)}
                  className="tactile-btn text-xs font-bold px-2.5 py-1 rounded-lg bg-[#FFFDF9] hover:bg-[#FDE68A] text-[#141210] cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Live Interactive SIBI Specimen Deck */}
        <div className="lg:col-span-5 bg-[#141210] text-[#FFFDF9] border-2 border-[#1C1917] rounded-3xl p-6 shadow-[6px_6px_0px_#1D4ED8] flex flex-col justify-between">
          {/* Specimen Top Bar */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#292524]">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase px-2 py-0.5 rounded bg-[#1D4ED8] text-white tabular-nums">
                SPESIMEN {(specimenIndex + 1).toString().padStart(2, '0')}/
                {featuredSigns.length.toString().padStart(2, '0')}
              </span>
              <span className="font-mono text-xs font-bold text-[#D6D3D1] uppercase">
                {isSpecimenTwoHand ? 'Gestur 2 Tangan' : 'Gestur 1 Tangan'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevSpecimen}
                aria-label="Spesimen sebelumnya"
                className="p-1.5 rounded-lg bg-[#292524] hover:bg-[#44403C] text-[#FFFDF9] border border-[#44403C] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextSpecimen}
                aria-label="Spesimen berikutnya"
                className="p-1.5 rounded-lg bg-[#292524] hover:bg-[#44403C] text-[#FFFDF9] border border-[#44403C] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Specimen Main Visual & Anatomy */}
          <div className="my-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-[#1C1917] rounded-2xl p-4 border border-[#292524]">
            <div className="sm:col-span-5 flex items-center justify-center bg-[#FFFDF9] rounded-xl p-3 border-2 border-[#1C1917]">
              <HandSignIllustration signId={currentSpecimen.id} size={112} animate={true} />
            </div>
            <div className="sm:col-span-7 text-left space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-xs font-bold uppercase px-2 py-0.5 rounded bg-[#FDE68A] text-[#141210]">
                  {currentSpecimen.category === 'alfabet'
                    ? 'Alfabet'
                    : currentSpecimen.category === 'sapaan'
                      ? 'Sapaan'
                      : 'Kata Dasar'}
                </span>
                {isSpecimenTwoHand && (
                  <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#047857] text-white">
                    <Hand className="w-3 h-3" /> 2 Tangan
                  </span>
                )}
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#FFFDF9] tracking-tight">
                “{currentSpecimen.label}”
              </h2>

              <p className="text-xs sm:text-sm text-[#D6D3D1] leading-relaxed">
                {currentSpecimen.shortDesc || currentSpecimen.description}
              </p>

              {currentSpecimen.motion && (
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#FDE68A]">
                  <MoveRight className="w-3.5 h-3.5 shrink-0" />
                  <span>{currentSpecimen.motion}</span>
                </div>
              )}
            </div>
          </div>

          {/* Direct Action Triggers */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onSwitchMode('speech-to-sign')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#1D4ED8] hover:bg-[#2563EB] text-white font-bold text-xs sm:text-sm border border-white/20 transition-colors cursor-pointer"
            >
              <Volume2 className="w-4 h-4 shrink-0" />
              <span>Studio Suara → Isyarat</span>
            </button>
            <button
              type="button"
              onClick={() => onSwitchMode('sign-to-speech')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#047857] hover:bg-[#059669] text-white font-bold text-xs sm:text-sm border border-white/20 transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4 shrink-0" />
              <span>Studio Kamera → Suara</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
