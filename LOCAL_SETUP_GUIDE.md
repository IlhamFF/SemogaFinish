# Panduan Menjalankan Aplikasi EduCentral Secara Lokal

Dokumen ini menjelaskan langkah-langkah yang diperlukan untuk meng-clone, mengkonfigurasi, dan menjalankan aplikasi ini di lingkungan pengembangan lokal Anda.

## 1. Prasyarat

Sebelum memulai, pastikan Anda telah menginstal perangkat lunak berikut di komputer Anda:

- **Node.js**: Versi 18.x atau yang lebih baru. Anda bisa mengunduhnya dari [nodejs.org](https://nodejs.org/).
- **npm** atau **pnpm**: Manajer paket Node.js. Biasanya sudah terinstal bersama Node.js.
- **Git**: Sistem kontrol versi untuk meng-clone repositori. Unduh dari [git-scm.com](https://git-scm.com/).
- **PostgreSQL**: Sistem database yang digunakan oleh aplikasi ini. Unduh dari [postgresql.org](https://www.postgresql.org/download/). Pastikan layanan PostgreSQL berjalan setelah instalasi.

## 2. Proses Instalasi

Ikuti langkah-langkah berikut secara berurutan.

### Langkah 1: Clone Repositori

Buka terminal atau command prompt Anda, navigasi ke direktori tempat Anda ingin menyimpan proyek, lalu jalankan perintah berikut:

```bash
git clone [URL_REPOSITORI_ANDA]
cd [NAMA_DIREKTORI_PROYEK]
```
Ganti `[URL_REPOSITORI_ANDA]` dengan URL Git repositori ini dan `[NAMA_DIREKTORI_PROYEK]` dengan nama folder yang dihasilkan.

### Langkah 2: Setup Database PostgreSQL

1.  Buka antarmuka baris perintah PostgreSQL (`psql`) atau gunakan alat bantu grafis seperti pgAdmin.
2.  Buat pengguna (user/role) baru jika diperlukan (opsional, tapi direkomendasikan).
3.  Buat database baru untuk aplikasi ini. Beri nama, misalnya, `educentral`.

    ```sql
    CREATE DATABASE educentral;
    ```

Aplikasi ini menggunakan TypeORM dengan `synchronize: true` dalam mode pengembangan, sehingga skema tabel akan dibuat secara otomatis saat aplikasi pertama kali dijalankan.

### Langkah 3: Konfigurasi Environment Variables

1.  Di direktori utama proyek, buat file baru bernama `.env.local`.
2.  Salin konten berikut ke dalam file `.env.local` dan sesuaikan dengan konfigurasi Anda.

    ```env
    # PostgreSQL Database Connection
    POSTGRES_HOST=localhost
    POSTGRES_PORT=5432
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=password
    POSTGRES_DB=educentral

    # JWT Secret for Authentication
    # Ganti dengan string acak yang kuat dan rahasia
    JWT_SECRET=ganti-dengan-kunci-rahasia-anda-yang-panjang-dan-aman

    # Application URL
    # Pastikan ini adalah URL tempat aplikasi Anda akan berjalan
    NEXT_PUBLIC_APP_URL=http://localhost:3000

    # SMTP Configuration for Email Service (Nodemailer)
    # Gunakan layanan seperti Ethereal (untuk testing) atau kredensial SMTP asli
    SMTP_HOST=smtp.ethereal.email
    SMTP_PORT=587
    SMTP_USER=contoh.user@ethereal.email
    SMTP_PASS=passwordContohEthereal
    EMAIL_FROM="EduCentral" <noreply@example.com>
    ```

    **Penting:**
    - Ganti `POSTGRES_USER` dan `POSTGRES_PASSWORD` dengan kredensial PostgreSQL Anda.
    - Ganti `JWT_SECRET` dengan kunci acak yang sangat kuat.
    - Untuk `SMTP`, Anda bisa menggunakan akun [Ethereal Email](https://ethereal.email/) untuk mendapatkan kredensial SMTP gratis untuk keperluan testing.

### Langkah 4: Instalasi Dependensi

Buka terminal di direktori utama proyek dan jalankan perintah berikut untuk menginstal semua paket yang diperlukan:

```bash
npm install
```
Atau jika Anda menggunakan `pnpm`:
```bash
pnpm install
```

### Langkah 5: Jalankan Aplikasi

Setelah instalasi selesai, jalankan server pengembangan dengan perintah:

```bash
npm run dev
```

Anda akan melihat output di terminal yang menunjukkan bahwa server sedang berjalan, biasanya pada port 3000.

```
✓ Ready in 1.2s
- Local: http://localhost:3000
```

### Langkah 6: Buka Aplikasi di Browser

Buka browser web Anda dan navigasi ke [http://localhost:3000](http://localhost:3000). Anda seharusnya akan melihat halaman login aplikasi.

Selamat! Aplikasi EduCentral sekarang berjalan di komputer lokal Anda. Anda dapat mulai mendaftar sebagai pengguna baru atau menggunakan fungsionalitas yang ada.
