import React, { useState } from 'react';
import { X, ClipboardCheck, ArrowRight, ShieldCheck } from 'lucide-react';

interface TestingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToMode: (mode: 'speech-to-sign' | 'sign-to-speech') => void;
}

export const TestingGuideModal: React.FC<TestingGuideModalProps> = ({
  isOpen,
  onClose,
  onGoToMode
}) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    'test-1': false,
    'test-2': false,
    'test-3': false,
    'test-4': false,
    'test-5': false,
    'test-6': false,
    'test-7': false,
    'test-8': false
  });

  if (!isOpen) return null;

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const steps = [
    {
      id: 'test-1',
      title: 'Bicara atau Ketik untuk Melihat Isyarat',
      desc: 'Pilih mode "Bicara / Tulis ke Lihat Isyarat". Ketik kalimat atau tekan mikrofon, lalu perhatikan peragaan animasi isyarat tangan kata demi kata.',
      targetMode: 'speech-to-sign' as const
    },
    {
      id: 'test-2',
      title: 'Membuka Kamus & Modul Isyarat',
      desc: 'Gunakan kolom pencarian di beranda atau tombol "Kamus Isyarat" untuk melihat bentuk jemari alfabet A–Z dan kata sapaan umum.',
      targetMode: 'speech-to-sign' as const
    },
    {
      id: 'test-3',
      title: 'Buka Kamera untuk Membaca Gerakan Tangan',
      desc: 'Pilih mode "Kamera Isyarat ke Suara & Tulisan", lalu klik "Buka Kamera". Posisikan tangan Anda dengan santai di depan webcam.',
      targetMode: 'sign-to-speech' as const
    },
    {
      id: 'test-4',
      title: 'Memperagakan Huruf Tangan (A–Z)',
      desc: 'Peragakan isyarat huruf di depan kamera (misalnya huruf A kepalan, B telapak tegak, C melengkung, V dua jari). Huruf akan terbaca langsung di layar.',
      targetMode: 'sign-to-speech' as const
    },
    {
      id: 'test-5',
      title: 'Mencoba Gerakan Dinamis & 2 Tangan',
      desc: 'Coba lambaikan tangan untuk "Halo", atau rapatkan kedua telapak tangan di dada untuk "Terima Kasih". Sistem akan langsung mengenali artinya.',
      targetMode: 'sign-to-speech' as const
    },
    {
      id: 'test-6',
      title: 'Mengetik Otomatis (Tahan Gerakan Sejenak)',
      desc: 'Pastikan fitur "Ketik Otomatis" aktif. Tahan satu isyarat tangan selama ~1 detik hingga indikator penuh, huruf akan otomatis masuk ke kalimat.',
      targetMode: 'sign-to-speech' as const
    },
    {
      id: 'test-7',
      title: 'Membunyikan Suara Kalimat',
      desc: 'Setelah huruf atau kata terangkai, tekan tombol "Bunyikan Suara Kalimat" agar teman dengar dapat mendengarkan ucapan suara bahasa Indonesia yang jernih.',
      targetMode: 'sign-to-speech' as const
    },
    {
      id: 'test-8',
      title: 'Salin Teks & Bagikan Hasil Terjemahan',
      desc: 'Gunakan tombol salin untuk membagikan teks hasil terjemahan langsung ke pesan atau catatan Anda dengan satu klik cepat.',
      targetMode: 'sign-to-speech' as const
    }
  ];

  const completedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div
      id="test-guide-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="test-guide-modal-content"
        className="liquid-glass-modal rounded-3xl max-w-2xl w-full flex flex-col border border-white/70 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200/80">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">
                Panduan Penggunaan Aplikasi
              </h3>
              <p className="text-xs text-slate-600">
                Langkah mudah mencoba seluruh fitur terjemahan dua arah
              </p>
            </div>
          </div>

          <button
            id="btn-close-test-guide"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Tutup Panduan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-white/70 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 tabular-nums">
            <span>Langkah Dicoba:</span>
            <span className="text-blue-700 font-bold">
              {completedCount} / {steps.length} Selesai
            </span>
          </div>
          <div className="w-36 bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 transition-all duration-300 rounded-full"
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Steps List (Clean divided list, no nested card boxes) */}
        <div className="divide-y divide-slate-200/80 overflow-y-auto max-h-[60vh] bg-white/60">
          {steps.map((step) => {
            const isChecked = checkedItems[step.id];
            return (
              <div
                key={step.id}
                onClick={() => toggleItem(step.id)}
                className={`px-6 py-4 transition-colors cursor-pointer flex items-start gap-3.5 ${
                  isChecked ? 'bg-blue-50/40' : 'hover:bg-slate-50/80'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  aria-label={step.title}
                  className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-sm font-bold ${
                        isChecked ? 'text-slate-500 line-through' : 'text-slate-900'
                      }`}
                    >
                      {step.title}
                    </h4>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onGoToMode(step.targetMode);
                        onClose();
                      }}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors shrink-0 cursor-pointer"
                    >
                      <span>Coba Sekarang</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white/80 border-t border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Semua fitur siap digunakan dengan lancar</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
