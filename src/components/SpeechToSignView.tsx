import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Sparkles,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Gauge,
  Info,
  Trash2,
} from 'lucide-react';
import { SibiSign } from '../types';
import { SIBI_ALPHABET, SIBI_COMMON_WORDS, QUICK_SAMPLE_PHRASES } from '../data/sibiData';
import { SignCardVisual } from './SignCardVisual';

interface SpeechToSignViewProps {
  soundEnabled: boolean;
  onLogTranslation?: (sourceText: string, translatedResult: string) => void;
}

function buildSignSequence(text: string): { sign: SibiSign; sourceWord: string }[] {
  const cleaned = text.trim();
  if (!cleaned) return [];

  const lowerFull = cleaned.toLowerCase();
  const result: { sign: SibiSign; sourceWord: string }[] = [];

  // Normalize multi-word phrases first
  const tokens = lowerFull
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  let i = 0;
  while (i < tokens.length) {
    const twoWord = i + 1 < tokens.length ? `${tokens[i]} ${tokens[i + 1]}` : '';
    if (twoWord === 'terima kasih') {
      const found = SIBI_COMMON_WORDS.find((w) => w.id === 'terima-kasih');
      if (found) {
        result.push({ sign: found, sourceWord: 'Terima Kasih' });
        i += 2;
        continue;
      }
    }
    if (twoWord === 'sama sama') {
      const found = SIBI_COMMON_WORDS.find((w) => w.id === 'sama-sama');
      if (found) {
        result.push({ sign: found, sourceWord: 'Sama-sama' });
        i += 2;
        continue;
      }
    }
    if (twoWord === 'apa kabar' || twoWord === 'kabar baik') {
      const found = SIBI_COMMON_WORDS.find((w) => w.id === 'kabar-baik');
      if (found) {
        result.push({ sign: found, sourceWord: twoWord });
        i += 2;
        continue;
      }
    }

    const word = tokens[i];
    const matchedCommon = SIBI_COMMON_WORDS.find(
      (w) =>
        w.id === word ||
        w.label.toLowerCase() === word ||
        w.label.toLowerCase().split(/\s*\/\s*/).includes(word)
    );

    if (matchedCommon) {
      result.push({ sign: matchedCommon, sourceWord: word });
    } else {
      for (const ch of word) {
        const letterSign = SIBI_ALPHABET.find((a) => a.id === ch.toLowerCase());
        if (letterSign) {
          result.push({ sign: letterSign, sourceWord: word });
        }
      }
    }
    i++;
  }

  return result;
}

