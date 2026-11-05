# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Teman Tuli (Penyandang Disabilitas Tunarungu / Gangguan Pendengaran):** Menggunakan Sistem Isyarat Bahasa Indonesia (SIBI) untuk berkomunikasi secara visual melalui kamera perangkat (1 maupun 2 tangan) agar pesan mereka dapat diterjemahkan menjadi teks dan suara lisan bagi lawan bicara.
- **Masyarakat Umum / Teman Dengar (Keluarga, Pelajar, Pengajar, Petugas Layanan):** Berkomunikasi melalui suara atau teks untuk diterjemahkan secara instan ke peragaan ejaan jari dan kosakata SIBI, serta mempelajari dasar-dasar SIBI secara mandiri lewat kamus dan latihan interaktif.

## Product Purpose

**IsyaratKita** adalah platform web penerjemah Bahasa Isyarat Indonesia (SIBI) dua arah dan media edukasi interaktif yang menjembatani komunikasi langsung antara Teman Tuli dan masyarakat umum. Keberhasilan produk diukur dari kelancaran percakapan dua arah secara instan langsung di browser tanpa hambatan instalasi atau registrasi akun, serta meningkatnya literasi SIBI di masyarakat.

## Positioning

Berbeda dari kamus bahasa isyarat statis satu arah atau aplikasi yang mewajibkan instalasi khusus, **IsyaratKita** menggabungkan penerjemahan dua arah secara *real-time* langsung di browser web:
1. **Suara & Teks ➔ Isyarat SIBI:** Pengenalan suara bahasa Indonesia (*Web Speech API*) yang langsung memvisualisasikan peragaan ejaan jari (A–Z) dan kosakata SIBI.
2. **Kamera Isyarat ➔ Suara & Teks:** Pelacakan geometris 21 titik sendi tangan (*MediaPipe Hands*) secara lokal untuk 1 & 2 tangan sekaligus (mencakup huruf statis, huruf dinamis J/Z, dan kata berpola gerak), diperkuat dengan evaluasi posisi jari berbantuan **Gemini AI Vision** (`gemini-2.5-flash`) serta keluaran suara (*Text-to-Speech*).

## Operating Context

- Digunakan langsung melalui browser modern di perangkat desktop/laptop maupun ponsel pintar (`isyaratkita.web.id`) menggunakan akses kamera depan (*webcam*) dan mikrofon.
- Tiga mode operasi utama di dalam aplikasi:
  1. **Bicara ke Isyarat (`SpeechToSignView`):** Merekam ucapan atau mengetik kalimat, memutar urutan isyarat kata/ejaan jari dengan kontrol kecepatan, serta menyimpan kata cepat (*bookmark*) dan riwayat di penyimpanan lokal.
  2. **Isyarat ke Suara (`SignToSpeechView`):** Mendeteksi gestur tangan dari kamera secara langsung, menyusun huruf/kata menjadi kalimat dengan jeda konfirmasi (*hold time*), membacakannya dengan suara (`id-ID`), serta menyediakan analisis korektif via Gemini AI ketika pengguna ingin memvalidasi gestur.
  3. **Kamus & Belajar SIBI (`DictionaryView`, `QuizView`, `PracticeCameraModal`):** Referensi visual abjad A–Z dan kosakata umum SIBI beserta deskripsi anatomi jari, latihan praktik kamera langsung per item, dan kuis tebak isyarat.

## Capabilities and Constraints

