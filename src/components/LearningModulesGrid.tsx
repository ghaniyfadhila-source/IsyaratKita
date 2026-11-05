import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Hand,
  MessageSquare,
  Award,
  X,
  Volume2,
  Camera,
  MoveRight,
} from 'lucide-react';
import { SIBI_ALPHABET, SIBI_COMMON_WORDS } from '../data/sibiData';
import { SignCardVisual } from './SignCardVisual';
import { SibiSign } from '../types';

interface LearningModulesGridProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onPracticeInCamera?: (sign: SibiSign) => void;
  onSpeak?: (text: string) => void;
}

const ALL_DICTIONARY: SibiSign[] = [...SIBI_ALPHABET, ...SIBI_COMMON_WORDS];
const TWO_HAND_IDS = ['terima-kasih', 'sama-sama', 'tolong', 'perkenalkan', 'nama'];

export const LearningModulesGrid: React.FC<LearningModulesGridProps> = ({
  searchQuery = '',
  onSearchChange,
  onPracticeInCamera,
  onSpeak,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'alfabet' | 'kata-dasar' | 'dua-tangan'
  >('all');
  const [activeSignDetail, setActiveSignDetail] = useState<SibiSign | null>(null);

  const modules = [
    {
      id: 'alfabet-dasar',
      index: 'MODUL 01',
      title: 'Alfabet Jari SIBI (A–Z)',
      subtitle: '26 Huruf Standar Nasional',
      description:
        'Kuasai formasi jari satu tangan untuk mengeja nama, istilah khusus, atau kata yang belum memiliki isyarat tunggal.',
      icon: BookOpen,
      headerBg: 'bg-[#1D4ED8] text-white',
      badgeBg: 'bg-[#DBEAFE] text-[#1E3A8A]',
      count: '26 Isyarat',
      signs: SIBI_ALPHABET.slice(0, 6),
    },
    {
      id: 'sapaan',
      index: 'MODUL 02',
      title: 'Sapaan & Etika Sosial',
      subtitle: 'Percakapan Pembuka Ramah',
      description:
        'Ungkapan sopan santun sehari-hari seperti Halo, Terima Kasih, Sama-sama, Maaf, dan Sayang.',
      icon: Hand,
      headerBg: 'bg-[#047857] text-white',
      badgeBg: 'bg-[#D1FAE5] text-[#065F46]',
      count: `${SIBI_COMMON_WORDS.filter((s) => s.category === 'sapaan').length} Isyarat`,
      signs: SIBI_COMMON_WORDS.filter((s) => s.category === 'sapaan'),
    },
    {
      id: 'kata-dasar',
      index: 'MODUL 03',
      title: 'Kata Ganti & Ekspresi',
      subtitle: 'Komunikasi Inti Harian',
      description:
        'Kosakata frekuensi tinggi seperti Saya, Kamu, Perkenalkan, Tolong, Baik/Bagus, Ya, dan Tidak.',
      icon: MessageSquare,
      headerBg: 'bg-[#C2410C] text-white',
      badgeBg: 'bg-[#FFEDD5] text-[#9A3412]',
      count: `${SIBI_COMMON_WORDS.filter((s) => s.category === 'kata-dasar').length} Isyarat`,
      signs: SIBI_COMMON_WORDS.filter((s) => s.category === 'kata-dasar'),
    },
    {
      id: 'dua-tangan',
      index: 'MODUL 04',
      title: 'Koordinasi 2 Tangan',
      subtitle: 'Deteksi Simultan MediaPipe',
      description:
        'Isyarat yang melibatkan koordinasi aktif kedua tangan sekaligus: Terima Kasih, Sama-sama, Tolong, dan Perkenalkan.',
      icon: Award,
      headerBg: 'bg-[#141210] text-[#FDE68A]',
      badgeBg: 'bg-[#FDE68A] text-[#141210]',
      count: '4 Isyarat 2T',
      signs: SIBI_COMMON_WORDS.filter((s) => TWO_HAND_IDS.includes(s.id)),
    },
  ];

  const categoryFiltered =
    selectedCategory === 'all'
      ? ALL_DICTIONARY
      : selectedCategory === 'alfabet'
        ? SIBI_ALPHABET
        : selectedCategory === 'dua-tangan'
          ? SIBI_COMMON_WORDS.filter((s) => TWO_HAND_IDS.includes(s.id))
          : SIBI_COMMON_WORDS;

  const displayedSigns = searchQuery.trim()
    ? ALL_DICTIONARY.filter(
        (s) =>
          s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.shortDesc && s.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : categoryFiltered;

  const speakSign = (label: string) => {
    if (onSpeak) {
      onSpeak(label);
      return;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(label);
      utterance.lang = 'id-ID';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <section
      id="modul-belajar-section"
      className="w-full py-10 border-t-2 border-[#1C1917]"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#FDE68A] text-[#141210] border border-[#1C1917] inline-block mb-2">
            KURIKULUM &amp; ENSIKLOPEDIA VISUAL SIBI
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#141210] tracking-tight">
            Katalog Modul &amp; Kartu Spesimen Isyarat
          </h2>
          <p className="text-sm sm:text-base text-[#44403C] mt-1 max-w-2xl">
            Klik modul untuk memfilter kategori, atau pilih kartu isyarat mana pun untuk mendengar
            pengucapan dan mempraktikkannya langsung di depan kamera AI.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div
          className="flex items-center bg-[#EAE4D7] p-1.5 rounded-2xl border-2 border-[#1C1917] self-start flex-wrap"
          role="tablist"
          aria-label="Filter kategori kamus SIBI"
        >
          {(
            [
              { key: 'all', label: `Semua (${ALL_DICTIONARY.length})` },
              { key: 'alfabet', label: 'Alfabet A–Z' },
              { key: 'kata-dasar', label: 'Kosakata' },
              { key: 'dua-tangan', label: '2 Tangan' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={selectedCategory === tab.key}
              onClick={() => {
                setSelectedCategory(tab.key);
                onSearchChange?.('');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === tab.key && !searchQuery.trim()
                  ? 'bg-[#141210] text-[#FDE68A] shadow-[2px_2px_0px_#1D4ED8]'
                  : 'text-[#44403C] hover:text-[#141210]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Numbered Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {modules.map((mod) => {
          const IconComponent = mod.icon;
          const targetCategory =
            mod.id === 'alfabet-dasar'
              ? 'alfabet'
              : mod.id === 'dua-tangan'
                ? 'dua-tangan'
                : 'kata-dasar';
          const isSelected = selectedCategory === targetCategory && !searchQuery.trim();

          return (
            <div
              key={mod.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                setSelectedCategory(targetCategory);
                onSearchChange?.('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedCategory(targetCategory);
                  onSearchChange?.('');
                }
              }}
              className={`tactile-card rounded-3xl overflow-hidden flex flex-col justify-between cursor-pointer ${
                isSelected ? 'ring-2 ring-[#1D4ED8] -translate-y-1' : ''
              }`}
            >
              <div>
                <div
                  className={`px-5 py-3 border-b-2 border-[#1C1917] flex items-center justify-between ${mod.headerBg}`}
                >
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">
                    {mod.index}
                  </span>
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded border border-[#1C1917] ${mod.badgeBg}`}
                  >
                    {mod.count}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#F6F3EC] border-2 border-[#1C1917] flex items-center justify-center shrink-0">
                      <IconComponent className="w-5 h-5 text-[#141210]" />
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-lg text-[#141210] leading-tight">
                        {mod.title}
                      </h3>
                      <p className="font-mono text-xs font-bold text-[#57534E]">{mod.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#44403C] leading-relaxed mt-2">{mod.description}</p>
                </div>
              </div>

              {/* Preview Chips */}
              <div className="px-5 pb-4 pt-3 border-t border-[#EAE4D7] bg-[#F6F3EC] flex flex-wrap gap-1.5">
                {mod.signs.map((sign) => (
                  <button
                    key={sign.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSignDetail(sign);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#FFFDF9] hover:bg-[#FDE68A] border border-[#1C1917] text-xs font-bold text-[#141210] transition-colors cursor-pointer"
                  >
                    {sign.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Dictionary Specimen Vault */}
      <div className="bg-[#FFFDF9] rounded-3xl border-2 border-[#1C1917] shadow-[6px_6px_0px_#1C1917] overflow-hidden">
        <div className="bg-[#141210] text-[#FFFDF9] px-6 py-4 border-b-2 border-[#1C1917] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#FDE68A]" />
            <h3 className="font-display font-extrabold text-xl text-white">
              {searchQuery.trim()
                ? `Hasil Pencarian Kamus: "${searchQuery}"`
                : 'Galeri Kartu Spesimen SIBI'}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {searchQuery.trim() && onSearchChange && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="px-2.5 py-1 rounded-lg bg-[#FDE68A] text-[#141210] font-mono text-xs font-bold cursor-pointer"
              >
                Reset Filter
              </button>
            )}
            <span className="font-mono text-xs font-bold text-[#FDE68A] tabular-nums">
              MENAMPILKAN {displayedSigns.length} KARTU ISYARAT · KLIK UNTUK DETAIL
            </span>
          </div>
        </div>

        <div className="p-6 flex flex-wrap gap-4 justify-center sm:justify-start">
          {displayedSigns.map((sign) => (
            <SignCardVisual
              key={sign.id}
              sign={sign}
              size="sm"
              highlight={activeSignDetail?.id === sign.id}
              onClick={() => setActiveSignDetail(sign)}
            />
          ))}
        </div>
      </div>

      {/* Interactive Sign Detail Modal */}
      {activeSignDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141210]/60 backdrop-blur-xs"
          onClick={() => setActiveSignDetail(null)}
        >
          <div
            className="bg-[#FFFDF9] rounded-3xl max-w-lg w-full overflow-hidden border-2 border-[#1C1917] shadow-[8px_8px_0px_#1C1917] relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Strip */}
            <div className="bg-[#141210] text-[#FFFDF9] px-6 py-4 border-b-2 border-[#1C1917] flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#FDE68A]">
                SPESIMEN ISYARAT // {activeSignDetail.category.toUpperCase()}
              </span>
              <button
                type="button"
                aria-label="Tutup detail isyarat"
                onClick={() => setActiveSignDetail(null)}
                className="p-1.5 rounded-lg bg-[#292524] hover:bg-[#44403C] text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center text-center">
              <SignCardVisual sign={activeSignDetail} size="lg" highlight={true} />

              <div className="mt-6 w-full text-left space-y-3 bg-[#F6F3EC] p-4 rounded-2xl border-2 border-[#1C1917]">
                <div>
                  <span className="font-mono text-xs font-bold text-[#57534E] uppercase tracking-wider">
                    Deskripsi Formasi Tangan:
                  </span>
                  <p className="text-sm font-bold text-[#141210] mt-1 leading-relaxed">
                    {activeSignDetail.description}
                  </p>
                </div>

                {activeSignDetail.fingerGuide && (
                  <div className="pt-2 border-t border-[#D4CBB8] text-xs font-bold text-[#141210]">
                    <span className="font-mono uppercase text-[#57534E] block">
                      Posisi Jari:
                    </span>
                    {activeSignDetail.fingerGuide}
                  </div>
                )}

                {activeSignDetail.motion && (
                  <div className="pt-2 border-t border-[#D4CBB8] flex items-center gap-2 text-xs font-bold text-[#C2410C]">
                    <MoveRight className="w-4 h-4 shrink-0" />
                    <span>Catatan Gerakan: {activeSignDetail.motion}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-3 w-full">
                <button
                  type="button"
                  onClick={() => speakSign(activeSignDetail.label)}
                  className="tactile-btn flex-1 py-3 px-4 rounded-xl bg-[#1D4ED8] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Dengarkan Pengucapan</span>
                </button>
                {onPracticeInCamera && (
                  <button
                    type="button"
                    onClick={() => {
                      const signToPractice = activeSignDetail;
                      setActiveSignDetail(null);
                      onPracticeInCamera(signToPractice);
                    }}
                    className="tactile-btn flex-1 py-3 px-4 rounded-xl bg-[#047857] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Praktikkan di Kamera</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
