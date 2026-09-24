import React, { useState } from 'react';
import { SibiSign } from '../types';
import { SIBI_ALPHABET, SIBI_COMMON_WORDS } from '../data/sibiData';
import { SignCardVisual } from './SignCardVisual';
import { HandSignIllustration } from './HandSignIllustration';
import { X, Search, BookOpen, MoveRight, Lightbulb } from 'lucide-react';

interface DictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPracticeInCamera?: (sign: SibiSign) => void;
}

export const DictionaryModal: React.FC<DictionaryModalProps> = ({ 
  isOpen, 
  onClose,
  onPracticeInCamera
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'alfabet' | 'sapaan' | 'kata-dasar'>('all');
  const [selectedSign, setSelectedSign] = useState<SibiSign | null>(null);

  if (!isOpen) return null;

  const allSigns: SibiSign[] = [...SIBI_ALPHABET, ...SIBI_COMMON_WORDS];

  const filteredSigns = allSigns.filter((sign) => {
    const matchesSearch =
      sign.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sign.shortDesc && sign.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()));

    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && sign.category === activeTab;
  });

  return (
    <div
      id="dictionary-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="dictionary-modal-content"
        className="liquid-glass-modal rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-white/60 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/80">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">
                Kamus Referensi SIBI (Sistem Isyarat Bahasa Indonesia)
              </h3>
              <p className="text-xs text-slate-500">
                Lengkap dengan ilustrasi gestur tangan, panduan jari, dan deskripsi singkat gerakan A–Z
              </p>
            </div>
          </div>

          <button
            id="btn-close-dictionary"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-6 py-4 bg-white/50 border-b border-slate-200/70 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari huruf, kata, atau bentuk jari..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                { id: 'all', label: 'Semua Isyarat' },
                { id: 'alfabet', label: 'Alfabet A–Z' },
                { id: 'sapaan', label: 'Sapaan' },
                { id: 'kata-dasar', label: 'Kata Dasar' }
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white/80 text-slate-700 border border-slate-200 hover:bg-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sign Grid Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
          {filteredSigns.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredSigns.map((sign) => (
                <SignCardVisual
                  key={sign.id}
                  sign={sign}
                  size="sm"
                  onClick={() => setSelectedSign(sign)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500">
              <p className="text-sm font-semibold text-slate-700">Tidak ada isyarat yang cocok</p>
              <p className="text-xs mt-1">Coba kata kunci pencarian yang lain.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-white/70 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium">
            Menampilkan <strong className="text-slate-800">{filteredSigns.length}</strong> isyarat resmi SIBI
          </span>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-slate-500">
              Klik kartu untuk melihat petunjuk lengkap
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* Detail Popup on Card Click */}
      {selectedSign && (
        <div
          className="fixed inset-0 z-60 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedSign(null)}
        >
          <div
            className="liquid-glass-modal rounded-3xl p-6 max-w-md w-full border border-white/70 shadow-2xl space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedSign(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-blue-600 text-white font-mono font-bold text-lg flex items-center justify-center shadow-xs">
                {selectedSign.label.length <= 2 ? selectedSign.label : selectedSign.label.charAt(0)}
              </span>
              <div>
                <h4 className="text-lg font-bold text-slate-800">{selectedSign.label}</h4>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {selectedSign.category}
                </span>
              </div>
            </div>

            {/* Large Visual Illustration */}
            <div className="w-full h-48 rounded-2xl bg-white/70 border border-slate-100 flex items-center justify-center shadow-2xs">
              <HandSignIllustration signId={selectedSign.id} size={140} animate={true} />
            </div>

            {/* Detailed Description */}
            <div className="space-y-2 text-xs">
              <div>
                <span className="font-bold text-slate-800 block mb-0.5">Deskripsi Bentuk Tangan:</span>
                <p className="text-slate-600 leading-relaxed bg-slate-50/90 p-2.5 rounded-xl border border-slate-100">
                  {selectedSign.description}
                </p>
              </div>

              {selectedSign.fingerGuide && (
                <div>
                  <span className="font-bold text-blue-900 block mb-0.5">Posisi Jari Kunci:</span>
                  <p className="text-blue-800 bg-blue-50/80 p-2.5 rounded-xl border border-blue-100 font-medium">
                    💡 {selectedSign.fingerGuide}
                  </p>
                </div>
              )}

              {selectedSign.motion && (
                <div>
                  <span className="font-bold text-slate-800 block mb-0.5">Arah Gerakan:</span>
                  <div className="flex items-center gap-1.5 text-blue-700 bg-blue-50 p-2 rounded-xl">
                    <MoveRight className="w-4 h-4 text-blue-600" />
                    <span>{selectedSign.motion}</span>
                  </div>
                </div>
              )}

              {selectedSign.tips && (
                <div className="flex items-start gap-1.5 text-emerald-900 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200/80">
                  <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Tips Praktik:</strong> {selectedSign.tips}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              {onPracticeInCamera && (
                <button
                  onClick={() => {
                    onPracticeInCamera(selectedSign);
                    setSelectedSign(null);
                    onClose();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  Coba di Kamera
                </button>
              )}
              <button
                onClick={() => setSelectedSign(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
