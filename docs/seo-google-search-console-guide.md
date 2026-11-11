# 🚀 Panduan Pendaftaran Google Search Console & Optimasi Mesin Pencari (SEO) IsyaratKita

Dokumen ini berisi panduan praktis langkah demi langkah untuk mendaftarkan website **IsyaratKita** (`https://isyaratkita.web.id`) ke mesin pencari Google dan Bing agar cepat terindeks dan muncul di halaman pertama untuk kata kunci:
- **"penerjemah bahasa isyarat"**
- **"isyarat kita"**
- **"bahasa isyrat"** (dan variasi penulisan terkait)
- **"bahasa isyarat indonesia / SIBI"**

---

## 1. Persiapan Aset SEO yang Telah Diimplementasikan

Website IsyaratKita kini telah dilengkapi dengan infrastruktur teknis SEO lengkap:
- ✅ **Aset Perayap (`public/robots.txt` & `public/sitemap.xml`):** Memberitahukan Googlebot bahwa seluruh halaman aman untuk diindeks dan menunjuk ke peta situs resmi.
- ✅ **Metadata Lengkap di `<head>`:** Title, Description, Keywords, Canonical Link, Open Graph (Facebook/WhatsApp preview), dan Twitter Card.
- ✅ **Gambar Pratinjau Media Sosial (`public/og-image.png`):** Tampilan kartu pratinjau resolusi tinggi 1200x630 saat link dibagikan di WhatsApp, LinkedIn, X, atau Facebook.
- ✅ **Schema.org Structured Data (JSON-LD):** Format data terstruktur Google untuk `WebApplication` dan `FAQPage` guna memicu *Rich Snippets* (kotak tanya-jawab langsung di hasil pencarian).
- ✅ **Section Edukasi & FAQ Semantik di Halaman Web:** Blok konten `<section>` dan `<details>` interaktif yang memperkuat densitas kata kunci organik di mata crawler.
- ✅ **Fallback Crawler Semantik (`<noscript>`):** Memastikan bot pencari yang tidak mengeksekusi JavaScript langsung memahami isi dan fungsi aplikasi.

---

## 2. Langkah Mendaftarkan ke Google Search Console (GSC)

Google Search Console adalah alat resmi gratis dari Google untuk mengelola pengindeksan website Anda.

### Langkah 2.1: Masuk ke Google Search Console
1. Buka [Google Search Console](https://search.google.com/search-console).
2. Login menggunakan akun Google Anda.

### Langkah 2.2: Tambahkan Properti Website
1. Pada menu pemilihan properti (kiri atas), klik **+ Add Property** (Tambahkan Properti).
2. Pilih jenis **URL Prefix** (Awalan URL).
3. Masukkan URL resmi:
   ```text
   https://isyaratkita.web.id
   ```
4. Klik **Continue** (Lanjutkan).

### Langkah 2.3: Verifikasi Kepemilikan (Pilih salah satu metode termudah)

#### Opsi A: Menggunakan Tag HTML (Paling Cepat & Langsung Siap)
1. Pada jendela verifikasi GSC, pilih metode **HTML Tag**.
2. Salin kode verifikasi yang diberikan oleh Google. Formatnya seperti ini:
   ```html
   <meta name="google-site-verification" content="KODE_UNIK_DARI_GOOGLE" />
   ```
3. Buka file [index.html](file:///home/JennyJefferson/desktop/IsyaratKita/index.html) di proyek IsyaratKita.
4. Ganti teks `GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE_PLACEHOLDER` dengan kode unik Anda:
   ```html
   <meta name="google-site-verification" content="KODE_UNIK_DARI_GOOGLE" />
   ```
5. Deploy pembaruan website Anda ke hosting (Vercel / server Anda).
6. Kembali ke Google Search Console dan klik tombol **Verify** (Verifikasi).

#### Opsi B: Menggunakan Rekaman DNS (TXT Record)
Jika domain dikelola di penyedia domain (seperti Cloudflare, Niagahoster, DomaiNesia):
1. Pilih metode **Domain** saat menambah properti di GSC.
2. Tambahkan rekaman `TXT` yang diberikan Google ke pengaturan DNS domain Anda.

---

## 3. Mengirimkan Peta Situs (Sitemap.xml)

Setelah properti terverifikasi di Google Search Console:
1. Di panel menu kiri GSC, klik **Sitemaps** (Peta Situs).
2. Di kolom *"Add a new sitemap"* (Tambahkan peta situs baru), ketik:
   ```text
   sitemap.xml
   ```
   (Sehingga URL lengkap menjadi `https://isyaratkita.web.id/sitemap.xml`).
3. Klik tombol **Submit** (Kirim).
4. Status akan berubah menjadi **Success** (Berhasil) dalam beberapa menit hingga beberapa jam saat Google selesai merayapi.

---

## 4. Meminta Pengindeksan Instan (Request Indexing)

Agar Google tidak perlu menunggu perayapan berkala mingguan:
1. Di bilah pencarian paling atas Google Search Console ("Inspect any URL in https://isyaratkita.web.id..."), masukkan:
   ```text
   https://isyaratkita.web.id/
   ```
2. Tekan **Enter** untuk memeriksa URL.
3. Setelah hasil inspeksi muncul, klik tombol **Request Indexing** (Minta Pengindeksan).
4. Google akan memprioritaskan halaman utama IsyaratKita ke dalam antrean perayapan cepat (biasanya 1–48 jam).

---

## 5. Pendaftaran Tambahan ke Bing Webmaster Tools (Opsional tapi Sangat Disarankan)

Mesin pencari Microsoft Bing dan browser Edge menggunakan indeks Bing.
1. Kunjungi [Bing Webmaster Tools](https://www.bing.com/webmasters).
2. Login dan pilih opsi **Import from Google Search Console**.
3. Seluruh verifikasi domain dan sitemap akan otomatis tersinkronisasi tanpa konfigurasi ulang!

---

## 6. Tips Mempertahankan Peringkat Tinggi untuk Keyword Target

1. **Backlink Berkualitas:** Cantumkan tautan `https://isyaratkita.web.id` pada profil GitHub pengembang, LinkedIn, bio media sosial, serta artikel blog atau rilis portofolio.
2. **Keterbacaan & Kecepatan:** IsyaratKita telah dioptimalkan dengan performa build Vite dan aset statis yang ringan sehingga mendapat skor tinggi di Google PageSpeed Insights.
3. **Penyebutan Kontekstual Kata Kunci:** Section FAQ di halaman utama telah dirancang untuk mencakup istilah formal ("penerjemah bahasa isyarat", "sibi") maupun variasi pencarian umum ("isyarat kita", "bahasa isyrat"), membantu Google memahami relevansi semantik halaman secara menyeluruh.
