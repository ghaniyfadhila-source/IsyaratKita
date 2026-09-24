import React, { useState, useEffect } from 'react';
import { TranslationMode, TranslationHistoryItem, SibiSign } from './types';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { LearningModulesGrid } from './components/LearningModulesGrid';
import { ModeSelector } from './components/ModeSelector';
import { SpeechToSignView } from './components/SpeechToSignView';
import { SignToSpeechView } from './components/SignToSpeechView';
import { DictionaryModal } from './components/DictionaryModal';
import { TestingGuideModal } from './components/TestingGuideModal';
import { ContactModal } from './components/ContactModal';
import { getSavedHistory, saveHistoryItem } from './utils/historyStorage';
import { Sparkles, CheckCircle2, HeartHandshake, ShieldCheck } from 'lucide-react';

export default function App() {
  const [currentMode, setCurrentMode] = useState<TranslationMode>('speech-to-sign');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState<boolean>(false);
  const [isTestGuideOpen, setIsTestGuideOpen] = useState<boolean>(false);
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<TranslationHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Load history from localStorage on initial render
  useEffect(() => {
    const saved = getSavedHistory();
    setHistory(saved);
  }, []);

  const handleLogTranslation = (sourceText: string, translatedResult: string) => {
    const updated = saveHistoryItem(sourceText, translatedResult, currentMode);
    setHistory(updated);
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToModules = () => {
    const section = document.getElementById('modul-belajar-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToTranslator = () => {
    const section = document.getElementById('translator-main-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePracticeInCamera = (_sign: SibiSign) => {
    setCurrentMode('sign-to-speech');
    setTimeout(() => {
      const section = document.getElementById('sign-to-speech-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch {
      // fallback
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] to-[#FFFFFF] text-[#1E293B] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Floating Pill Navbar */}
      <Navbar
        onOpenDictionary={() => setIsDictionaryOpen(true)}
        onOpenModules={handleScrollToModules}
        onOpenAbout={() => setIsContactOpen(true)}
        onOpenTestGuide={() => setIsTestGuideOpen(true)}
        onScrollToTop={handleScrollToTop}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col space-y-8 sm:space-y-10">
        {/* Modern Minimalist Hero Section with Large Liquid Glass Search */}
        <HeroSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectQuickTerm={(term) => {
            setSearchQuery(term);
            handleScrollToModules();
          }}
          currentMode={currentMode}
          onSwitchMode={(mode) => {
            setCurrentMode(mode);
            handleScrollToTranslator();
          }}
          onScrollToModules={handleScrollToModules}
        />

        {/* Translator Main Section */}
        <div id="translator-main-section" className="space-y-6 pt-2">
          {/* Subtle Status Notice */}
          <div className="liquid-glass rounded-2xl p-4 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs border border-slate-200/90">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    Interaktif Real-time
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    Penerjemah Bahasa Isyarat &amp; Suara Dua Arah
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Ubah ucapan/tulisan menjadi isyarat tangan 3D SIBI, atau arahkan kamera tangan untuk menerjemahkan ke ucapan suara.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                onClick={() => setIsTestGuideOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-2xs active:scale-98"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Petunjuk Cepat</span>
              </button>
            </div>
          </div>

          {/* Two-Way Mode Selector (Pill Style) */}
          <ModeSelector
            currentMode={currentMode}
            onSelectMode={(mode) => setCurrentMode(mode)}
          />

          {/* Dynamic Translation View */}
          <div className="pt-1">
            {currentMode === 'speech-to-sign' ? (
              <SpeechToSignView
                soundEnabled={soundEnabled}
                onLogTranslation={handleLogTranslation}
              />
            ) : (
              <SignToSpeechView
                soundEnabled={soundEnabled}
                onLogTranslation={handleLogTranslation}
              />
            )}
          </div>
        </div>

        {/* Structured Learning Modules & Dictionary Grid */}
        <LearningModulesGrid
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onPracticeInCamera={handlePracticeInCamera}
          onSpeak={handleSpeak}
        />
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="liquid-glass border-t border-slate-200/80 py-7 mt-16 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-blue-600" />
            <span>
              <strong>IsyaratKita</strong> • Dibuat oleh{' '}
              <button
                onClick={() => setIsContactOpen(true)}
                className="font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                Ghaniy Fadhila
              </button>
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap justify-center">
            <span>Standar SIBI (Sistem Isyarat Bahasa Indonesia)</span>
            <span>•</span>
            <button
              onClick={() => setIsContactOpen(true)}
              className="hover:text-blue-600 font-semibold underline decoration-dotted"
            >
              Kontak &amp; Informasi
            </button>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              WCAG AA Accessible
            </span>
          </div>
        </div>
      </footer>

      {/* SIBI Alphabet & Vocabulary Dictionary Modal */}
      <DictionaryModal
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
      />

      {/* Step-by-Step Testing Guide Modal */}
      <TestingGuideModal
        isOpen={isTestGuideOpen}
        onClose={() => setIsTestGuideOpen(false)}
        onGoToMode={(mode) => {
          setCurrentMode(mode);
          handleScrollToTranslator();
        }}
      />

      {/* Contact & Social Links Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </div>
  );
}
