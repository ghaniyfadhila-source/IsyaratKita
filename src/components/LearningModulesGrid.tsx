import React, { useState } from 'react';
import { SibiSign } from '../types';
import { SIBI_ALPHABET, SIBI_COMMON_WORDS } from '../data/sibiData';
import { SignCardVisual } from './SignCardVisual';
import { HandSignIllustration } from './HandSignIllustration';
import { 
  BookOpen, 
  GraduationCap, 
  Sparkles, 
  Video, 
  Volume2, 
  X, 
  ArrowRight, 
  Check, 
  Search,
  Layers,
  HeartHandshake
} from 'lucide-react';

interface LearningModulesGridProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onPracticeInCamera: (sign: SibiSign) => void;
  onSpeak: (text: string) => void;
}

export interface LearningModuleItem {
  id: string;
  title: string;
  category: string;
  badge: string;
  description: string;
  count: number;
  highlightSigns: string[];
}

export const LearningModulesGrid: React.FC<LearningModulesGridProps> = ({
  searchQuery,
  onSearchChange,
  onPracticeInCamera,
  onSpeak
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedSign, setSelectedSign] = useState<SibiSign | null>(null);

  const modulesList: LearningModuleItem[] = [
    {
      id: 'mod-1',
      title: 'Dasar Alfabet SIBI A–Z',
      category: 'alfabet',
      badge: 'Dasar • 26 Huruf',
      description: 'Penguasaan 26 bentuk jari manual untuk mengeja nama orang, kata baru, dan ejaan baku.',
      count: 26,
      highlightSigns: ['a', 'b', 'c', 'd', 'e']
    },
    {
      id: 'mod-2',
      title: 'Sapaan & Kesantunan',
      category: 'sapaan',
      badge: 'Penting • 5 Kata',
      description: 'Kosakata esensial untuk menyapa, berterima kasih, meminta maaf, dan meminta bantuan dengan santun.',
      count: 5,
      highlightSigns: ['halo', 'terima-kasih', 'sama-sama', 'maaf', 'tolong']
    },
    {
      id: 'mod-3',
      title: 'Kata Ganti & Percakapan',
      category: 'kata-dasar',
      badge: 'Harian • 4 Kata',
      description: 'Menunjuk diri sendiri, lawan bicara, menanyakan nama, serta mengabarkan kondisi kesehatan.',
      count: 4,
      highlightSigns: ['saya', 'kamu', 'nama', 'kabar-baik']
    },
    {
      id: 'mod-4',
      title: 'Gerakan Dua Tangan SIBI',
      category: 'dua-tangan',
      badge: 'Koordinasi • 4 Isyarat',
      description: 'Gerakan terkoordinasi menggunakan kedua telapak tangan yang saling berhadapan, bertumpuk, atau silang.',
      count: 4,
      highlightSigns: ['terima-kasih', 'tolong', 'sama-sama', 'nama']
    }
  ];

  const allSigns: SibiSign[] = [...SIBI_ALPHABET, ...SIBI_COMMON_WORDS];

  // Filter signs according to tab and search query
  const filteredSigns = allSigns.filter((sign) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      sign.label.toLowerCase().includes(q) ||
      sign.description.toLowerCase().includes(q) ||
      (sign.shortDesc && sign.shortDesc.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (activeCategory === 'all') return true;
    if (activeCategory === 'alfabet') return sign.category === 'alfabet';
    if (activeCategory === 'sapaan') return sign.category === 'sapaan';
    if (activeCategory === 'kata-dasar') return sign.category === 'kata-dasar';
    if (activeCategory === 'dua-tangan') {
      return ['terima-kasih', 'sama-sama', 'tolong', 'nama'].includes(sign.id);
    }
    return true;
  });

  return (
    <section id="modul-belajar-section" className="w-full space-y-6 pt-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-1.5">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Kurikulum &amp; Kosakata</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Modul Belajar &amp; Kamus Isyarat SIBI
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Jelajahi materi modul terstruktur atau cari kosakata alfabet dan kata sapaan langsung dengan panduan jari yang jelas.
          </p>
        </div>

        {/* Filter Categories Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Semua Materi' },
            { id: 'modul', label: 'Modul Belajar' },
            { id: 'alfabet', label: 'Alfabet A–Z' },
            { id: 'sapaan', label: 'Sapaan' },
            { id: 'kata-dasar', label: 'Kata Dasar' },
            { id: 'dua-tangan', label: '2 Tangan' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Module Overview Cards Grid (Shown when 'all' or 'modul' is selected) */}
      {(activeCategory === 'all' || activeCategory === 'modul') && !searchQuery && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Modul Pembelajaran Terstruktur</span>
            </h3>
            <span className="text-xs text-slate-500">4 Modul Tersedia</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {modulesList.map((mod) => (
              <div
                key={mod.id}
                className="liquid-glass-card rounded-2xl p-4 flex flex-col justify-between group cursor-pointer"
                onClick={() => {
                  if (mod.category === 'dua-tangan') {
                    setActiveCategory('dua-tangan');
                  } else {
                    setActiveCategory(mod.category);
                  }
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {mod.badge}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
                      {mod.count} Isyarat
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-800 text-base group-hover:text-blue-600 transition-colors">
                    {mod.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-3">
                    {mod.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100/90 mt-4 flex items-center justify-between">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {mod.highlightSigns.slice(0, 4).map((sId) => (
                      <div
                        key={sId}
                        className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center p-0.5 shadow-2xs"
                      >
                        <HandSignIllustration signId={sId} size={20} />
                      </div>
                    ))}
                  </div>

                  <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Buka</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sign Vocabulary Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Daftar Kosakata &amp; Isyarat ({filteredSigns.length})</span>
            </h3>
            {searchQuery && (
              <span className="text-xs text-slate-500">
                Mencari: &ldquo;{searchQuery}&rdquo;
              </span>
            )}
          </div>

          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
            >
              Reset Pencarian
            </button>
          )}
        </div>

        {filteredSigns.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
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
          <div className="liquid-glass rounded-2xl p-8 text-center space-y-3 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">
                Isyarat tidak ditemukan
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Tidak ada kata atau huruf yang cocok dengan &ldquo;{searchQuery}&rdquo;. Coba kata lain seperti &ldquo;Halo&rdquo; atau &ldquo;B&rdquo;.
              </p>
            </div>
            <button
              onClick={() => {
                onSearchChange('');
                setActiveCategory('all');
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Tampilkan Semua Kosakata
            </button>
          </div>
        )}
      </div>

      {/* Sign Detail & Practice Modal */}
      {selectedSign && (
        <div
          id="sign-detail-modal-overlay"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedSign(null)}
        >
          <div
            id="sign-detail-modal-content"
            className="liquid-glass-modal rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-white/60 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-mono font-bold text-lg flex items-center justify-center shadow-xs">
                  {selectedSign.label.length <= 2 ? selectedSign.label : selectedSign.label.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">
                    Isyarat: {selectedSign.label}
                  </h3>
                  <span className="text-xs text-blue-600 font-semibold uppercase tracking-wider">
                    Kategori {selectedSign.category}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedSign(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Illustration Graphic */}
            <div className="bg-white/70 rounded-2xl p-6 border border-slate-100 flex flex-col items-center justify-center shadow-2xs">
              <HandSignIllustration signId={selectedSign.id} size={150} animate={true} />
              <p className="text-xs font-bold text-slate-700 mt-3 text-center">
                Bentuk Tangan SIBI: &ldquo;{selectedSign.label}&rdquo;
              </p>
            </div>

            {/* Explanations & Finger Guide */}
            <div className="space-y-3 text-xs">
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80">
                <span className="font-bold text-slate-800 block mb-0.5">
                  Deskripsi Gerakan:
                </span>
                <p className="text-slate-600 leading-relaxed">
                  {selectedSign.description}
                </p>
              </div>

              {selectedSign.fingerGuide && (
                <div className="bg-blue-50/70 rounded-xl p-3 border border-blue-200/70">
                  <span className="font-bold text-blue-900 block mb-0.5">
                    Panduan Jari:
                  </span>
                  <p className="text-blue-800 leading-relaxed">
                    {selectedSign.fingerGuide}
                  </p>
                </div>
              )}

              {selectedSign.tips && (
                <div className="bg-emerald-50/70 rounded-xl p-3 border border-emerald-200/70">
                  <span className="font-bold text-emerald-900 block mb-0.5">
                    Tips Kamera &amp; Akurasi:
                  </span>
                  <p className="text-emerald-800 leading-relaxed">
                    {selectedSign.tips}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => {
                  onPracticeInCamera(selectedSign);
                  setSelectedSign(null);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs active:scale-98"
              >
                <Video className="w-4 h-4" />
                <span>Coba Praktikkan di Kamera</span>
              </button>

              <button
                onClick={() => onSpeak(selectedSign.label)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                <span>Bunyikan Suara</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
