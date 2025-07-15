
# 🎓 EduCentral SMA Az-Bail

**Selamat datang di EduCentral**, Sistem Informasi Manajemen Pendidikan (SIMDIK) yang dirancang khusus untuk memenuhi kebutuhan **SMA Az-Bail**.  
Aplikasi ini menyatukan **admin, pimpinan, guru, dan siswa** dalam satu ekosistem digital yang efisien dan terintegrasi.

---

## 📑 Daftar Isi

- [🎯 Fitur Utama](#-fitur-utama)  
- [🚀 Tumpukan Teknologi](#-tumpukan-teknologi)  
- [📁 Struktur Proyek](#-struktur-proyek)  
- [🛠️ Panduan Instalasi Lokal](#️-panduan-instalasi-lokal)  
- [🧑‍💻 Akun Demo](#-akun-demo)  
- [📚 Dokumentasi Tambahan](#-dokumentasi-tambahan)  
- [🧩 Kontribusi](#-kontribusi)

---

## 🎯 Fitur Utama

### 🔐 Manajemen Autentikasi
- Registrasi & Login berbasis JWT  
- Verifikasi email & reset kata sandi  
- Proteksi rute berdasarkan peran (Admin, Guru, Siswa, Pimpinan)

### 📊 Dasbor Dinamis
- **Admin:** Statistik pengguna & pendaftaran
- **Guru:** Jadwal, tugas, dan test
- **Siswa:** Agenda belajar, tugas & ujian
- **Pimpinan:** Visualisasi data sekolah & performa siswa

### 🧠 Manajemen Kurikulum (Admin)
- CRUD: SKL, CP, Materi, Struktur Kurikulum, Silabus, RPP

### 👥 Manajemen Pengguna & Sekolah (Admin)
- CRUD profil pengguna
- Verifikasi siswa
- Manajemen pelajaran, ruangan, jadwal dengan deteksi konflik
- Impor data pengguna & jadwal

### 🧑‍🏫 Modul Guru
- Jadwal mengajar
- Upload materi, buat tugas & soal
- Absensi harian & rekap
- Input nilai & cetak rapor

### 🎓 Modul Siswa
- Lihat jadwal, tugas & materi
- Kumpulkan tugas & kerjakan ujian online
- Akses transkrip & cetak rapor

### 🏫 Modul Pimpinan
- Laporan performa akademik & kehadiran
- Visualisasi data sekolah (grafik & tabel)
- Cetak laporan resmi

---

## 🚀 Tumpukan Teknologi

| Teknologi | Deskripsi |
|----------|-----------|
| **Next.js** | Framework React modern dengan App Router |
| **TypeScript** | Superset JavaScript yang aman |
| **Tailwind CSS** | Styling utility-first |
| **ShadCN/UI + Lucide** | Komponen UI modern & ikon |
| **React Hook Form + Zod** | Form handling & validasi |
| **PostgreSQL + TypeORM** | Database relasional & ORM |
| **JWT & Cookies** | Autentikasi kustom |
| **Nodemailer** | Layanan email verifikasi |
| **Recharts** | Visualisasi data |
| **npm / pnpm** | Manajer dependensi |

---

## 📁 Struktur Proyek

```
/
├── public/              # Aset statis
├── src/
│   ├── app/             # Rute utama (Next.js App Router)
│   │   ├── (authenticated)/ # Halaman per peran
│   │   │   ├── admin/
│   │   │   ├── guru/
│   │   │   ├── siswa/
│   │   ├── (auth)/        # Login, register, dll
│   │   └── api/           # API routes (serverless)
│   ├── components/        # Komponen UI
│   ├── entities/          # Model database (TypeORM)
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilitas & konfigurasi
│   └── types/             # Definisi tipe global
├── .env.local            # Variabel lingkungan pribadi
├── .env.local.example    # Template env
├── next.config.ts        # Konfigurasi Next.js
├── tailwind.config.ts    # Konfigurasi Tailwind
├── package.json          # Skrip & dependensi
├── tsconfig.json         # Konfigurasi TypeScript
└── apphosting.yaml       # Konfigurasi deployment
```

---

## 🛠️ Panduan Instalasi Lokal

### 📋 Prasyarat

Pastikan perangkat Anda telah terinstal:
- Node.js (v18.x atau lebih)
- Git
- PostgreSQL

### 🔧 Langkah Instalasi

1. **Clone repositori**
   ```bash
   git clone [URL_REPOSITORI_PROYEK]
   cd [NAMA_FOLDER_PROYEK]
   ```

2. **Buat database PostgreSQL**
   ```sql
   CREATE DATABASE educentral;
   ```

3. **Salin dan edit `.env.local`**
   ```env
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_password
   POSTGRES_DB=educentral

   JWT_SECRET=secret-yang-kuat

   NEXT_PUBLIC_APP_URL=http://localhost:3000

   SMTP_HOST=smtp.ethereal.email
   SMTP_PORT=587
   SMTP_USER=user@ethereal.email
   SMTP_PASS=password_ethereal
   EMAIL_FROM="EduCentral" <noreply@example.com>
   ```

4. **Buat folder upload**
   ```bash
   mkdir -p public/uploads
   ```

5. **Instal dependensi**
   ```bash
   npm install
   # atau
   pnpm install
   ```

6. **Jalankan aplikasi**
   ```bash
   npm run dev
   ```

7. **Akses di browser**
   > http://localhost:3000

8. **(Opsional) Seed data dummy**
   - Login sebagai Super Admin
   - Masuk ke Dasbor Admin
   - Klik **"Seed Database dengan Data Dummy"**

---

## 🧑‍💻 Akun Demo

| Peran      | Email |
|------------|-------------------------------|
| Super Admin | `superadmin@azbail.sch.id` |
| Admin       | `admin@azbail.sch.id`       |
| Pimpinan    | `pimpinan@azbail.sch.id`    |
| Guru        | `guru1@azbail.sch.id`, `guru2@...` |
| Siswa       | `siswa1@azbail.sch.id`, `siswa2@...` |

> **Password semua akun:** `password`

---

## 📚 Dokumentasi Tambahan

- `LOCAL_SETUP_GUIDE.md` – Panduan instalasi lokal lanjutan  
- `STORAGE_SETUP.md` – Panduan pengelolaan file  
- `PROJECT_PROGRESS.md` – Catatan perkembangan proyek

---

## 🧩 Kontribusi

Kami sangat terbuka untuk kontribusi!  
Berikut langkah-langkahnya:

1. Fork repositori ini
2. Buat branch baru
   ```bash
   git checkout -b fitur-keren-baru
   ```
3. Lakukan perubahan & commit
   ```bash
   git commit -m "feat: Menambahkan fitur keren baru"
   ```
4. Push ke GitHub
   ```bash
   git push origin fitur-keren-baru
   ```
5. Buka Pull Request 🎉

---

> **EduCentral – Meningkatkan manajemen pendidikan dengan teknologi.**
