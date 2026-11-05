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
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      iconBg: 'bg-emerald-600 text-white',
      icon: MessageCircle
    },
    {
      id: 'instagram',
      name: 'Instagram',
      handle: '@jessaarrons',
      description: 'Ikuti aktivitas, update & direct message',
      url: 'https://instagram.com/jessaarrons',
      badge: 'Media Sosial',
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
      iconBg: 'bg-blue-600 text-white',
      icon: Instagram
    },
    {
      id: 'github',
      name: 'GitHub',
      handle: 'ghaniyfadhila-source',
      description: 'Lihat source code repositori IsyaratKita & proyek lain',
      url: 'https://github.com/ghaniyfadhila-source',
      badge: 'Open Source',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
      iconBg: 'bg-slate-800 text-white',
      icon: Github
    },
    {
      id: 'portfolio',
      name: 'Website Portofolio',
      handle: 'ghaniyfadhilaltaf.my.id',
      description: 'Koleksi karya teknologi, profil & rekam jejak',
      url: 'https://ghaniyfadhilaltaf.my.id',
      badge: 'Portofolio Resmi',
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
      iconBg: 'bg-blue-600 text-white',
      icon: Globe
    }
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        id="contact-modal-card"
        className="liquid-glass-modal rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col border border-white/70 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200/80">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                Kontak &amp; Pengembang
              </h2>
              <p className="text-xs text-slate-600">
                Hubungi Ghaniy Fadhila via WhatsApp, Instagram, GitHub &amp; Portofolio
              </p>
            </div>
          </div>
          <button
            id="btn-close-contact-modal"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Tutup dialog kontak"
            aria-label="Tutup dialog kontak"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (Flattened hierarchy with clean dividers) */}
        <div className="overflow-y-auto divide-y divide-slate-200/80 text-slate-800 text-sm bg-white/60">
          {/* Creator Profile Summary */}
          <div className="px-6 py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
                GF
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-slate-900 text-sm">Ghaniy Fadhila</p>
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>ghaniyfadhila@gmail.com</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleCopy('ghaniyfadhila@gmail.com', 'email')}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
              title="Salin alamat email"
              aria-label="Salin alamat email"
            >
              {copiedKey === 'email' ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Social Links List */}
          <div className="divide-y divide-slate-200/70">
            {contactItems.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.id}
                  className="px-6 py-3.5 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {item.name}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-blue-700 font-medium truncate mt-0.5">
                        {item.handle}
                      </p>
                      <p className="text-xs text-slate-600 hidden sm:block truncate">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopy(item.handle, item.id)}
                      className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
                      title={`Salin ${item.name}`}
                      aria-label={`Salin ${item.name}`}
                    >
                      {copiedKey === item.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 transition-colors"
                    >
                      <span>Buka</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white/80 border-t border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Kontak resmi diverifikasi</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
