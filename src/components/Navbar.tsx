import React from 'react';
import { BookOpen, CheckCircle2, Volume2, Sparkles, HandMetal } from 'lucide-react';

interface NavbarProps {
  onOpenDictionary: () => void;
  onOpenTestGuide: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDictionary,
  onOpenTestGuide,
  soundEnabled,
  onToggleSound
}) => {
  return (
    <header
      id="main-navbar"
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
            <HandMetal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg sm:text-xl text-slate-900 tracking-tight">
                IsyaratKita
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                <Sparkles className="w-3 h-3" /> SIBI AI
              </span>
            </div>
            <p className="text-xs text-slate-600 hidden md:block">
              Penerjemah Bahasa Isyarat SIBI &amp; Suara Sehari-hari
            </p>
          </div>
        </div>

        {/* Right Navigation & Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Usage Guide Button */}
          <button
            id="btn-open-test-guide"
            onClick={onOpenTestGuide}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 text-teal-900 border border-teal-300 hover:bg-teal-100 transition-colors shadow-xs"
            title="Petunjuk cara menggunakan aplikasi"
          >
            <CheckCircle2 className="w-4 h-4 text-teal-700" />
            <span className="hidden sm:inline">Petunjuk Pakai</span>
            <span className="sm:hidden">Petunjuk</span>
          </button>

          {/* Dictionary Reference Button */}
          <button
            id="btn-open-dictionary"
            onClick={onOpenDictionary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            title="Lihat daftar isyarat huruf dan kata SIBI"
          >
            <BookOpen className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Kamus Isyarat</span>
            <span className="sm:hidden">Kamus</span>
          </button>

          {/* Sound Mute/Unmute Toggle */}
          <button
            id="btn-toggle-sound"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Matikan Suara Pembaca' : 'Aktifkan Suara Pembaca'}
            className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
              soundEnabled
                ? 'bg-teal-50 border-teal-200 text-teal-700'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
            title={soundEnabled ? 'Suara Pembaca Aktif' : 'Suara Pembaca Senyap'}
          >
            <Volume2 className={`w-4 h-4 ${soundEnabled ? 'text-teal-600' : 'text-slate-600'}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
