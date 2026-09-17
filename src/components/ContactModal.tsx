import React, { useState } from 'react';
import { 
  X, 
  MessageCircle, 
  Instagram, 
  Github, 
  Globe, 
  ExternalLink, 
  Copy, 
  Check, 
  Mail, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ContactItem {
  id: string;
  name: string;
  handle: string;
  description: string;
  url: string;
  badge: string;
  badgeColor: string;
  iconBg: string;
  icon: React.ElementType;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const contactItems: ContactItem[] = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      handle: '+62 831-0355-2129',
      description: 'Hubungi langsung melalui pesan chat',
      url: 'https://wa.me/6283103552129?text=Halo%20Ghaniy,%20saya%20melihat%20proyek%20IsyaratKita%20dan%20ingin%20berdiskusi!',
      badge: 'Chat Langsung',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-500 text-white',
      icon: MessageCircle
    },
    {
      id: 'instagram',
      name: 'Instagram',
      handle: '@jessaarrons',
      description: 'Ikuti aktivitas, update & direct message',
      url: 'https://instagram.com/jessaarrons',
      badge: 'Media Sosial',
      badgeColor: 'bg-pink-50 text-pink-700 border-pink-200',
      iconBg: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white',
      icon: Instagram
    },
    {
      id: 'github',
      name: 'GitHub',
      handle: 'ghaniyfadhila-source',
      description: 'Lihat source code repositori IsyaratKita & proyek lain',
      url: 'https://github.com/ghaniyfadhila-source',
      badge: 'Open Source',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      iconBg: 'bg-slate-900 text-white',
      icon: Github
    },
    {
      id: 'portfolio',
      name: 'Website Portofolio',
      handle: 'ghaniyfadhilaltaf.my.id',
      description: 'Koleksi karya teknologi, profil & rekam jejak',
      url: 'https://ghaniyfadhilaltaf.my.id',
      badge: 'Portofolio Resmi',
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
      iconBg: 'bg-teal-600 text-white',
      icon: Globe
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="contact-modal-card"
        className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-700 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs border border-white/20">
              <Globe className="w-5 h-5 text-teal-100" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Kontak &amp; Pengembang
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                  Resmi
                </span>
              </h2>
              <p className="text-xs text-teal-100">
                Hubungi Ghaniy Fadhila via WhatsApp, Instagram, GitHub &amp; Portofolio
              </p>
            </div>
          </div>
          <button
            id="btn-close-contact-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="Tutup dialog kontak"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-800 text-sm">
          {/* Creator Profile Summary Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50 to-slate-50 border border-teal-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-teal-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                GF
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-slate-900 text-sm">Ghaniy Fadhila</p>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-teal-600" />
                  <span>ghaniyfadhila@gmail.com</span>
                </div>
              </div>
            </div>

            <span className="text-[11px] font-semibold text-teal-800 bg-teal-100/70 px-2.5 py-1 rounded-md border border-teal-200">
              Developer IsyaratKita
            </span>
          </div>

          {/* Contact Cards List */}
          <div className="grid grid-cols-1 gap-3">
            {contactItems.map((item) => {
              const Icon = item.icon;
              const isCopied = copiedKey === item.id;

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-xs transition-all bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${item.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900">{item.name}</span>
                        <span className={`px-2 py-0.2 rounded-md text-[10px] font-semibold border ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-teal-700 font-medium font-mono">
                        {item.handle}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleCopy(item.url, item.id)}
                      className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-teal-700 hover:bg-teal-50 hover:border-teal-200 transition-colors text-xs flex items-center gap-1"
                      title="Salin tautan ke clipboard"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-[11px] text-emerald-600 font-medium">Disalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-medium hidden sm:inline">Salin</span>
                        </>
                      )}
                    </button>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-2xs"
                    >
                      <span>Buka</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200/60 text-xs text-teal-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <p>
              Tautan di atas membuka langsung saluran komunikasi resmi Ghaniy Fadhila di tab baru yang aman (HTTPS terenkripsi).
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            IsyaratKita &bull; SIBI AI Translator
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