export const SpeechToSignView: React.FC<SpeechToSignViewProps> = ({
  soundEnabled,
  onLogTranslation,
}) => {
  const [inputText, setInputText] = useState('Halo terima kasih');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [flatSigns, setFlatSigns] = useState<{ sign: SibiSign; sourceWord: string }[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const speedMs = {
    slow: 2000,
    normal: 1200,
    fast: 650,
  }[playbackSpeed];

  useEffect(() => {
    const seq = buildSignSequence(inputText);
    setFlatSigns(seq);
    setActiveIndex(0);
    setIsPlaying(false);
  }, [inputText]);

  useEffect(() => {
    if (isPlaying && flatSigns.length > 0) {
      timerRef.current = setInterval(() => {
        setActiveIndex((prev) => {
          if (prev + 1 < flatSigns.length) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, speedMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, flatSigns, speedMs]);

  const toggleMicrophone = () => {
    setSpeechError(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        'Browser Anda belum mendukung Web Speech API. Gunakan Google Chrome atau Microsoft Edge, atau ketik kalimat secara manual.'
      );
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(transcript);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('Izin mikrofon ditolak. Mohon izinkan akses mikrofon di browser Anda.');
        } else {
          setSpeechError(`Gagal menangkap suara (${event.error}). Silakan coba lagi.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setIsPlaying(true);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setSpeechError('Terjadi kendala saat mengaktifkan mikrofon.');
      setIsListening(false);
    }
  };

  const speakCurrentText = () => {
    if (!soundEnabled || !('speechSynthesis' in window) || !inputText.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(inputText);
    utterance.lang = 'id-ID';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const quickPhrases = [
    ...QUICK_SAMPLE_PHRASES,
    'Perkenalkan saya Budi',
    'Sama-sama',
    'Sayang',
  ];

  const currentItem = flatSigns[activeIndex];

  return (
    <div id="speech-to-sign-section" className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 Cols): Editorial Transcription & Input Desk */}
        <div className="lg:col-span-5 bg-[#FFFDF9] rounded-3xl border-2 border-[#1C1917] shadow-[6px_6px_0px_#1C1917] overflow-hidden flex flex-col justify-between">
          {/* Top Bar */}
          <div className="bg-[#1D4ED8] text-white px-6 py-4 border-b-2 border-[#1C1917] flex items-center justify-between">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#DBEAFE] block">
                STUDIO 01 // INPUT UCAPAN &amp; TEKS
              </span>
              <h3 className="font-display font-extrabold text-lg sm:text-xl text-white">
                Meja Transkripsi Bahasa Indonesia
              </h3>
            </div>
            <button
              type="button"
              onClick={speakCurrentText}
              title="Dengarkan Teks (Text-to-Speech)"
              className="tactile-btn p-2.5 rounded-xl bg-[#FFFDF9] text-[#141210] hover:bg-[#FDE68A] cursor-pointer"
            >
              <Volume2 className="w-5 h-5 text-[#1D4ED8]" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Textarea Composition Pad */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="speech-to-sign-textarea"
                  className="font-mono text-xs font-bold uppercase tracking-wider text-[#141210]"
                >
                  Kalimat yang Akan Diterjemahkan
                </label>
                {inputText && (
                  <button
                    type="button"
                    onClick={() => setInputText('')}
                    className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-[#EAE4D7] text-[#141210] hover:bg-[#FDE68A] border border-[#1C1917] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Bersihkan</span>
                  </button>
                )}
              </div>

              <textarea
                id="speech-to-sign-textarea"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ketik kalimat atau tekan tombol Rekam Suara di bawah..."
                rows={4}
                className="w-full rounded-2xl p-4 bg-[#F6F3EC] border-2 border-[#1C1917] text-[#141210] placeholder:text-[#57534E] font-bold text-base sm:text-lg focus:outline-none focus:bg-white transition-colors resize-none"
              />
            </div>

            {/* Primary Voice Record & Translate Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                id="btn-voice-record"
                type="button"
                onClick={toggleMicrophone}
                className={`tactile-btn flex-1 py-3.5 px-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 cursor-pointer ${
                  isListening
                    ? 'bg-[#DC2626] text-white'
                    : 'bg-[#1D4ED8] hover:bg-[#1E40AF] text-white'
                }`}
              >
                {isListening ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                    <MicOff className="w-4 h-4" />
                    <span>Mendengarkan... (Klik Berhenti)</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>Mulai Rekam Suara (ID)</span>
                  </>
                )}
              </button>

              <button
                id="btn-play-signs"
                type="button"
                onClick={() => {
                  setActiveIndex(0);
                  setIsPlaying(true);
                  if (inputText.trim() && flatSigns.length > 0 && onLogTranslation) {
                    onLogTranslation(
                      inputText.trim(),
                      flatSigns.map((f) => f.sign.label).join(' → ')
                    );
                  }
                }}
                disabled={flatSigns.length === 0}
                className="tactile-btn py-3.5 px-5 rounded-2xl font-bold text-sm bg-[#FDE68A] hover:bg-[#FCD34D] text-[#141210] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Putar Peragaan</span>
              </button>
            </div>

            {speechError && (
              <div className="p-3.5 rounded-xl bg-[#FEE2E2] border-2 border-[#1C1917] flex items-start gap-2.5 text-xs text-[#991B1B] font-bold">
                <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <span>{speechError}</span>
              </div>
            )}

            {/* Quick Phrases Keycaps */}
            <div className="pt-4 border-t-2 border-[#EAE4D7]">
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#44403C] uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[#C2410C]" />
                <span>Frasa Instan SIBI (Klik untuk Uji):</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickPhrases.map((phrase) => (
                  <button
                    key={phrase}
                    type="button"
                    onClick={() => {
                      setInputText(phrase);
                      setActiveIndex(0);
                      setIsPlaying(true);
                    }}
                    className={`tactile-btn text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer ${
                      inputText.toLowerCase() === phrase.toLowerCase()
                        ? 'bg-[#141210] text-[#FDE68A]'
                        : 'bg-[#F6F3EC] hover:bg-[#FDE68A] text-[#141210]'
                    }`}
                  >
                    {phrase}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): High-Clarity SIBI Specimen Stage */}
        <div className="lg:col-span-7 bg-[#FFFDF9] rounded-3xl border-2 border-[#1C1917] shadow-[6px_6px_0px_#1C1917] overflow-hidden flex flex-col justify-between min-h-[520px]">
          {/* Stage Top Control Deck */}
          <div className="bg-[#141210] text-[#FFFDF9] px-6 py-4 border-b-2 border-[#1C1917] flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#FDE68A] block">
                PANGGUNG VISUALISASI SIBI
              </span>
              <p className="font-mono text-xs text-[#D6D3D1] tabular-nums mt-0.5">
                {flatSigns.length > 0
                  ? `KARTU ${(activeIndex + 1).toString().padStart(2, '0')} DARI ${flatSigns.length.toString().padStart(2, '0')} · KATA ASAL: "${currentItem?.sourceWord.toUpperCase()}"`
                  : 'MENUNGGU INPUT TEKS ATAU SUARA'}
              </p>
            </div>

            {flatSigns.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {/* Speed Selector */}
                <div className="flex items-center bg-[#292524] p-1 rounded-xl border border-[#44403C]">
                  <Gauge className="w-3.5 h-3.5 text-[#A8A29E] ml-1.5 mr-1" />
                  {(['slow', 'normal', 'fast'] as const).map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2 py-1 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                        playbackSpeed === spd
                          ? 'bg-[#FDE68A] text-[#141210]'
                          : 'text-[#D6D3D1] hover:text-white'
                      }`}
                    >
                      {spd === 'slow' ? '0.5x' : spd === 'normal' ? '1x' : '2x'}
                    </button>
                  ))}
                </div>

                {/* Transport Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label="Isyarat sebelumnya"
                    onClick={() => {
                      setIsPlaying(false);
                      setActiveIndex((prev) => Math.max(0, prev - 1));
                    }}
                    disabled={activeIndex === 0}
                    className="p-2 rounded-xl bg-[#292524] hover:bg-[#44403C] disabled:opacity-40 text-white border border-[#44403C] cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!isPlaying && activeIndex === flatSigns.length - 1) {
                        setActiveIndex(0);
                      }
                      setIsPlaying(!isPlaying);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1D4ED8] hover:bg-[#2563EB] text-white font-bold text-xs border border-white/20 cursor-pointer"
                  >
                    {isPlaying ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                    <span>{isPlaying ? 'Jeda' : 'Putar'}</span>
                  </button>

                  <button
                    type="button"
                    aria-label="Ulangi dari awal"
                    onClick={() => {
                      setIsPlaying(false);
                      setActiveIndex(0);
                    }}
                    className="p-2 rounded-xl bg-[#292524] hover:bg-[#44403C] text-white border border-[#44403C] cursor-pointer"
                    title="Ulangi dari awal"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    aria-label="Isyarat berikutnya"
                    onClick={() => {
                      setIsPlaying(false);
                      setActiveIndex((prev) => Math.min(flatSigns.length - 1, prev + 1));
                    }}
                    disabled={activeIndex === flatSigns.length - 1}
                    className="p-2 rounded-xl bg-[#292524] hover:bg-[#44403C] disabled:opacity-40 text-white border border-[#44403C] cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Stage Center Display */}
          {flatSigns.length > 0 && currentItem ? (
            <div className="p-6 flex-1 flex flex-col justify-between gap-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-[#F6F3EC] rounded-2xl p-5 border-2 border-[#1C1917]">
                {/* Highlighted Sign Card */}
                <div className="md:col-span-5 flex justify-center">
                  <SignCardVisual sign={currentItem.sign} size="lg" highlight={true} />
                </div>

                {/* Anatomical Guide & Context */}
                <div className="md:col-span-7 space-y-4 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold uppercase px-2.5 py-1 rounded bg-[#141210] text-[#FDE68A] tabular-nums">
                      LANGKAH {(activeIndex + 1).toString().padStart(2, '0')} /{' '}
                      {flatSigns.length.toString().padStart(2, '0')}
                    </span>
                    <span className="font-mono text-xs font-bold uppercase px-2.5 py-1 rounded bg-[#DBEAFE] text-[#1E3A8A] border border-[#1C1917]">
                      Kata: “{currentItem.sourceWord}”
                    </span>
                  </div>

                  <div>
                    <h4 className="font-display text-3xl sm:text-4xl font-extrabold text-[#141210] tracking-tight">
                      Isyarat “{currentItem.sign.label}”
                    </h4>
                    <p className="text-sm sm:text-base text-[#44403C] mt-2 leading-relaxed font-medium">
                      {currentItem.sign.description}
                    </p>
                  </div>

                  {currentItem.sign.fingerGuide && (
                    <div className="p-3 rounded-xl bg-[#FFFDF9] border border-[#1C1917] text-xs font-bold text-[#141210]">
                      <span className="font-mono uppercase text-[#57534E] block mb-0.5">
                        Panduan Jari:
                      </span>
                      {currentItem.sign.fingerGuide}
                    </div>
                  )}

                  {currentItem.sign.motion && (
                    <div className="p-3.5 rounded-xl bg-[#FDE68A] border-2 border-[#1C1917] flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#141210]">
                      <Info className="w-4 h-4 text-[#C2410C] shrink-0" />
                      <span>Gerakan: {currentItem.sign.motion}</span>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="pt-1">
                    <div className="w-full h-2.5 bg-[#EAE4D7] rounded-full overflow-hidden border border-[#1C1917]">
                      <div
                        className="h-full bg-[#1D4ED8] transition-all duration-300"
                        style={{
                          width: `${((activeIndex + 1) / flatSigns.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Filmstrip: Full Sign Sequence */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-mono text-xs font-bold text-[#141210] uppercase tracking-wider">
                    Urutan Rangkaian Isyarat (Klik Kartu untuk Lompat):
                  </span>
                  <span className="font-mono text-xs font-bold text-[#57534E] tabular-nums">
                    {flatSigns.length} Gestur
                  </span>
                </div>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 custom-scrollbar">
                  {flatSigns.map((item, idx) => (
                    <button
                      key={`${item.sign.id}-${idx}`}
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setActiveIndex(idx);
                      }}
                      className={`tactile-btn shrink-0 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-bold cursor-pointer ${
                        idx === activeIndex
                          ? 'bg-[#1D4ED8] text-white'
                          : 'bg-[#F6F3EC] text-[#141210] hover:bg-[#FDE68A]'
                      }`}
                    >
                      <span
                        className={`font-mono text-xs font-bold tabular-nums ${
                          idx === activeIndex ? 'text-[#FDE68A]' : 'text-[#57534E]'
                        }`}
                      >
                        {(idx + 1).toString().padStart(2, '0')}
                      </span>
                      <span>{item.sign.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
              <div className="w-16 h-16 rounded-2xl bg-[#F6F3EC] border-2 border-[#1C1917] shadow-[3px_3px_0px_#1C1917] flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-[#1D4ED8]" />
              </div>
              <h4 className="font-display font-extrabold text-xl text-[#141210]">
                Belum Ada Kalimat untuk Diterjemahkan
              </h4>
              <p className="text-sm text-[#44403C] max-w-sm mt-1">
                Ketik kalimat Bahasa Indonesia atau gunakan mikrofon di panel kiri untuk melihat
                visualisasi kartu isyarat SIBI.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
