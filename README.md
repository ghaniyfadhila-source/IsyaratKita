# 🤟 IsyaratKita — Penerjemah Bahasa Isyarat Indonesia (SIBI) & Suara Real-Time Berbasis AI

<div align="center">

![IsyaratKita Banner](https://img.shields.io/badge/IsyaratKita-SIBI%20AI%20Translator-0d9488?style=for-the-badge&logo=google&logoColor=white)
![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Hand%20Landmarks-FF6F00?style=for-the-badge&logo=google&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)

<br />

**Aplikasi web penerjemah dua arah interaktif antara Bahasa Isyarat SIBI (Sistem Isyarat Bahasa Indonesia) dan Suara/Teks secara real-time.**  
*Menjembatani komunikasi inklusif yang mudah, cepat, dan ramah aksesibilitas bagi teman Tuli dan teman Dengar.*

[✨ Demo Langsung](https://ghaniyfadhila-source.github.io) • [📖 Panduan Penggunaan](#-panduan-penggunaan) • [🛠️ Teknologi](#%EF%B8%8F-arsitektur--teknologi) • [📬 Kontak Pengembang](#-kontak--pengembang)

</div>

---

## 🌟 Fitur Utama

### 1. 🔄 Komunikasi Dua Arah (Two-Way Translation)
* **Mode 1: Suara / Tulisan ➡️ Bahasa Isyarat SIBI**
  * Ucapkan kalimat lewat mikrofon (*Speech Recognition*) atau ketikkan teks.
  * Aplikasi otomatis membedah kalimat menjadi rangkaian kartu peragaan isyarat SIBI resmi (kata utuh & ejaan alfabetis).
  * Dilengkapi fitur **Putar Animasi Isyarat Otomatis** dengan pengatur kecepatan peragaan.
* **Mode 2: Bahasa Isyarat Tangan ➡️ Suara & Tulisan**
  * Hadapkan tangan ke kamera webcam/ponsel.
  * MediaPipe membaca 21 titik koordinat tulang tangan (*hand landmarks*) dalam hitungan milidetik secara *client-side*.
  * Deteksi alfabet statis (A–Z) & gerakan isyarat dinamis (Z melukis di udara, J melengkung, Halo melambai, Ya/Tidak, Terima Kasih, Bagus, dll).
  * Fitur **Auto-Commit**: tahan posisi isyarat selama 0.8 detik untuk merangkai kata secara otomatis.
  * Fitur **Text-to-Speech (TTS)**: Membacakan hasil terjemahan kalimat dengan suara bahasa Indonesia alami.

### 2. 🤖 Inspeksi Posisi Tangan dengan Gemini AI Vision
* Periksa akurasi posisi tangan dan kelengkungan jari Anda dengan teknologi Gemini Multimodal.
* Memberikan umpan balik cerdas dan tips koreksi langsung agar gestur Anda sesuai dengan kaidah SIBI standar.

### 3. 📚 Kamus Lengkap SIBI Interaktif
* Daftar lengkap alfabet A–Z beserta deskripsi panduan posisi jari dan telapak tangan.
* Koleksi kosakata umum sehari-hari (Sapaan, Keluarga, Pertanyaan, Kata Kerja, Emosi, dll).
* Pencarian instan dan visualisasi kartu isyarat interaktif.

### 4. 📝 Riwayat Terjemahan & Aksesibilitas Penuh
* Penyimpanan otomatis riwayat percakapan secara lokal (*localStorage*).
* Kompatibel dengan standar kontras warna WCAG AA, navigasi ramah keyboard, dan indikator visual status mikrofon & kamera.
* Desain responsif sempurna di perangkat HP, tablet, maupun laptop/desktop.

---

## 🛠️ Arsitektur & Teknologi

| Komponen | Teknologi yang Digunakan |
| :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript + Vite |
| **Computer Vision AI** | Google MediaPipe Tasks Vision (`@mediapipe/tasks-vision`) |
| **Multimodal AI** | Google Gen AI SDK (`@google/genai`) |
| **Voice / Speech Engine** | Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) |
| **Styling & Icons** | Tailwind CSS v4 + Lucide React |
| **Motion & Tracker** | Custom Landmark Vector Geometry & Motion Energy Analysis |
| **Deployment** | Vercel / Google Cloud Run / Render (HTTPS Enforced) |

---

## 🚀 Panduan Memulai Cepat (Local Development)

### Prasyarat
- [Node.js](https://nodejs.org/) versi 18.0 atau lebih tinggi
- Browser modern yang mendukung akses Webcam & Web Speech (Google Chrome, Microsoft Edge, Brave, Safari, atau Firefox)

### Langkah Instalasi

1. **Clone repositori ini:**
   ```bash
   git clone https://github.com/ghaniyfadhila-source/IsyaratKita.git
   cd IsyaratKita
   ```

2. **Instal dependensi:**
   ```bash
   npm install
   ```

3. **(Opsional) Konfigurasi Environment Variable:**
   Buat file `.env` di root folder jika ingin mengaktifkan inspeksi AI Gemini Vision:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Jalankan server pengembangan lokal:**
   ```bash
   npm run dev
   ```
   Buka browser Anda dan akses `http://localhost:3000` (atau port yang tertera di terminal).

5. **Build untuk Produksi:**
   ```bash
   npm run build
   ```

---

## 🌐 Panduan Deployment ke Vercel (Gratis & HTTPS Otomatis)

1. **Push kode ke GitHub** (pastikan file `.env` tidak terunggah).
2. Buka [Vercel](https://vercel.com) dan login menggunakan akun GitHub Anda.
3. Klik **"Add New Project"** ➡️ pilih repositori **`IsyaratKita`**.
4. Pengaturan build di Vercel:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. *(Opsional)* Di bagian **Environment Variables**, tambahkan `GEMINI_API_KEY` jika diperlukan.
6. Klik **"Deploy"**. Website Anda akan aktif dengan protokol **HTTPS resmi** dalam ~1 menit!

> 💡 **Catatan Penting HTTPS**: Akses kamera (Webcam/MediaPipe) dan mikrofon hanya diizinkan oleh browser pada koneksi **HTTPS** atau `localhost`. Hosting di Vercel sudah otomatis mengaktifkan sertifikat SSL/HTTPS secara gratis.

---

## 📁 Struktur Direktori Proyek

```text
IsyaratKita/
├── public/                 # Aset statis & ilustrasi
├── src/
│   ├── components/         # Komponen UI modular
│   │   ├── Navbar.tsx             # Navigasi atas & tombol navigasi
│   │   ├── ModeSelector.tsx       # Pemilih mode 2 arah
│   │   ├── SpeechToSignView.tsx   # Tampilan Suara/Teks -> Isyarat SIBI
│   │   ├── SignToSpeechView.tsx   # Tampilan Kamera MediaPipe -> Suara
│   │   ├── HandSignIllustration.tsx # Visualisasi anatomi tangan SVG
│   │   ├── SignCardVisual.tsx     # Kartu isyarat visual
│   │   ├── DictionaryModal.tsx    # Kamus alfabet & kosakata SIBI
│   │   ├── ContactModal.tsx       # Dialog kontak & profil pengembang
│   │   ├── HistoryPanel.tsx       # Panel riwayat terjemahan
│   │   └── TestingGuideModal.tsx  # Panduan interaktif cara pakai
│   ├── data/
│   │   └── sibiData.ts            # Database huruf SIBI & kosakata umum
│   ├── utils/
│   │   ├── mediaPipeService.ts    # Inisialisasi HandLandmarker 21 poin
│   │   ├── sibiGestureClassifier.ts # Algoritma geometri klasifikasi gestur
│   │   ├── motionTracker.ts       # Pelacak vektor ayunan & gerakan dinamis
│   │   └── historyStorage.ts      # Pengelola penyimpanan riwayat lokal
│   ├── types.ts                   # Definisi tipe TypeScript
│   ├── App.tsx                    # Komponen utama aplikasi
│   ├── main.tsx                   # Entry point React DOM
│   └── index.css                  # Konfigurasi Tailwind CSS
├── vercel.json             # Konfigurasi routing SPA Vercel
├── package.json            # Daftar dependensi & script build
└── README.md               # Dokumentasi proyek
```

---

## 🎯 Cara Penggunaan Singkat

1. **Menerjemahkan Suara ke Isyarat**:
   - Pilih tab **"Suara / Tulisan ➡️ Isyarat"**.
   - Klik tombol mikrofon dan ucapkan kalimat (contoh: *"Halo selamat pagi"*).
   - Kartu isyarat SIBI akan muncul seketika dan dapat diputar sebagai animasi berurutan.
2. **Menerjemahkan Isyarat ke Suara**:
   - Pilih tab **"Isyarat Tangan ➡️ Suara"**.
   - Klik **"Buka Kamera"** dan izinkan akses kamera pada browser.
   - Posisikan tangan di dalam frame panduan. Tahan posisi jari untuk menyusun kata, lalu tekan **"Bicara"** untuk mendengarkan suaranya.
3. **Membuka Kamus & Kontak**:
   - Klik **"Kamus SIBI"** pada navbar untuk melihat referensi seluruh alfabet A–Z dan contoh kata.
   - Klik **"Kontak"** pada navbar untuk terhubung langsung dengan pembuat aplikasi.

---

## 📬 Kontak & Pengembang

Dibuat dengan ❤️ oleh **Ghaniy Fadhila**:

- 💬 **WhatsApp**: [Hubungi via WhatsApp](https://wa.me/6281234567890?text=Halo%20Ghaniy,%20saya%20tertarik%20dengan%20proyek%20IsyaratKita)
- 📸 **Instagram**: [@ghaniyfadhila](https://instagram.com/ghaniyfadhila)
- 💻 **GitHub**: [@ghaniyfadhila-source](https://github.com/ghaniyfadhila-source)
- 🌐 **Website Portofolio**: [ghaniyfadhila-source.github.io](https://ghaniyfadhila-source.github.io)
- ✉️ **Email**: `ghaniyfadhila@gmail.com`

---

## 📜 Lisensi

Proyek ini dirilis di bawah lisensi [MIT License](LICENSE). Bebas digunakan untuk pembelajaran, riset aksesibilitas, dan pengembangan komunitas inklusif.

<div align="center">
  <sub>IsyaratKita • Mari Wujudkan Ruang Komunikasi yang Lebih Inklusif & Terbuka untuk Semua.</sub>
</div>
