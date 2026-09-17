import React, { useState, useEffect } from 'react';
import { TranslationMode, TranslationHistoryItem } from './types';
import { Navbar } from './components/Navbar';
import { ModeSelector } from './components/ModeSelector';
import { SpeechToSignView } from './components/SpeechToSignView';
import { SignToSpeechView } from './components/SignToSpeechView';
import { DictionaryModal } from './components/DictionaryModal';
import { TestingGuideModal } from './components/TestingGuideModal';
import { HistoryPanel } from './components/HistoryPanel';
import { getSavedHistory, saveHistoryItem, clearHistory } from './utils/historyStorage';
import { Sparkles, CheckCircle2, HeartHandshake, ShieldCheck, History } from 'lucide-react';

export default function App() {
  const [currentMode, setCurrentMode] = useState<TranslationMode>('speech-to-sign');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState<boolean>(false);
  const [isTestGuideOpen, setIsTestGuideOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<TranslationHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(true);

  // Load history from localStorage on initial render
  useEffect(() => {
    const saved = getSavedHistory();
    setHistory(saved);
  }, []);

  const handleLogTranslation = (sourceText: string, translatedResult: string) => {
    const updated = saveHistoryItem(sourceText, translatedResult, currentMode);
    setHistory(updated);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        onOpenDictionary={() => setIsDictionaryOpen(true)}
        onOpenTestGuide={() => setIsTestGuideOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col space-y-6">
        {/* Welcome & Feature Status Banner */}
        <div className="bg-teal-50 border border-teal-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-900 bg-teal-200/70 px-2 py-0.5 rounded-full">
                  Komunikasi Dua Arah
                </span>
                <span className="text-xs font-semibold text-teal-800">
                  Penerjemah Bahasa Isyarat &amp; Suara Otomatis
                </span>
              </div>
              <p className="text-xs text-teal-700/90 mt-0.5">
                Bantu teman dengar dan teman tuli mengobrol lebih mudah: ubah suara/tulisan menjadi isyarat tangan, atau terjemahkan isyarat tangan ke suara nyata.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 text-xs font-bold transition-colors shadow-2xs"
            >
              <History className="w-3.5 h-3.5 text-teal-600" />
              <span>{showHistory ? 'Tutup Riwayat' : 'Buka Riwayat'}</span>
            </button>
            <button
              onClick={() => setIsTestGuideOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cara Pakai</span>
            </button>
          </div>
        </div>

        {/* Two-Way Mode Selector */}
        <ModeSelector
          currentMode={currentMode}
          onSelectMode={(mode) => setCurrentMode(mode)}
        />

        {/* Dynamic Translation View */}
        <div className="flex-1">
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

        {/* Translation History Section */}
        {showHistory && (
          <div className="pt-2">
            <HistoryPanel
              history={history}
              onClearHistory={handleClearHistory}
              soundEnabled={soundEnabled}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-teal-600" />
            <span>
              <strong>IsyaratKita</strong> • Dibangun dengan prinsip aksesibilitas komunikasi inklusif
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-600">
            <span>Standar SIBI (Sistem Isyarat Bahasa Indonesia)</span>
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
        onGoToMode={(mode) => setCurrentMode(mode)}
      />
    </div>
  );
}
