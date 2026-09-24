import React from 'react';
import { Search, X, Sparkles, Mic, Video, BookOpen, ArrowRight } from 'lucide-react';
import { TranslationMode } from '../types';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectQuickTerm: (term: string) => void;
  currentMode: TranslationMode;
  onSwitchMode: (mode: TranslationMode) => void;
  onScrollToModules: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  onSelectQuickTerm,
  currentMode,
  onSwitchMode,
  onScrollToModules
}) => {
  const quickTerms = [
    { label: 'Terima Kasih', isWord: true },
    { label: 'Halo', isWord: true },
    { label: 'Sama-sama', isWord: true },
    { label: 'Tolong', isWord: true },
    { label: 'Maaf', isWord: true },
    { label: 'Huruf B', isWord: false, term: 'B' },
    { label: 'Huruf A', isWord: false, term: 'A' },
    { label: 'Nama', isWord: true }
  ];

  return (
    <section className="pt-6 sm:pt-10 pb-4 text-center max-w-4xl mx-auto px-4 flex flex-col items-center">
      {/* Subtle Pill Tag */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/80 border border-slate-200 text-slate-700 shadow-2xs mb-4">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Sistem Isyarat Bahasa Indonesia (SIBI)</span>
        <span className="text-slate-300">•</span>
        <span className="text-blue-600 font-bold">Dua Arah Real-time</span>
      </div>

      {/* Clean, Bold, Direct Title */}
      <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold text-slate-800 tracking-tight leading-tight max-w-3xl">
        Komunikasi Bahasa Isyarat Lebih Mudah &amp; Terbuka
      </h1>

      {/* Direct, Crisp Subtitle */}
      <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
        Jembatan percakapan inklusif antara teman dengar dan teman tuli: ubah suara/teks ke gerakan tangan SIBI, atau deteksi peragaan tangan di kamera menjadi suara otomatis.
      </p>

      {/* Large Glassmorphism Search Bar */}
      <div className="w-full max-w-2xl mt-7">
        <div className="liquid-glass-search rounded-2xl p-2 sm:p-2.5 flex items-center gap-2.5 sm:gap-3 transition-all focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-400">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="hero-sign-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari kata isyarat, huruf A–Z, atau sapaan (contoh: Terima Kasih, B, Halo)..."
            className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Bersihkan pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onScrollToModules}
            className="hidden sm:inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shrink-0 shadow-2xs active:scale-98"
          >
            <span>Cari Isyarat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mt-3 flex items-center justify-center gap-1.5 flex-wrap text-xs">
          <span className="text-[11px] text-slate-500 font-medium mr-1">Cepat cari:</span>
          {quickTerms.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                const termToUse = item.term || item.label;
                onSelectQuickTerm(termToUse);
              }}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/70 hover:bg-white text-slate-700 hover:text-blue-600 border border-slate-200/80 transition-colors active:scale-95 shadow-2xs"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Switcher Shortcut Tabs */}
      <div className="mt-6 flex items-center gap-2 p-1 rounded-2xl bg-slate-100/80 border border-slate-200/80">
        <button
          onClick={() => onSwitchMode('speech-to-sign')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            currentMode === 'speech-to-sign'
              ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Bicara / Tulis ➔ Isyarat</span>
        </button>
        <button
          onClick={() => onSwitchMode('sign-to-speech')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            currentMode === 'sign-to-speech'
              ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Kamera Isyarat ➔ Suara</span>
        </button>
      </div>
    </section>
  );
};