- **Standar Isyarat:** Berfokus penuh pada **SIBI (Sistem Isyarat Bahasa Indonesia)** yang terstandarisasi, mencakup 26 abjad (24 huruf statis + 2 huruf dinamis `J` dan `Z`) serta kosakata harian 1 tangan dan 2 tangan (`Rumah`, `Sayang`, `Terima Kasih`, `Sama-sama`, `Halo`, `Perkenalkan`, `Tolong`, `Maaf`, `Kabar Baik`, `Ya`, `Tidak`, `Saya`, `Bagus`).
- **Akses Instan Tanpa Akun:** Tidak mewajibkan login atau pembuatan akun; preferensi tema, riwayat terjemahan, dan kata tersimpan dikelola di sisi klien (`localStorage`).
- **Arsitektur Hibrida (Lokal + AI Opsional):** Deteksi titik sendi MediaPipe dan klasifikasi aturan geometris berjalan 100% di sisi klien untuk latensi rendah dan privasi kamera; analisis gambar via endpoint `/api/analyze-gesture` (Gemini 2.5 Flash di server Express) bersifat opsional sebagai asisten evaluasi akurasi gestur.
- **Belum Diputuskan Secara Eksplisit:** Ekspansi ke sistem isyarat daerah/komunitas (BISINDO) atau sinkronisasi riwayat lintas perangkat berbasis akun tidak termasuk dalam cakupan saat ini.

## Brand Commitments

- **Nama Produk:** IsyaratKita
- **Slogan / Identitas Utama:** *"Jembatan Komunikasi Tanpa Batas"*
- **Bahasa Antarmuka:** Bahasa Indonesia yang hangat, inklusif, menghormati komunitas Teman Tuli, serta mudah dipahami oleh semua kalangan usia.
- **Tautan Resmi:**
  - Web Produksi: `https://isyaratkita.web.id`
  - Repositori Open-Source: `https://github.com/ghaniyfadhila-source/IsyaratKita`

## Evidence on Hand

- Basis kode penuh aplikasi web di repositori ini (`src/App.tsx`, `src/components/SpeechToSignView.tsx`, `src/components/SignToSpeechView.tsx`, `src/components/DictionaryView.tsx`, `src/components/QuizView.tsx`).
- Mesin klasifikasi geometris 21 titik sendi 1 & 2 tangan (`src/utils/sibiGestureClassifier.ts`) dan pelacak lintasan gerak dinamis (`src/utils/motionTracker.ts`) yang telah terverifikasi dengan 9 suite pengujian otomatis (`src/utils/__tests__/classifier.test.ts`).
- Basis data kamus terstruktur untuk 26 abjad SIBI dan 13 kosakata umum (`src/data/sibiData.ts`).
- Tidak ada klaim testimoni pengguna fiktif, metrik institusi eksternal, atau paket harga berbayar; pekerjaan ke depan tidak boleh mengarang bukti sosial atau klaim komersial yang belum ada.

## Product Principles

1. **Aksesibilitas Instan Tanpa Hambatan:** Setiap fitur utama penerjemahan dan pembelajaran harus langsung dapat diakses begitu halaman dibuka tanpa dinding registrasi atau konfigurasi rumit.
2. **Kejelasan Umpan Balik Dua Arah:** Pengguna yang berbicara maupun pengguna yang berisyarat di depan kamera harus selalu mendapatkan umpan balik visual dan status deteksi yang jelas setiap saat.
3. **Akurasi Anatomi SIBI yang Edukatif:** Setiap representasi isyarat—baik di kamus, peragaan animasi, maupun deteksi kamera—harus selaras dengan deskripsi posisi jari SIBI yang akurat sehingga sekaligus mengedukasi pengguna.
4. **Privasi & Kecepatan Lokal sebagai Fondasi:** Pelacakan kamera waktu-nyata tetap mengutamakan pemrosesan lokal di perangkat pengguna, dengan kecerdasan buatan awan (Gemini AI) hadir sebagai penguat presisi saat dibutuhkan.

## Accessibility & Inclusion

- Dirancang khusus untuk aksesibilitas lintas modalitas sensorik: setiap keluaran suara (*Text-to-Speech*) selalu didampingi transkrip teks visual yang kontras, dan setiap masukan kamera memiliki indikator visual progres penahanan gestur (*hold progress*), status jumlah tangan terdeteksi, serta mode tampilan terang/gelap (*dark mode*).
