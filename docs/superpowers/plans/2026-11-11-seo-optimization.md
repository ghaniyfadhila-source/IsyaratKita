# Search Engine Optimization (SEO) Implementation Plan for IsyaratKita

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengoptimalkan website IsyaratKita agar terindeks sempurna dan berperingkat tinggi di mesin pencari (Google, dsb.) untuk kata kunci target ("penerjemah bahasa isyarat", "isyarat kita", "bahasa isyrat") dengan domain produksi `https://isyaratkita.web.id`.

**Architecture:** Menerapkan full-suite On-Page SEO teknis dan konten: metadata komprehensif di `index.html` (meta description, keywords, Open Graph, Twitter Cards, canonical link), Schema.org JSON-LD structured data (`WebApplication` & `FAQPage`), fallback semantik noscript/crawler, berkas perayap `robots.txt` dan `sitemap.xml` di direktori `public/`, serta section FAQ semantik di antarmuka web untuk meningkatkan densitas kata kunci organik dan potensi Google Rich Snippets.

**Tech Stack:** HTML5 Semantic Metadata, Schema.org (JSON-LD), Vite Static Public Asset Pipeline, React 19, TypeScript, TailwindCSS.

**Spec:** Kebutuhan optimasi mesin pencari untuk keyword target "penerjemah bahasa isyarat", "isyarat kita", "bahasa isyrat" dengan domain `https://isyaratkita.web.id`.

## Global Constraints

- Domain produksi kanonikal: `https://isyaratkita.web.id`
- Target keyword wajib tercakup: "penerjemah bahasa isyarat", "isyarat kita", "bahasa isyrat", "bahasa isyarat indonesia", "SIBI"
- Menjaga estetika desain Tactile Editorial yang ada tanpa merusak layout atau performa
- Memastikan lolos build `npm run build` dan seluruh unit test `npm test` tanpa error

## Review Focus

1. `robots.txt` dapat diakses langsung di `/robots.txt` dan mengarah ke `https://isyaratkita.web.id/sitemap.xml`.
2. `sitemap.xml` valid secara sintaks XML, berprotokol HTTPS, dan memiliki format date W3C ISO 8601.
3. Schema.org JSON-LD valid dan dapat diparsing tanpa syntax error oleh validator Google Rich Results / Schema Validator.
4. Fallback crawler/noscript tidak mengganggu rendering React pada client dengan JavaScript aktif.
5. Section FAQ semantik responsif di mobile dan desktop serta ramah aksesibilitas keyboard/screen reader.

---

### Task 1: Setup Public Crawler Assets (`robots.txt` & `sitemap.xml`)

**Files:**
- Create: `public/robots.txt`
- Create: `public/sitemap.xml`
- Create: `public/site.webmanifest`

**Interfaces:**
- Consumes: Domain `https://isyaratkita.web.id`
- Produces: Static crawlable assets served at web root (`/robots.txt`, `/sitemap.xml`, `/site.webmanifest`)

- [ ] **Step 1: Buat direktori `public/` dan file `public/robots.txt`**
  Mengizinkan semua user-agent mengindeks seluruh halaman dan mendeklarasikan URL sitemap.
- [ ] **Step 2: Buat file `public/sitemap.xml`**
  Menyertakan entri URL kanonikal `https://isyaratkita.web.id/` dengan prioritas 1.0 dan frekuensi pembaruan.
- [ ] **Step 3: Buat file `public/site.webmanifest`**
  Menyediakan metadata aplikasi PWA/Web App untuk identitas mesin pencari dan browser seluler.
- [ ] **Step 4: Verifikasi build memuat aset `public/` ke direktori output `dist/`**

---

### Task 2: Metadata Komprehensif & Schema.org JSON-LD di `index.html`

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: Target keywords dan struktur data Schema.org
- Produces: Lengkapnya tag `<head>` (Title, Description, Keywords, Open Graph, Twitter Cards, Canonical, Schema.org WebApplication & FAQPage, crawler pre-render noscript fallback)

- [ ] **Step 1: Perbarui judul dan meta tags esensial di `index.html`**
  - Judul teroptimasi: `IsyaratKita — Penerjemah Bahasa Isyarat SIBI Online & Belajar Isyarat Kita`
  - Meta Description kaya kata kunci: `Platform penerjemah bahasa isyarat SIBI dua arah berbasis AI. Terjemahkan suara ke bahasa isyarat & gerakan tangan ke suara secara instan di IsyaratKita.`
  - Meta Keywords: `penerjemah bahasa isyarat, isyarat kita, bahasa isyrat, bahasa isyarat indonesia, penerjemah sibi, kamus bahasa isyarat, belajar bahasa isyarat online, penerjemah suara ke isyarat`
  - Canonical link ke `https://isyaratkita.web.id/`
  - Placeholder meta `google-site-verification` untuk verifikasi instan Google Search Console.
- [ ] **Step 2: Tambahkan Open Graph dan Twitter Card tags**
  Mendukung preview kartu saat link dibagikan di media sosial dan WhatsApp.
- [ ] **Step 3: Tambahkan Schema.org JSON-LD (`WebApplication` dan `FAQPage`)**
  Memberikan struktur data yang kaya untuk Google Rich Snippets dan Knowledge Graph.
- [ ] **Step 4: Tambahkan fallback semantik `<noscript>`**
  Memastikan crawler dasar yang tidak mengeksekusi JS tetap dapat membaca konten, tujuan aplikasi, dan kata kunci utama.

---

### Task 3: Komponen Edukasi & FAQ Semantik di Halaman Web (`src/components/FaqSection.tsx`)

**Files:**
- Create: `src/components/FaqSection.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: Target keywords terintegrasi dalam pertanyaan & jawaban umum
- Produces: Komponen UI FAQ interaktif dengan tag HTML semantik (`<section>`, `<h2>`, `<details>`, `<summary>`)

- [ ] **Step 1: Buat komponen `src/components/FaqSection.tsx`**
  Menyajikan 4-5 pertanyaan yang sering dicari pengguna di Google:
  - "Apa itu IsyaratKita dan bagaimana cara kerjanya?"
  - "Bagaimana cara menggunakan penerjemah bahasa isyarat suara ke visual SIBI?"
  - "Apakah IsyaratKita bisa membaca gerakan tangan menjadi ucapan (penerjemah bahasa isyrat)?"
  - "Apa perbedaan SIBI dan bahasa isyarat lainnya di Indonesia?"
- [ ] **Step 2: Integrasikan `FaqSection` ke dalam `src/App.tsx`**
  Ditempatkan secara harmonis di bawah grid modul belajar sebelum footer.
- [ ] **Step 3: Tambahkan tautan cepat ke FAQ di `Navbar.tsx` (opsional jika sesuai)**

---

### Task 4: Verifikasi Build, Pengujian Unit, dan Panduan Google Search Console

**Files:**
- Verify: `dist/index.html`, `dist/robots.txt`, `dist/sitemap.xml`
- Create / Update: Panduan langkah pendaftaran Google Search Console untuk pengguna

- [ ] **Step 1: Jalankan `npm test` dan verifikasi semua unit test berjalan hijau**
- [ ] **Step 2: Jalankan `npm run build` dan verifikasi build vite & server bundle berhasil**
- [ ] **Step 3: Uji inspeksi file hasil build `dist/` untuk memastikan metadata, robots, dan sitemap hadir**
- [ ] **Step 4: Dokumentasikan panduan praktis pendaftaran ke Google Search Console (GSC) dan Bing Webmaster Tools**
