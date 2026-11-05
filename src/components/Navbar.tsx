import React, { useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  Info,
  Volume2,
  VolumeX,
  Hand,
  Menu,
  X,
  HelpCircle
} from 'lucide-react';

interface NavbarProps {
  onOpenDictionary: () => void;
  onOpenModules: () => void;
  onOpenAbout: () => void;
  onOpenTestGuide: () => void;
  onScrollToTop: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDictionary,
  onOpenModules,
  onOpenAbout,
  onOpenTestGuide,
  onScrollToTop,
  soundEnabled,
  onToggleSound
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-3 sm:top-4 z-40 max-w-7xl mx-auto px-3 sm:px-6 w-full">
      <nav
        id="main-navbar"
        aria-label="Navigasi Utama"
        className="liquid-glass-nav rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3"
      >
        {/* Brand & Logo */}
        <button
          onClick={onScrollToTop}
          className="flex items-center gap-2.5 text-left group transition-transform active:scale-98 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center">
            <Hand className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight font-sans">
                IsyaratKita
              </span>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                SIBI
              </span>
            </div>
            <p className="text-xs text-slate-600 hidden lg:block -mt-0.5">
              Penerjemah Bahasa Isyarat &amp; Suara
            </p>
          </div>
        </button>

        {/* Center Desktop Navigation Menu */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={onScrollToTop}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-100/80 transition-colors cursor-pointer"
          >
            Beranda
          </button>
          <button
            id="nav-btn-kamus"
            onClick={onOpenDictionary}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-100/80 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Kamus Isyarat</span>
          </button>
          <button
            id="nav-btn-modul"
            onClick={onOpenModules}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-100/80 transition-colors cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Modul Belajar</span>
          </button>
          <button
            id="nav-btn-tentang"
            onClick={onOpenAbout}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-100/80 transition-colors cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-slate-600" />
            <span>Tentang Kami</span>
          </button>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            id="btn-toggle-sound"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Matikan Suara Pembaca' : 'Aktifkan Suara Pembaca'}
            className={`p-2 rounded-full border text-xs transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
            title={soundEnabled ? 'Suara Pembaca Aktif' : 'Suara Pembaca Senyap'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-blue-700" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Primary CTA (Petunjuk / Panduan Cepat) */}
          <button
            id="btn-open-guide-cta"
            onClick={onOpenTestGuide}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors active:scale-98 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Panduan Pakai</span>
            <span className="sm:hidden">Panduan</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer"
            aria-label="Menu Mobile"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 liquid-glass-modal rounded-3xl p-4 border border-slate-200 flex flex-col gap-2">
          <button
            onClick={() => {
              onScrollToTop();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-800 hover:bg-slate-100/80 transition-colors"
          >
            Beranda
          </button>
          <button
            onClick={() => {
              onOpenDictionary();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-800 hover:bg-slate-100/80 transition-colors flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Kamus Isyarat</span>
          </button>
          <button
            onClick={() => {
              onOpenModules();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-800 hover:bg-slate-100/80 transition-colors flex items-center gap-2"
          >
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>Modul Belajar</span>
          </button>
          <button
            onClick={() => {
              onOpenAbout();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-800 hover:bg-slate-100/80 transition-colors flex items-center gap-2"
          >
            <Info className="w-4 h-4 text-slate-600" />
            <span>Tentang Kami</span>
          </button>
        </div>
      )}
    </header>
  );
};
