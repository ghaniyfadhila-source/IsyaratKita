import React from 'react';
import { TranslationHistoryItem, TranslationMode } from '../types';
import {
  History,
  Trash2,
  Volume2,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Video,
  Mic,
  Calendar
} from 'lucide-react';

interface HistoryPanelProps {
  history: TranslationHistoryItem[];
  onClearHistory: () => void;
  onSelectHistoryItem?: (item: TranslationHistoryItem) => void;
  soundEnabled: boolean;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onClearHistory,
  onSelectHistoryItem,
  soundEnabled
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string) => {
    if (!soundEnabled || !text) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div id="translation-history-section" className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Riwayat Percakapan
            </h3>
            <p className="text-[11px] text-slate-600">
              Catatan pesan yang sudah diterjemahkan dalam sesi ini
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
            title="Hapus riwayat percakapan"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hapus Riwayat</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="py-8 text-center text-slate-600 space-y-2">
          <MessageSquare className="w-8 h-8 mx-auto text-slate-400" />
          <p className="text-xs font-semibold text-slate-700">Belum ada percakapan tersimpan</p>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            Mulai berbicara, mengetik kalimat, atau memperagakan isyarat untuk melihat riwayat percakapan Anda di sini.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {history.map((item) => {
            const isSpeechToSign = item.mode === 'speech-to-sign';
            return (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 transition-all space-y-1.5 group text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                        isSpeechToSign
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-teal-50 text-teal-700 border border-teal-200'
                      }`}
                    >
                      {isSpeechToSign ? <Mic className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                      <span>{isSpeechToSign ? 'Bicara / Tulis ➔ Isyarat' : 'Isyarat ➔ Suara'}</span>
                    </span>
                    <span className="text-[10px] text-slate-600 font-mono">
                      {item.timestamp}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSpeak(item.translatedResult || item.sourceText)}
                      className="p-1 rounded-md text-slate-600 hover:text-teal-600 hover:bg-slate-200 transition-colors"
                      title="Dengarkan Suara"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleCopy(item.id, item.translatedResult || item.sourceText)}
                      className="p-1 rounded-md text-slate-600 hover:text-teal-600 hover:bg-slate-200 transition-colors"
                      title="Salin Teks"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-800">
                  <span className="font-semibold text-slate-700">{item.sourceText}</span>
                  <ArrowRight className="w-3 h-3 text-teal-600 shrink-0" />
                  <span className="font-bold text-teal-800">{item.translatedResult}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
