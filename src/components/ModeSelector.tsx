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
    <div id="mode-selector-container" className="w-full max-w-4xl mx-auto my-6 px-4">
      <div className="bg-slate-200/80 p-1.5 rounded-2xl flex flex-col sm:flex-row gap-2 border border-slate-300/80 shadow-xs">
        {/* Mode A: Speech / Text -> Sign */}
        <button
          id="btn-mode-speech-to-sign"
          onClick={() => onSelectMode('speech-to-sign')}
          className={`flex-1 flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 text-left ${
            currentMode === 'speech-to-sign'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200 ring-2 ring-teal-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                currentMode === 'speech-to-sign'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-300 text-slate-700'
              }`}
            >
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base">
                <span>Bicara / Tulis</span>
                <span className="text-teal-600">➔</span>
                <span>Lihat Isyarat</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Ucapkan atau ketik kata untuk melihat gerakan tangannya
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1 text-slate-600">
            <Hand className="w-4 h-4" />
          </div>
        </button>

        {/* Quick Swap Icon (Visual separator) */}
        <div className="hidden sm:flex items-center justify-center px-1 text-slate-600">
          <ArrowRightLeft className="w-4 h-4" />
        </div>

        {/* Mode B: Sign -> Speech / Text */}
        <button
          id="btn-mode-sign-to-speech"
          onClick={() => onSelectMode('sign-to-speech')}
          className={`flex-1 flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 text-left ${
            currentMode === 'sign-to-speech'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200 ring-2 ring-teal-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                currentMode === 'sign-to-speech'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-300 text-slate-700'
              }`}
            >
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base">
                <span>Kamera Isyarat</span>
                <span className="text-teal-600">➔</span>
                <span>Suara &amp; Tulisan</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Peragakan isyarat di kamera untuk dibacakan bersuara
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1 text-slate-600">
            <Volume2 className="w-4 h-4" />
          </div>
        </button>
      </div>
    </div>
  );
};
