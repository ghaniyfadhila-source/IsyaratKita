import React, { useState, useEffect, useRef } from 'react';
import { SibiSign } from '../types';
import { SIBI_ALPHABET, SIBI_COMMON_WORDS, QUICK_SAMPLE_PHRASES } from '../data/sibiData';
import { HandSignIllustration } from './HandSignIllustration';
import {
  Mic,
  MicOff,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Sparkles,
  Info,
  Layers,
  Volume2,
  MoveRight,
  Lightbulb
} from 'lucide-react';

interface SpeechToSignViewProps {
  soundEnabled: boolean;
  onLogTranslation?: (sourceText: string, translatedResult: string) => void;
}

export const SpeechToSignView: React.FC<SpeechToSignViewProps> = ({
  soundEnabled,
  onLogTranslation
}) => {
  const [inputText, setInputText] = useState('Halo kawan');
  const [signQueue, setSignQueue] = useState<SibiSign[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  const parseTextToSigns = (text: string): SibiSign[] => {
    const cleanText = text.trim();
    if (!cleanText) return [];

    const words = cleanText.toLowerCase().split(/\s+/);
    const result: SibiSign[] = [];

    words.forEach((word) => {
      const sanitized = word.replace(/[^a-z0-9]/gi, '');
      if (!sanitized) return;

      const matchedWord = SIBI_COMMON_WORDS.find(
        (w) =>
          w.id.toLowerCase() === sanitized ||
          w.label.toLowerCase().includes(sanitized)
      );

      if (matchedWord) {
        result.push(matchedWord);
      } else {
        for (const char of sanitized) {
          const letterSign = SIBI_ALPHABET.find(
            (s) => s.label.toLowerCase() === char.toLowerCase()
          );
          if (letterSign) {
            result.push(letterSign);
          }
        }
      }
    });

    return result;
  };

  useEffect(() => {
    const signs = parseTextToSigns(inputText);
    setSignQueue(signs);
    setCurrentIndex(0);
    setIsPlaying(false);
  }, [inputText]);

  useEffect(() => {
    if (isPlaying && signQueue.length > 0) {
      const intervalTime = Math.max(500, Math.floor(1500 / playbackSpeed));
      timerRef.current = window.setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= signQueue.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalTime);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, signQueue.length, playbackSpeed]);

  const handleTogglePlay = () => {
    if (signQueue.length === 0) return;
    if (currentIndex >= signQueue.length - 1) {
      setCurrentIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
    if (!isPlaying && onLogTranslation && inputText.trim()) {
      const summarySigns = signQueue.map((s) => s.label).join(' ');
      onLogTranslation(inputText, `[${signQueue.length} Isyarat SIBI: ${summarySigns}]`);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsPlaying(true);
    if (onLogTranslation && inputText.trim()) {
      const summarySigns = signQueue.map((s) => s.label).join(' ');
      onLogTranslation(inputText, `[${signQueue.length} Isyarat SIBI: ${summarySigns}]`);
    }
  };

  const handleNext = () => {
    if (currentIndex < signQueue.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleToggleMic = () => {
    if (!speechSupported) {
      alert('Browser ini belum mendukung Web Speech Recognition. Anda tetap dapat mengetik teks langsung.');
      return;
    }

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => any }).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error('Speech recognition error:', e);
      setIsListening(false);
    }
  };

  const speakCurrentText = () => {
    if (!soundEnabled || !inputText) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(inputText);
      utterance.lang = 'id-ID';
      window.speechSynthesis.speak(utterance);
    }
  };

  const currentSign = signQueue[currentIndex];

  return (
    <div id="speech-to-sign-section" className="space-y-6 max-w-5xl mx-auto">
      {/* Direction Information Header */}
      <div className="liquid-glass rounded-3xl p-5 border border-slate-200/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Ubah Suara &amp; Tulisan Menjadi Gerakan Isyarat
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Ucapkan kata lewat mikrofon atau ketik kalimat Anda. Sistem akan menampilkan panduan gerakan tangan SIBI secara berurutan.
          </p>
        </div>

        {/* Quick Speak Button */}
        <button
          id="btn-speak-input-text"
          onClick={speakCurrentText}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors cursor-pointer shrink-0"
          title="Dengarkan pengucapan teks"
        >
          <Volume2 className="w-4 h-4 text-blue-600" />
          <span>Dengarkan Suara</span>
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input & Transcript Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="liquid-glass rounded-3xl p-5 border border-slate-200/90 space-y-4">
            <label
              htmlFor="speech-input-field"
              className="block text-sm font-bold text-slate-900"
            >
              Ketik Kalimat atau Mulai Bicara
            </label>

            <div className="relative">
              <textarea
                id="speech-input-field"
                rows={3}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ketik kalimat di sini atau gunakan tombol mikrofon di bawah..."
                className="w-full rounded-2xl border border-slate-200 bg-white/95 p-3 pr-16 text-xs sm:text-sm text-slate-900 placeholder:text-slate-600 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 resize-none transition-all font-medium"
              />
              {inputText && (
                <button
                  onClick={() => setInputText('')}
                  className="absolute top-2.5 right-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  Hapus
                </button>
              )}
            </div>

            {/* Input Action Controls */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                id="btn-toggle-mic"
                onClick={handleToggleMic}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-98 cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span>Mendengarkan...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>Mulai Bicara (Mikrofon)</span>
                  </>
                )}
              </button>

              <span className="text-xs font-semibold text-slate-600 tabular-nums">
                {signQueue.length} isyarat tangan
              </span>
            </div>

            {/* Quick Sample Chips */}
            <div className="pt-3 border-t border-slate-200/70">
              <span className="text-xs font-semibold text-slate-600 mb-2 block">
                Pilihan Kalimat Cepat:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SAMPLE_PHRASES.map((phrase, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputText(phrase)}
                    className="px-2.5 py-1 text-xs bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 rounded-lg text-slate-700 transition-colors cursor-pointer"
                  >
                    {phrase}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SIBI Grammar Hint */}
          <div className="liquid-glass rounded-2xl p-4 border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Informasi SIBI</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Kata yang sering digunakan (seperti <em>Halo, Terima Kasih, Maaf, Tolong</em>) memiliki isyarat khusus satu kata utuh. Sedangkan kata lainnya diperagakan dengan mengeja huruf demi huruf (A–Z).
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Sign Visualizer Stage (flattened hierarchy, no nested cards) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="liquid-glass rounded-3xl p-6 border border-slate-200/90 flex flex-col justify-between min-h-[440px]">
            {/* Visualizer Stage Top Bar */}
            <div className="w-full flex items-center justify-between border-b border-slate-200/80 pb-3.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-bold text-slate-900">
                  Peragaan Gerakan Tangan
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-600 tabular-nums">
                <span>Gerakan:</span>
                <span className="font-bold text-blue-700">
                  {signQueue.length > 0 ? currentIndex + 1 : 0}
                </span>
                <span>/ {signQueue.length}</span>
              </div>
            </div>

            {/* Central Stage: Active Sign Display (clean divided sections without nested card borders) */}
            <div className="my-5 w-full flex flex-col items-center justify-center">
              {currentSign ? (
                <div className="w-full space-y-5">
                  {/* Top visual stage */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-full max-w-sm flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 uppercase tracking-wider">
                        {currentSign.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200 tabular-nums">
                        #{currentIndex + 1}
                      </span>
                    </div>

                    <div className="relative flex items-center justify-center py-2">
                      <HandSignIllustration
                        signId={currentSign.id}
                        size={148}
                        animate={true}
                      />
                    </div>

                    {currentSign.motion && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 text-xs font-semibold border border-emerald-200 mt-1">
                        <MoveRight className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Arah: {currentSign.motion}</span>
                      </div>
                    )}

                    <p className="font-extrabold text-xl sm:text-2xl text-slate-900 mt-2">
                      {currentSign.label}
                    </p>
                  </div>

                  {/* Instruction details separated by clean hairline divider */}
                  <div className="pt-4 border-t border-slate-200/80 text-left w-full space-y-2.5">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Cara Melakukan Gerakan:
                      </span>
                      <p className="text-xs sm:text-sm text-slate-700 mt-0.5 leading-relaxed">
                        {currentSign.description}
                      </p>
                    </div>

                    {currentSign.fingerGuide && (
                      <div className="flex items-start gap-2 text-xs text-blue-900 pt-1">
                        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Bentuk Jari:</strong> {currentSign.fingerGuide}
                        </span>
                      </div>
                    )}

                    {currentSign.tips && (
                      <div className="flex items-start gap-2 text-xs text-emerald-900 pt-0.5">
                        <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Tips Latihan:</strong> {currentSign.tips}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-600 space-y-2">
                  <Sparkles className="w-8 h-8 mx-auto text-slate-400" />
                  <p className="text-sm font-semibold text-slate-800">Belum ada kalimat yang dimasukkan</p>
                  <p className="text-xs text-slate-600">Ketik kalimat atau tekan tombol mikrofon di sebelah kiri.</p>
                </div>
              )}
            </div>

            {/* Playback Controls Toolbar */}
            <div className="w-full pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-playback-restart"
                  onClick={handleRestart}
                  disabled={signQueue.length === 0}
                  className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
                  title="Ulangi dari awal"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  id="btn-playback-prev"
                  onClick={handlePrev}
                  disabled={currentIndex === 0 || signQueue.length === 0}
                  className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
                  title="Gerakan Sebelumnya"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  id="btn-playback-toggle"
                  onClick={handleTogglePlay}
                  disabled={signQueue.length === 0}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-40 transition-all active:scale-98 cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Jeda</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Putar Gerakan</span>
                    </>
                  )}
                </button>
                <button
                  id="btn-playback-next"
                  onClick={handleNext}
                  disabled={currentIndex >= signQueue.length - 1 || signQueue.length === 0}
                  className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
                  title="Gerakan Berikutnya"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Speed Selector */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-600 font-medium">Kecepatan:</span>
                {[0.5, 1, 1.5].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer tabular-nums ${
                      playbackSpeed === speed
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sequence Timeline Strip */}
          {signQueue.length > 0 && (
            <div className="liquid-glass rounded-2xl p-4 border border-slate-200/90">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-900">
                  Daftar Urutan Gerakan ({signQueue.length})
                </span>
                <span className="text-xs text-slate-600">
                  Pilih item untuk melihat detail isyarat
                </span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {signQueue.map((sign, idx) => (
                  <button
                    key={`${sign.id}-${idx}`}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsPlaying(false);
                    }}
                    className={`shrink-0 w-16 h-22 rounded-2xl p-1.5 flex flex-col items-center justify-between text-xs border transition-all cursor-pointer ${
                      currentIndex === idx
                        ? 'bg-white text-blue-900 border-blue-600 ring-2 ring-blue-500/30 scale-105'
                        : 'bg-white/90 text-slate-700 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-600 tabular-nums">
                      #{idx + 1}
                    </span>
                    <div className="w-8 h-8 flex items-center justify-center pointer-events-none">
                      <HandSignIllustration signId={sign.id} size={30} />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-900 line-clamp-1">
                      {sign.label.length <= 2 ? sign.label : sign.label.charAt(0)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
