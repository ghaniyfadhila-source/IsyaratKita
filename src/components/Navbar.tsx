import React, { useState } from 'react';
import {
  Hand,
  BookOpen,
  GraduationCap,
  HelpCircle,
  Mail,
  Volume2,
  VolumeX,
  Camera,
  Menu,
  X,
} from 'lucide-react';
import { TranslationMode } from '../types';

interface NavbarProps {
  onOpenDictionary: () => void;
  onOpenModules: () => void;
  onOpenAbout: () => void;
  onOpenTestGuide: () => void;
  onScrollToTop: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  currentMode?: TranslationMode;
  onSelectMode?: (mode: TranslationMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDictionary,
  onOpenModules,
  onOpenAbout,
  onOpenTestGuide,
  onScrollToTop,
  soundEnabled,
  onToggleSound,
  currentMode,
  onSelectMode,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FFFDF9] border-b-2 border-[#1C1917]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
        {/* Brand Masthead */}
        <button
          type="button"
          onClick={onScrollToTop}
          className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
          aria-label="Kembali ke bagian atas IsyaratKita"
        >
          <div className="w-11 h-11 rounded-xl bg-[#141210] text-[#FFFDF9] border-2 border-[#1C1917] shadow-[3px_3px_0px_#1D4ED8] flex items-center justify-center transition-transform group-hover:-translate-y-0.5">
            <Hand className="w-5 h-5 text-[#FDE68A]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-[#141210]">
                IsyaratKita
              </span>
              <span className="font-mono text-xs font-bold uppercase px-2 py-0.5 rounded bg-[#FDE68A] text-[#141210] border border-[#1C1917]">
                SIBI 2-Arah
              </span>
            </div>
            <p className="text-xs font-medium text-[#57534E] hidden sm:block">
              Studio Penerjemah &amp; Referensi Bahasa Isyarat Indonesia
            </p>
          </div>
        </button>

        {/* Inline Quick Mode Switcher (Desktop) */}
        {currentMode && onSelectMode && (
          <div
            className="hidden xl:flex items-center bg-[#EAE4D7] p-1 rounded-xl border-2 border-[#1C1917]"
            role="tablist"
            aria-label="Pilih studio terjemahan cepat"
          >
            <button
              type="button"
              role="tab"
              aria-selected={currentMode === 'speech-to-sign'}
              onClick={() => onSelectMode('speech-to-sign')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentMode === 'speech-to-sign'
                  ? 'bg-[#1D4ED8] text-white border border-[#1C1917] shadow-[2px_2px_0px_#1C1917]'
                  : 'text-[#44403C] hover:text-[#141210]'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>01 · Suara/Teks → Isyarat</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={currentMode === 'sign-to-speech'}
              onClick={() => onSelectMode('sign-to-speech')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentMode === 'sign-to-speech'
                  ? 'bg-[#047857] text-white border border-[#1C1917] shadow-[2px_2px_0px_#1C1917]'
                  : 'text-[#44403C] hover:text-[#141210]'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>02 · Kamera Isyarat → Suara</span>
            </button>
          </div>
        )}

        {/* Desktop Navigation Actions */}
        <nav aria-label="Menu utama" className="hidden md:flex items-center gap-2">
          <button
            id="nav-btn-dictionary"
            type="button"
            onClick={onOpenDictionary}
            className="tactile-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FFFDF9] text-[#141210] hover:bg-[#FDE68A] cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#1D4ED8]" />
            <span>Kamus SIBI</span>
          </button>

          <button
            id="nav-btn-modules"
            type="button"
            onClick={onOpenModules}
            className="tactile-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FFFDF9] text-[#141210] hover:bg-[#EAE4D7] cursor-pointer"
          >
            <GraduationCap className="w-4 h-4 text-[#047857]" />
            <span>Modul Belajar</span>
          </button>

          <button
            id="nav-btn-test-guide"
            type="button"
            onClick={onOpenTestGuide}
            className="tactile-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FFFDF9] text-[#141210] hover:bg-[#EAE4D7] cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-[#C2410C]" />
            <span>Panduan</span>
          </button>

          <button
            id="nav-btn-sound-toggle"
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Matikan suara' : 'Aktifkan suara'}
            className={`tactile-btn flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer ${
              soundEnabled
                ? 'bg-[#D1FAE5] text-[#065F46]'
                : 'bg-[#F6F3EC] text-[#57534E]'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'Suara ON' : 'Suara OFF'}</span>
          </button>

          <button
            id="nav-btn-about"
            type="button"
            onClick={onOpenAbout}
            className="tactile-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#141210] text-[#FFFDF9] hover:bg-[#292524] cursor-pointer"
          >
            <Mail className="w-4 h-4 text-[#FDE68A]" />
            <span>Kontak</span>
          </button>
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Matikan suara' : 'Aktifkan suara'}
            className={`tactile-btn p-2 rounded-xl text-xs font-bold cursor-pointer ${
              soundEnabled ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#F6F3EC] text-[#57534E]'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Buka menu navigasi"
            className="tactile-btn p-2 rounded-xl bg-[#141210] text-[#FFFDF9] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFFDF9] border-t-2 border-[#1C1917] px-4 py-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                onOpenDictionary();
                setMobileMenuOpen(false);
              }}
              className="tactile-btn flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-[#F6F3EC] text-[#141210]"
            >
              <BookOpen className="w-4 h-4 text-[#1D4ED8]" />
              <span>Kamus SIBI</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenModules();
                setMobileMenuOpen(false);
              }}
              className="tactile-btn flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-[#F6F3EC] text-[#141210]"
            >
              <GraduationCap className="w-4 h-4 text-[#047857]" />
              <span>Modul Belajar</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenTestGuide();
                setMobileMenuOpen(false);
              }}
              className="tactile-btn flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-[#F6F3EC] text-[#141210]"
            >
              <HelpCircle className="w-4 h-4 text-[#C2410C]" />
              <span>Panduan Uji</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenAbout();
                setMobileMenuOpen(false);
              }}
              className="tactile-btn flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-[#141210] text-[#FFFDF9]"
            >
              <Mail className="w-4 h-4 text-[#FDE68A]" />
              <span>Kontak</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
