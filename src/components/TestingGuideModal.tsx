import React, { useState } from 'react';
import { CheckCircle2, X, ClipboardCheck, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

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
      title: '1. Bicara atau Ketik untuk Melihat Isyarat',
      desc: 'Pilih menu "Bicara / Tulis ➔ Lihat Isyarat". Ketik kalimat atau tekan tombol mikrofon untuk berbicara, lalu saksikan peragaan gerakan isyarat tangan kata demi kata.',
      targetMode: 'speech-to-sign' as const
    },
    {
      id: 'test-2',
      title: '2. Membuka Kamus Isyarat',
      desc: 'Buka tombol "Kamus Isyarat" di navigasi atas untuk melihat panduan lengkap 26 bentuk alfabet A–Z dan kata sapaan umum.',
      targetMode: 'speech-to-sign' as const
    },
    {
      id: 'test-3',
      title: '3. Buka Kamera untuk Membaca Gerakan Tangan',
      desc: 'Pilih menu "Gerakan Isyarat ➔ Suara / Tulisan", lalu klik "Buka Kamera". Posisikan tangan Anda dengan santai di depan kamera.',
      targetMode: 'sign-to-speech' as const
    },
    {
      id: 'test-4',
      title: '4. Memperagakan Huruf Tangan (A–Z)',
      desc: 'Peragakan isyarat huruf di depan kamera (misalnya huruf A kepalan tangan, B telapak tegak, L telunjuk & jempol, V tanda damai). Huruf akan terbaca langsung di layar.',
      targetMode: 'sign-to-speech' as const
    },
    {
      id: 'test-5',
      title: '5. Mencoba Gerakan Mengayun & Kata Utuh',
      desc: 'Coba lambaikan tangan untuk "Halo", anggukkan kepalan tangan untuk "Ya", atau gelengkan telunjuk untuk "Tidak". Sistem akan langsung mengenali artinya.',
      targetMode: 'sign-to-speech' as const
    },
    {
      id: 'test-6',
      title: '6. Mengetik Otomatis (Tahan Gerakan Sejenak)',
      desc: 'Pastikan "Ketik Otomatis" aktif. Tahan satu isyarat tangan selama sejenak (~0.8 detik) hingga meteran penuh, huruf akan otomatis masuk ke kalimat.',
      targetMode: 'sign-to-speech' as const
    },
    {
      id: 'test-7',
      title: '7. Membunyikan Suara Kalimat',
      desc: 'Setelah huruf atau kata terangkai, tekan tombol "Bunyikan Suara Kalimat" agar teman dengar dapat mendengarkan ucapan suara bahasa Indonesia.',
      targetMode: 'sign-to-speech' as const
    },
    {
      id: 'test-8',
      title: '8. Melihat Riwayat Percakapan',
      desc: 'Periksa catatan di panel riwayat bawah. Anda dapat memutar ulang suaranya, menyalin tulisan, atau membersihkan riwayat percakapan dengan mudah.',
      targetMode: 'sign-to-speech' as const
    }
  ];

  const completedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div
      id="test-guide-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="test-guide-modal-content"
        className="bg-white rounded-3xl max-w-2xl w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-teal-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-slate-900">
                  Panduan Penggunaan Aplikasi
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-200 text-teal-900">
                  Petunjuk Praktis
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Langkah mudah mencoba seluruh fitur terjemahan dua arah
              </p>
            </div>
          </div>

          <button
            id="btn-close-test-guide"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-700 hover:bg-white/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <span>Langkah Dicoba:</span>
            <span className="text-teal-700 font-bold">
              {completedCount} / {steps.length} Selesai
            </span>
          </div>
          <div className="w-32 bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-teal-600 h-2 transition-all duration-300 rounded-full"
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Steps List */}
        <div className="p-6 space-y-3.5 overflow-y-auto max-h-[60vh]">
          {steps.map((step) => {
            const isChecked = checkedItems[step.id];
            return (
              <div
                key={step.id}
                onClick={() => toggleItem(step.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  isChecked
                    ? 'bg-teal-50/70 border-teal-300'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}} // handled by div click
                  className="mt-1 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-sm font-bold ${
                        isChecked ? 'text-teal-950 line-through' : 'text-slate-900'
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
                      className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 bg-teal-50 px-2 py-0.5 rounded-md hover:bg-teal-100"
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
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Semua fitur siap digunakan dengan lancar</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition-colors shadow-xs"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
