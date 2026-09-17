import React, { useState, useEffect } from 'react';
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
  Edit3, 
  Save, 
  RotateCcw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ContactData {
  whatsappNumber: string;
  whatsappGreeting: string;
  instagramUsername: string;
  githubUrl: string;
  portfolioUrl: string;
  email: string;
}

const DEFAULT_CONTACTS: ContactData = {
  whatsappNumber: '6281234567890',
  whatsappGreeting: 'Halo Ghaniy, saya melihat proyek IsyaratKita dan ingin berdiskusi!',
  instagramUsername: 'ghaniyfadhila',
  githubUrl: 'https://github.com/ghaniyfadhila-source',
  portfolioUrl: 'https://ghaniyfadhila-source.github.io',
  email: 'ghaniyfadhila@gmail.com'
};

const STORAGE_KEY = 'isyaratkita_contact_links';

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [contacts, setContacts] = useState<ContactData>(DEFAULT_CONTACTS);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<ContactData>(DEFAULT_CONTACTS);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Load saved contact configurations from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setContacts((prev) => ({ ...prev, ...parsed }));
        setEditForm((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // Ignore parse error
    }
  }, []);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = () => {
    setContacts(editForm);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(editForm));
    setIsEditing(false);
  };

  const handleReset = () => {
    setEditForm(DEFAULT_CONTACTS);
    setContacts(DEFAULT_CONTACTS);
    localStorage.removeItem(STORAGE_KEY);
    setIsEditing(false);
  };

  // Build clean WhatsApp link
  const cleanPhone = contacts.whatsappNumber.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(contacts.whatsappGreeting)}`;
  
  // Build Instagram link
  const cleanIg = contacts.instagramUsername.replace('@', '').trim();
  const igUrl = `https://instagram.com/${cleanIg}`;

  const contactItems = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      handle: contacts.whatsappNumber.startsWith('62') 
        ? `+${contacts.whatsappNumber}` 
        : contacts.whatsappNumber,
      description: 'Hubungi langsung melalui pesan chat',
      url: waUrl,
      rawCopy: waUrl,
      badge: 'Chat Langsung',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-500 text-white',
      icon: MessageCircle
    },
    {
      id: 'instagram',
      name: 'Instagram',
      handle: `@${cleanIg}`,
      description: 'Ikuti aktivitas, update & direct message',
      url: igUrl,
      rawCopy: igUrl,
      badge: 'Media Sosial',
      badgeColor: 'bg-pink-50 text-pink-700 border-pink-200',
      iconBg: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white',
      icon: Instagram
    },
    {
      id: 'github',
      name: 'GitHub',
      handle: contacts.githubUrl.replace('https://github.com/', ''),
      description: 'Lihat source code repositori IsyaratKita & proyek lain',
      url: contacts.githubUrl,
      rawCopy: contacts.githubUrl,
      badge: 'Open Source',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      iconBg: 'bg-slate-900 text-white',
      icon: Github
    },
    {
      id: 'portfolio',
      name: 'Website Portofolio',
      handle: contacts.portfolioUrl.replace(/^https?:\/\//, ''),
      description: 'Koleksi karya teknologi, profil & rekam jejak',
      url: contacts.portfolioUrl,
      rawCopy: contacts.portfolioUrl,
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
                  Ghaniy Fadhila
                </span>
              </h2>
              <p className="text-xs text-teal-100">
                Terhubung langsung via WhatsApp, Instagram, GitHub &amp; Portofolio
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
          {/* Quick Creator Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                GF
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Ghaniy Fadhila</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{contacts.email}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs"
              title="Sesuaikan nomor telepon atau link tautan profil"
            >
              <Edit3 className="w-3.5 h-3.5 text-teal-600" />
              <span>{isEditing ? 'Batal Edit' : 'Edit Link'}</span>
            </button>
          </div>

          {/* Form Mode if editing */}
          {isEditing ? (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Sesuaikan Tautan Kontak Anda
                </span>
                <button
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 underline"
                >
                  <RotateCcw className="w-3 h-3" /> Reset Default
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nomor WhatsApp (Contoh: 628123456789)
                </label>
                <input
                  type="text"
                  value={editForm.whatsappNumber}
                  onChange={(e) => setEditForm({ ...editForm, whatsappNumber: e.target.value })}
                  placeholder="6281234567890"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Username Instagram (tanpa @)
                </label>
                <input
                  type="text"
                  value={editForm.instagramUsername}
                  onChange={(e) => setEditForm({ ...editForm, instagramUsername: e.target.value })}
                  placeholder="ghaniyfadhila"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  URL GitHub
                </label>
                <input
                  type="url"
                  value={editForm.githubUrl}
                  onChange={(e) => setEditForm({ ...editForm, githubUrl: e.target.value })}
                  placeholder="https://github.com/ghaniyfadhila-source"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  URL Website Portofolio
                </label>
                <input
                  type="url"
                  value={editForm.portfolioUrl}
                  onChange={(e) => setEditForm({ ...editForm, portfolioUrl: e.target.value })}
                  placeholder="https://ghaniyfadhila-source.github.io"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  Simpan Perubahan
                </button>
              </div>
            </div>
          ) : null}

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
                      onClick={() => handleCopy(item.rawCopy, item.id)}
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
