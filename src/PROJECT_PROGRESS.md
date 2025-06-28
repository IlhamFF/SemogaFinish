# Checklist Perkembangan Proyek EduCentral SMA Az-Bail

Ini adalah ringkasan progres pengembangan aplikasi.
- `[x]` : Selesai
- `[/]` : Sebagian Selesai / Dalam Pengerjaan / Dasar Sudah Ada
- `[ ]` : Belum Dimulai / Perlu Pengembangan Lanjut

## 1. Sistem Autentikasi Pengguna (100%)
- [x] Login dan Registrasi Pengguna dengan Token JWT.
- [x] Verifikasi Email (menggunakan Nodemailer untuk pengiriman email).
- [x] Reset Kata Sandi (fungsional dengan simulasi email).
- [x] Perubahan Kata Sandi oleh Pengguna.
- [x] Middleware untuk proteksi rute berdasarkan autentikasi dan peran.
- [x] Halaman-halaman terkait: Login, Register, Lupa Password, Reset Password, Verifikasi Email.

## 2. Manajemen Pengguna oleh Admin (95%)
- [x] CRUD (Create, Read, Update, Delete) profil pengguna (Admin dapat membuat profil lokal, melihat, mengedit, dan menghapus).
- [x] Verifikasi status pengguna (khususnya siswa) oleh Admin.
- [x] Perubahan peran pengguna oleh Admin (dengan batasan peran).
- [/] Impor pengguna (UI & API fungsional, **logika parsing file masih simulasi**).
- [x] Tampilan daftar pengguna dengan filter dan tabulasi berdasarkan peran.

## 3. Manajemen Profil oleh Pengguna (Settings) (100%)
- [x] Pengguna dapat melihat dan memperbarui informasi profil pribadi mereka.
- [x] Pengguna dapat mengubah kata sandi mereka sendiri.
- [x] Fungsionalitas unggah foto profil.

## 4. Dasbor Pengguna (100%)
- [x] Dasbor Admin: Menampilkan statistik pengguna, mata pelajaran, dan pengguna baru secara dinamis.
- [x] Dasbor Guru: Menampilkan statistik terkait pengajaran, jadwal, dan tugas secara dinamis.
- [x] Dasbor Siswa: Menampilkan ringkasan kursus, tugas, dan jadwal secara dinamis.
- [x] Dasbor Pimpinan: Menampilkan statistik sekolah, rata-rata nilai, dan peringkat siswa secara dinamis.

## 5. Manajemen Kurikulum oleh Admin (100%)
- [x] CRUD untuk SKL (Standar Kompetensi Lulusan).
- [x] CRUD untuk CP (Capaian Pembelajaran).
- [x] CRUD untuk Kategori Materi Ajar.
- [x] CRUD untuk Materi Ajar (termasuk upload file dan tautan eksternal).
- [x] CRUD untuk Struktur Kurikulum per tingkat dan jurusan.
- [x] CRUD untuk Silabus (termasuk upload file).
- [x] CRUD untuk RPP (Rencana Pelaksanaan Pembelajaran, termasuk upload file).

## 6. Manajemen Mata Pelajaran oleh Admin (100%)
- [x] CRUD Mata Pelajaran (kode, nama, kategori, deskripsi).
- [x] Tampilan daftar mata pelajaran dengan filter dan pencarian.

## 7. Manajemen Jadwal Pelajaran oleh Admin (95%)
- [x] CRUD Ruangan.
- [x] CRUD untuk Slot Waktu dan Konfigurasi Hari Efektif.
- [x] Pembuatan Jadwal Pelajaran manual per kelas/hari.
- [x] Deteksi konflik jadwal dasar (sisi server).
- [/] Impor jadwal (UI & API fungsional, **logika parsing file masih simulasi**).
- [ ] Tombol "Ketersediaan Guru" & "Deteksi Konflik" adalah placeholder.

## 8. Fitur Modul Guru (100%)
- [x] Melihat jadwal mengajar yang dialokasikan.
- [x] Upload dan manajemen Materi Ajar.
- [x] Membuat dan manajemen Tugas.
- [x] Membuat dan manajemen Bank Soal (Paket Soal, Pilihan Ganda & Esai).
- [x] Membuat dan manajemen Test/Ujian (terintegrasi dengan Bank Soal).
- [x] Halaman Absensi Siswa (Pencatatan harian dan rekapitulasi bulanan fungsional).
- [x] Halaman Penilaian & Rapor Siswa (UI input nilai semester fungsional, backend batch save fungsional).
- [x] Melihat pengumpulan tugas siswa dan memberikan nilai/feedback.
- [x] Melihat pengumpulan test/ujian siswa dan memberikan nilai/feedback.

## 9. Fitur Modul Siswa (100%)
- [x] Melihat jadwal pelajaran personal (harian & mingguan).
- [x] Melihat daftar tugas yang relevan.
- [x] Melihat dan mengakses materi pelajaran yang relevan.
- [x] Melihat daftar test/ujian yang relevan.
- [x] Pengumpulan tugas online (termasuk unggah file jawaban).
- [x] Pelaksanaan ujian online (Alur start/finish test dan bank soal terintegrasi penuh).
- [x] Halaman Nilai & Rapor (Menampilkan nilai akhir per semester & grafik).
- [x] Halaman Rapor (Cetak PDF fungsional via Print-to-PDF).

## 10. Struktur & Antarmuka Pengguna (UI) Aplikasi (100%)
- [x] Tata letak aplikasi responsif dengan Sidebar dan Header.
- [x] Navigasi dinamis berdasarkan peran pengguna.
- [x] Konsistensi penggunaan komponen UI dari ShadCN.
- [x] Sistem notifikasi (Toaster).
- [x] Implementasi toggle mode Terang/Gelap.

## 11. Backend API & Database (100%)
- [x] Entitas TypeORM untuk semua modul utama.
- [x] API Routes untuk operasi CRUD pada semua modul utama.
- [x] Perlindungan API dengan token JWT dan pemeriksaan peran (RBAC).
- [x] Integrasi TypeORM dengan PostgreSQL.
- [x] Layanan email dasar dengan Nodemailer untuk verifikasi.
- [x] API untuk unggah file.

## 12. Logika Bisnis Inti Tambahan (100%)
- [x] Pengumpulan Tugas Online.
- [x] Pelaksanaan Ujian Online.
- [x] Proses Absensi Siswa yang Detail.
- [x] Proses Penilaian Siswa yang Detail.
- [x] Visualisasi data kehadiran di dasbor.
- [x] Generate rapor siswa dalam format HTML untuk dicetak ke PDF.
- [x] Cetak Laporan (Dasbor Pimpinan, Rekap Absensi Guru) fungsional via Print-to-PDF.

## 13. Fitur yang Masih Berupa Simulasi atau Belum Selesai
- **Impor Pengguna**: Antarmuka dan API sudah ada, namun backend hanya memberikan respons berhasil tanpa mem-parsing file CSV/Excel.
- **Impor Jadwal**: Sama seperti Impor Pengguna, API hanya memberikan respons berhasil tanpa mem-parsing file.
- **Deteksi Konflik Jadwal**: Tombol "Deteksi Konflik" dan "Ketersediaan Guru" di halaman jadwal admin adalah placeholder dan belum memiliki fungsi.
- **Pengiriman Email**: Menggunakan Nodemailer dengan Ethereal untuk simulasi di lingkungan pengembangan. Perlu diubah ke layanan SMTP produksi (seperti SendGrid, Mailgun, dll).
---
**Perkiraan Progres Keseluruhan Proyek (Non-AI): Sekitar 99%**
---
