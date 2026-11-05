import React from 'react';
import { Mic, Camera, Volume2, Hand, ArrowRight, CheckCircle2 } from 'lucide-react';
import { TranslationMode } from '../types';

interface ModeSelectorProps {
  currentMode: TranslationMode;
  onSelectMode: (mode: TranslationMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onSelectMode }) => {
  const isSpeechActive = currentMode === 'speech-to-sign';
  const isSignActive = currentMode === 'sign-to-speech';

  return (
    <div id="mode-selector-container" className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* MODE 01: Speech / Text -> Sign */}
        <button
          id="btn-mode-speech-to-sign"
          type="button"
          onClick={() => onSelectMode('speech-to-sign')}
          aria-pressed={isSpeechActive}
          className={`group relative text-left rounded-3xl overflow-hidden border-2 border-[#1C1917] transition-all duration-200 cursor-pointer flex flex-col justify-between ${
            isSpeechActive
              ? 'bg-[#FFFDF9] shadow-[6px_6px_0px_#1D4ED8] -translate-y-0.5'
              : 'bg-[#EAE4D7]/80 hover:bg-[#FFFDF9] shadow-[3px_3px_0px_#1C1917] opacity-90 hover:opacity-100'
          }`}
        >
          {/* Top Architectural Strip */}
          <div
            className={`px-6 py-3 border-b-2 border-[#1C1917] flex items-center justify-between ${
              isSpeechActive ? 'bg-[#1D4ED8] text-white' : 'bg-[#EAE4D7] text-[#141210]'
            }`}
          >
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
              <span>MODE 01</span>
              <span>//</span>
              <span>MASYARAKAT UMUM → TEMAN TULI</span>
            </div>
            {isSpeechActive ? (
              <span className="inline-flex items-center gap-1 font-mono text-xs font-bold bg-[#FDE68A] text-[#141210] px-2.5 py-0.5 rounded border border-[#1C1917]">
                <CheckCircle2 className="w-3.5 h-3.5" /> STUDIO AKTIF
              </span>
            ) : (
              <span className="font-mono text-xs font-bold underline">Klik untuk Aktifkan</span>
            )}
          </div>

          {/* Card Body */}
          <div className="p-6 flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl border-2 border-[#1C1917] flex items-center justify-center shrink-0 ${
                isSpeechActive
                  ? 'bg-[#DBEAFE] text-[#1D4ED8] shadow-[3px_3px_0px_#1C1917]'
                  : 'bg-[#FFFDF9] text-[#141210]'
              }`}
            >
              <Mic className="w-7 h-7" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#141210]">
                  Bicara &amp; Teks ke Isyarat
                </h2>
                <ArrowRight className="w-5 h-5 text-[#1D4ED8] shrink-0 transition-transform group-hover:translate-x-1" />
              </div>
              <p className="text-sm text-[#44403C] leading-relaxed mb-4">
                Ucapkan kalimat melalui mikrofon atau ketik teks. Sistem otomatis memecahnya menjadi
                peragaan kartu visual kosakata &amp; ejaan jari SIBI.
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-[#F6F3EC] text-[#141210] border border-[#1C1917]">
                  <Volume2 className="w-3.5 h-3.5 text-[#1D4ED8]" /> Web Speech Bahasa Indonesia
                </span>
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-[#F6F3EC] text-[#141210] border border-[#1C1917]">
                  Auto-Slideshow SIBI
                </span>
              </div>
            </div>
          </div>
        </button>

        {/* MODE 02: Sign Camera -> Speech / Text */}
        <button
          id="btn-mode-sign-to-speech"
          type="button"
          onClick={() => onSelectMode('sign-to-speech')}
          aria-pressed={isSignActive}
          className={`group relative text-left rounded-3xl overflow-hidden border-2 border-[#1C1917] transition-all duration-200 cursor-pointer flex flex-col justify-between ${
            isSignActive
              ? 'bg-[#FFFDF9] shadow-[6px_6px_0px_#047857] -translate-y-0.5'
              : 'bg-[#EAE4D7]/80 hover:bg-[#FFFDF9] shadow-[3px_3px_0px_#1C1917] opacity-90 hover:opacity-100'
          }`}
        >
          {/* Top Architectural Strip */}
          <div
            className={`px-6 py-3 border-b-2 border-[#1C1917] flex items-center justify-between ${
              isSignActive ? 'bg-[#047857] text-white' : 'bg-[#EAE4D7] text-[#141210]'
            }`}
          >
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
              <span>MODE 02</span>
              <span>//</span>
              <span>TEMAN TULI → MASYARAKAT UMUM</span>
            </div>
            {isSignActive ? (
              <span className="inline-flex items-center gap-1 font-mono text-xs font-bold bg-[#FDE68A] text-[#141210] px-2.5 py-0.5 rounded border border-[#1C1917]">
                <CheckCircle2 className="w-3.5 h-3.5" /> STUDIO AKTIF
              </span>
            ) : (
              <span className="font-mono text-xs font-bold underline">Klik untuk Aktifkan</span>
            )}
          </div>

          {/* Card Body */}
          <div className="p-6 flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl border-2 border-[#1C1917] flex items-center justify-center shrink-0 ${
                isSignActive
                  ? 'bg-[#D1FAE5] text-[#047857] shadow-[3px_3px_0px_#1C1917]'
                  : 'bg-[#FFFDF9] text-[#141210]'
              }`}
            >
              <Camera className="w-7 h-7" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#141210]">
                  Kamera Isyarat ke Suara
                </h2>
                <ArrowRight className="w-5 h-5 text-[#047857] shrink-0 transition-transform group-hover:translate-x-1" />
              </div>
              <p className="text-sm text-[#44403C] leading-relaxed mb-4">
                Peragakan alfabet A–Z atau kosakata SIBI (1 &amp; 2 tangan) di depan kamera. AI
                membaca titik sendi tangan dan menyuarakannya menjadi kalimat.
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-[#F6F3EC] text-[#141210] border border-[#1C1917]">
                  <Hand className="w-3.5 h-3.5 text-[#047857]" /> MediaPipe 1 &amp; 2 Tangan
                </span>
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-[#F6F3EC] text-[#141210] border border-[#1C1917]">
                  Suara TTS Otomatis
                </span>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
