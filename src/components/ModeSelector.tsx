import React from 'react';
import { TranslationMode } from '../types';
import { Mic, Video, ArrowRightLeft, Volume2, Hand } from 'lucide-react';

interface ModeSelectorProps {
  currentMode: TranslationMode;
  onSelectMode: (mode: TranslationMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onSelectMode
}) => {
  return (
    <div id="mode-selector-container" className="w-full max-w-4xl mx-auto my-4 px-2">
      <div className="liquid-glass rounded-2xl p-1.5 flex flex-col sm:flex-row gap-2 border border-slate-200/90 shadow-sm">
        {/* Mode A: Speech / Text -> Sign */}
        <button
          id="btn-mode-speech-to-sign"
          onClick={() => onSelectMode('speech-to-sign')}
          className={`flex-1 flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 text-left ${
            currentMode === 'speech-to-sign'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 ring-2 ring-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                currentMode === 'speech-to-sign'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base text-slate-800">
                <span>Bicara / Tulis</span>
                <span className="text-blue-600">➔</span>
                <span>Lihat Isyarat</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Ucapkan atau ketik kata untuk melihat gerakan tangannya
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1 text-slate-400">
            <Hand className="w-4 h-4" />
          </div>
        </button>

        {/* Quick Swap Icon */}
        <div className="hidden sm:flex items-center justify-center px-1 text-slate-400">
          <ArrowRightLeft className="w-4 h-4" />
        </div>

        {/* Mode B: Sign -> Speech / Text */}
        <button
          id="btn-mode-sign-to-speech"
          onClick={() => onSelectMode('sign-to-speech')}
          className={`flex-1 flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 text-left ${
            currentMode === 'sign-to-speech'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 ring-2 ring-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                currentMode === 'sign-to-speech'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base text-slate-800">
                <span>Kamera Isyarat</span>
                <span className="text-blue-600">➔</span>
                <span>Suara &amp; Tulisan</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Peragakan isyarat di kamera untuk dibacakan bersuara
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1 text-slate-400">
            <Volume2 className="w-4 h-4" />
          </div>
        </button>
      </div>
    </div>
  );
};
