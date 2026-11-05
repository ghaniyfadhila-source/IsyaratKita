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
  const [_history, setHistory] = useState<TranslationHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

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
    <div className="min-h-screen bg-[#F6F3EC] text-[#141210] flex flex-col font-sans">
      {/* Top Editorial Masthead & Command Bar */}
      <Navbar
        onOpenDictionary={() => setIsDictionaryOpen(true)}
        onOpenModules={handleScrollToModules}
        onOpenAbout={() => setIsContactOpen(true)}
        onOpenTestGuide={() => setIsTestGuideOpen(true)}
        onScrollToTop={handleScrollToTop}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        currentMode={currentMode}
        onSelectMode={(mode) => {
          setCurrentMode(mode);
          handleScrollToTranslator();
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col space-y-8 sm:space-y-10">
        {/* Asymmetric Hero Section & Live Specimen Deck */}
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

        {/* Translator Main Workspace */}
        <div id="translator-main-section" className="space-y-6 pt-2">
          {/* Editorial Section Header Strip */}
          <div className="bg-[#FFFDF9] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-2 border-[#1C1917] shadow-[4px_4px_0px_#1C1917]">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#141210] text-[#FDE68A] border-2 border-[#1C1917] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#141210]">
                  Meja Kerja Penerjemah Bahasa Isyarat &amp; Suara Dua Arah
                </h2>
                <p className="text-xs sm:text-sm text-[#44403C] mt-0.5 font-medium">
                  Pilih salah satu studio di bawah untuk menerjemahkan suara/teks ke kartu visual
                  SIBI atau membaca kamera isyarat tangan menjadi ucapan suara.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setIsTestGuideOpen(true)}
                className="tactile-btn inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FDE68A] hover:bg-[#FCD34D] text-[#141210] text-xs font-extrabold cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#C2410C]" />
                <span>Panduan Uji Cepat</span>
              </button>
            </div>
          </div>

          {/* Two-Way Mode Switchboard */}
          <ModeSelector
            currentMode={currentMode}
            onSelectMode={(mode) => setCurrentMode(mode)}
          />

          {/* Active Translation Studio */}
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

        {/* Structured Learning Modules & Dictionary Catalog */}
        <LearningModulesGrid
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onPracticeInCamera={handlePracticeInCamera}
          onSpeak={handleSpeak}
        />
      </main>

      {/* Tactile Editorial Footer */}
      <footer className="bg-[#141210] text-[#D6D3D1] border-t-2 border-[#1C1917] py-8 mt-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#FDE68A] text-[#141210] flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <span>
              <strong className="font-display text-sm text-[#FFFDF9]">IsyaratKita</strong> ·
              Dikembangkan oleh{' '}
              <button
                type="button"
                onClick={() => setIsContactOpen(true)}
                className="font-bold text-[#FDE68A] hover:underline cursor-pointer"
              >
                Ghaniy Fadhila
              </button>
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#D6D3D1] flex-wrap justify-center font-mono">
            <span>STANDAR SIBI INDONESIA</span>
            <span>//</span>
            <button
              type="button"
              onClick={() => setIsContactOpen(true)}
              className="hover:text-[#FDE68A] font-bold underline cursor-pointer"
            >
              KONTAK &amp; REPOSITORI
            </button>
            <span>//</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#047857] text-white font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              WCAG AA ACCESSIBLE
            </span>
          </div>
        </div>
      </footer>

      {/* SIBI Alphabet & Vocabulary Dictionary Modal */}
      <DictionaryModal
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
        onPracticeInCamera={handlePracticeInCamera}
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
