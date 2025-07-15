
# EduCentral SMA Az-Bail

Selamat datang di EduCentral, Sistem Informasi Manajemen Pendidikan (SIMDIK) yang dirancang khusus untuk memenuhi kebutuhan SMA Az-Bail. Aplikasi ini menyediakan platform terpusat dan komprehensif untuk mengelola semua aspek kegiatan akademik dan administratif, menghubungkan admin, pimpinan, guru, dan siswa dalam satu ekosistem digital yang efisien.

![Dashboard Admin](https://placehold.co/800x400.png?text=Screenshot+Dashboard+Admin)

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Tumpukan Teknologi](#tumpukan-teknologi)
- [Struktur Proyek](#struktur-proyek)
- [Panduan Instalasi Lokal](#panduan-instalasi-lokal)
  - [Prasyarat](#prasyarat)
  - [Langkah-langkah Instalasi](#langkah-langkah-instalasi)
- [Akun Demo](#akun-demo)

## Fitur Utama

Aplikasi ini mencakup berbagai modul yang dirancang untuk setiap peran pengguna, memastikan alur kerja yang lancar dan terintegrasi.

- **Manajemen Autentikasi**:
  - Registrasi & Login berbasis JWT.
  - Verifikasi email dan alur reset kata sandi.
  - Proteksi rute berdasarkan peran (Admin, Guru, Siswa, Pimpinan).

- **Dasbor Dinamis**:
  - **Admin**: Statistik pengguna, mata pelajaran, dan pendaftaran baru.
  - **Guru**: Ringkasan jadwal mengajar, tugas, dan test.
  - **Siswa**: Agenda pelajaran, tugas, dan ujian mendatang.
  - **Pimpinan**: Visualisasi data kinerja sekolah, rata-rata nilai, dan peringkat siswa.

- **Manajemen Kurikulum (Admin)**:
  - CRUD penuh untuk SKL, Capaian Pembelajaran, Materi Ajar, Struktur Kurikulum, Silabus, dan RPP.

- **Manajemen Pengguna & Sekolah (Admin)**:
  - CRUD profil pengguna dan verifikasi siswa.
  - Pengelolaan mata pelajaran, ruangan, dan jadwal pelajaran dengan deteksi konflik.
  - Fitur impor data untuk pengguna dan jadwal.

- **Modul Guru**:
  - Melihat jadwal mengajar.
  - Upload materi, membuat tugas, dan bank soal.
  - Melakukan absensi harian dan rekapitulasi.
  - Input nilai semester dan mencetak rapor.

- **Modul Siswa**:
  - Melihat jadwal, tugas, dan materi pelajaran.
  - Mengumpulkan tugas secara online.
  - Mengerjakan ujian online.
  - Melihat transkrip nilai dan mencetak rapor.

- **Modul Pimpinan**:
  - Akses ke laporan analitik kinerja akademik dan kehadiran.
  - Visualisasi data sekolah dalam bentuk grafik dan tabel.
  - Fitur untuk mencetak laporan resmi.

## Tumpukan Teknologi

Proyek ini dibangun menggunakan tumpukan teknologi modern yang tangguh dan skalabel.

- **Framework**: [Next.js](https://nextjs.org/) (dengan App Router)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Komponen UI**: [ShadCN/UI](https://ui.shadcn.com/) & [Lucide Icons](https://lucide.dev/)
- **Manajemen State**: React Hooks & Context API
- **Form**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) (untuk validasi)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [TypeORM](https://typeorm.io/)
- **Autentikasi**: Implementasi kustom dengan JWT & Cookies
- **Layanan Email**: [Nodemailer](https://nodemailer.com/) (untuk verifikasi & reset password)
- **Visualisasi Data**: [Recharts](https://recharts.org/)

## Struktur Proyek

Struktur folder utama proyek diatur sebagai berikut untuk menjaga keterbacaan dan skalabilitas.

```
/
├── public/               # Aset statis (gambar, logo, file uploads)
├── src/
│   ├── app/              # Rute utama aplikasi (App Router)
│   │   ├── (authenticated)/ # Grup rute yang memerlukan login
│   │   │   ├── admin/       # Halaman khusus Admin
│   │   │   ├── guru/        # Halaman khusus Guru
│   │   │   ├── siswa/       # Halaman khusus Siswa
│   │   │   └── ...
│   │   ├── (auth)/          # Grup rute untuk autentikasi (login, register)
│   │   └── api/             # Backend API Routes
│   ├── components/       # Komponen React (UI, Layout, Form)
│   ├── entities/         # Definisi entitas TypeORM untuk database
│   ├── hooks/            # Custom React Hooks (e.g., useAuth)
│   ├── lib/              # Fungsi utilitas, konstanta, koneksi database
│   └── types/            # Definisi tipe TypeScript
├── .env.local.example    # Contoh file environment variable
└── ...                   # File konfigurasi lainnya (Next.js, Tailwind, dll.)
```

## Panduan Instalasi Lokal

### Prasyarat

Pastikan perangkat lunak berikut sudah terinstal di komputer Anda:
- **Node.js**: `v18.x` atau lebih baru
- **Git**: Untuk meng-clone repositori
- **PostgreSQL**: Database yang digunakan aplikasi

### Langkah-langkah Instalasi

1.  **Clone Repositori**
    ```bash
    git clone [URL_REPOSITORI_PROYEK]
    cd [NAMA_FOLDER_PROYEK]
    ```

2.  **Setup Database PostgreSQL**
    - Buka `psql` atau pgAdmin.
    - Buat database baru untuk aplikasi ini.
      ```sql
      CREATE DATABASE educentral;
      ```

3.  **Konfigurasi Environment Variable**
    - Buat file `.env.local` di root proyek.
    - Salin konten dari file `env.local.example` (jika ada) atau gunakan template di bawah ini.
    - Sesuaikan nilai variabel dengan konfigurasi lokal Anda.

    ```env
    # PostgreSQL Database Connection
    POSTGRES_HOST=localhost
    POSTGRES_PORT=5432
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=password_anda
    POSTGRES_DB=educentral

    # JWT Secret for Authentication
    JWT_SECRET=ganti-dengan-kunci-rahasia-yang-sangat-kuat-dan-aman

    # Application URL
    NEXT_PUBLIC_APP_URL=http://localhost:3000

    # SMTP Configuration for Email Service (contoh menggunakan Ethereal)
    SMTP_HOST=smtp.ethereal.email
    SMTP_PORT=587
    SMTP_USER=user@ethereal.email
    SMTP_PASS=password_ethereal
    EMAIL_FROM="EduCentral" <noreply@example.com>
    ```

4.  **Buat Folder Upload**
    Aplikasi ini menyimpan file unggahan secara lokal. Buat folder `uploads` di dalam direktori `public`.
    ```bash
    mkdir -p public/uploads
    ```
    Folder ini sudah ada di `.gitignore` untuk mencegah file unggahan masuk ke repositori.

5.  **Instalasi Dependensi**
    ```bash
    npm install
    ```
    Atau jika Anda menggunakan `pnpm`:
    ```bash
    pnpm install
    ```

6.  **Jalankan Aplikasi**
    Server pengembangan akan berjalan dengan fitur *hot-reloading*.
    ```bash
    npm run dev
    ```
    Buka browser Anda dan navigasi ke [http://localhost:3000](http://localhost:3000).

7.  **Isi Database dengan Data Dummy (Opsional)**
    Untuk memulai dengan data yang sudah ada (pengguna, jadwal, nilai, dll.), Anda bisa menjalankan proses *seeding* database.
    - Login sebagai **Super Admin** (`superadmin@azbail.sch.id`).
    - Navigasi ke **Dasbor Admin**.
    - Klik tombol **"Seed Database dengan Data Dummy"**.

## Akun Demo

Setelah menjalankan *seeding*, Anda dapat menggunakan akun-akun berikut untuk menguji setiap peran. Kata sandi untuk semua akun adalah `password`.

- **Super Admin**: `superadmin@azbail.sch.id`
- **Admin**: `admin@azbail.sch.id`
- **Pimpinan**: `pimpinan@azbail.sch.id`
- **Guru**: `guru1@azbail.sch.id`, `guru2@azbail.sch.id`, dst.
- **Siswa**: `siswa1@azbail.sch.id`, `siswa2@azbail.sch.id`, dst.
