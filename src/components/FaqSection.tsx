import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Sparkles, BookOpen, Volume2, Camera } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  badge?: string;
  icon?: React.ReactNode;
}

const FAQS: FaqItem[] = [
  {
    id: 'apa-itu-isyaratkita',
    question: 'Apa itu IsyaratKita dan bagaimana cara kerjanya?',
    badge: 'TENTANG KAMI',
    icon: <Sparkles className="w-4 h-4 text-[#C2410C]" />,
    answer:
      'IsyaratKita adalah platform studio penerjemah bahasa isyarat SIBI (Sistem Isyarat Bahasa Indonesia) dua arah berbasis kecerdasan buatan (AI). IsyaratKita hadir sebagai jembatan komunikasi inklusif antara Teman Tuli dan Teman Dengar, memungkinkan penerjemahan suara ke visual isyarat tangan dan pembacaan gerakan kamera menjadi ucapan suara secara instan tanpa perlu registrasi akun.',
  },
  {
    id: 'suara-ke-isyarat',
    question: 'Bagaimana cara menggunakan penerjemah suara ke bahasa isyarat SIBI?',
    badge: 'STUDIO SUARA',
    icon: <Volume2 className="w-4 h-4 text-[#047857]" />,
    answer:
      'Pada meja kerja studio "Suara ke Isyarat", Anda cukup menekan tombol mikrofon dan berbicara dalam bahasa Indonesia atau mengetikkan kata/kalimat di kolom teks. Sistem IsyaratKita akan secara otomatis memproses kalimat Anda dan menampilkannya sebagai rangkaian kartu visual isyarat tangan SIBI yang interaktif dan dapat diperagakan ulang kata per kata.',
  },
  {
    id: 'gerakan-ke-suara',
    question: 'Apakah IsyaratKita dapat membaca gerakan tangan menjadi suara (penerjemah bahasa isyrat)?',
    badge: 'STUDIO KAMERA',
    icon: <Camera className="w-4 h-4 text-[#B45309]" />,
    answer:
      'Ya! Pada studio "Isyarat ke Suara", Anda dapat mengizinkan akses kamera web. Algoritma pelacakan 21 titik sendi tangan (MediaPipe) dan asisten kecerdasan buatan AI akan mengenali formasi jari 1 tangan maupun 2 tangan (26 abjad SIBI dan kosakata harian). Hasil terjemahan isyarat tangan kemudian otomatis dirangkai menjadi kalimat dan disuarakan melalui text-to-speech bahasa Indonesia.',
  },
  {
    id: 'apa-itu-sibi',
    question: 'Apa itu standar SIBI dalam bahasa isyarat Indonesia?',
    badge: 'STANDAR SIBI',
    icon: <BookOpen className="w-4 h-4 text-[#2563EB]" />,
    answer:
      'SIBI (Sistem Isyarat Bahasa Indonesia) adalah sistem tata isyarat resmi yang dibakukan dalam sistem pendidikan dan komunikasi formal di Indonesia. SIBI memiliki representasi abjad satu tangan yang baku dari A hingga Z serta gestur kosakata terstruktur. IsyaratKita mendukung penuh 26 huruf abjad SIBI (termasuk huruf dinamis J dan Z) dan kosakata inti harian.',
  },
  {
    id: 'akses-gratis-mobile',
    question: 'Apakah website penerjemah bahasa isyarat IsyaratKita ini gratis dan ramah mobile?',
    badge: 'AKSESIBILITAS',
    icon: <HelpCircle className="w-4 h-4 text-[#7C3AED]" />,
    answer:
      'IsyaratKita dapat diakses 100% gratis secara online melalui browser di laptop, komputer, tablet, maupun smartphone tanpa harus mengunduh aplikasi terpisah dari toko aplikasi. Seluruh pemrosesan kamera dioptimalkan agar ringan dan menjaga privasi pengguna.',
  },
];

export const FaqSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('apa-itu-isyaratkita');

  const toggleFaq = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq-section"
      aria-labelledby="faq-heading"
      className="bg-[#FFFDF9] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_#1C1917] space-y-6"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-[#EAE4D7]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FDE68A] text-[#141210] border-2 border-[#1C1917] flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2
              id="faq-heading"
              className="font-display text-lg sm:text-xl font-extrabold text-[#141210]"
            >
              Pertanyaan Umum &amp; Panduan Penerjemah Bahasa Isyarat
            </h2>
            <p className="text-xs sm:text-sm text-[#57534E] font-medium mt-0.5">
              Informasi lengkap seputar fitur studio penerjemah, standar SIBI, dan cara menggunakan IsyaratKita.
            </p>
          </div>
        </div>
        <span className="font-mono text-xs font-bold bg-[#E7E5E4] text-[#1C1917] px-2.5 py-1 rounded border border-[#1C1917] self-start sm:self-auto">
          FAQ &amp; EDUKASI SIBI
        </span>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {FAQS.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className={`rounded-2xl border-2 border-[#1C1917] transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-[#FDFBF7] shadow-[3px_3px_0px_#1C1917]'
                  : 'bg-white hover:bg-[#FAF8F3]'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFaq(faq.id)}
                aria-expanded={isOpen}
                className="w-full text-left p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="shrink-0">{faq.icon}</span>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5">
                    {faq.badge && (
                      <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#FDE68A] text-[#141210] border border-[#1C1917] w-fit">
                        {faq.badge}
                      </span>
                    )}
                    <span className="font-display font-bold text-sm sm:text-base text-[#141210]">
                      {faq.question}
                    </span>
                  </div>
                </div>
                <div
                  className={`w-7 h-7 rounded-lg border border-[#1C1917] flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 bg-[#141210] text-white' : 'bg-[#F6F3EC] text-[#141210]'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-5 sm:px-5 sm:pb-5 pt-1 text-xs sm:text-sm text-[#44403C] leading-relaxed border-t border-[#EAE4D7] bg-[#FFFDF9]/60">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Editorial Footer Tagline */}
      <div className="pt-2 text-center sm:text-left text-xs text-[#78716C] flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-[#EAE4D7]">
        <span>
          Membantu akses komunikasi inklusif melalui <strong>penerjemah bahasa isyarat</strong> dan pembelajaran interaktif.
        </span>
        <span className="font-mono text-[11px] text-[#A8A29E]">
          #IsyaratKita #BahasaIsyaratSIBI
        </span>
      </div>
    </section>
  );
};
