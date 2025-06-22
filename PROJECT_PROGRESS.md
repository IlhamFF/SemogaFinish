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

## 2. Manajemen Pengguna oleh Admin (100%)
- [x] CRUD (Create, Read, Update, Delete) profil pengguna (Admin dapat membuat profil lokal, melihat, mengedit, dan menghapus).
- [x] Verifikasi status pengguna (khususnya siswa) oleh Admin.
- [x] Perubahan peran pengguna oleh Admin (dengan batasan peran).
- [/] Impor pengguna (UI ada, backend masih simulasi, fitur tidak diaktifkan).
- [x] Tampilan daftar pengguna dengan filter dan tabulasi berdasarkan peran.

## 3. Manajemen Profil oleh Pengguna (Settings) (100%)
- [x] Pengguna dapat melihat dan memperbarui informasi profil pribadi mereka.
- [x] Pengguna dapat mengubah kata sandi mereka sendiri.

## 4. Dasbor Pengguna (100%)
- [x] Dasbor Admin: Menampilkan statistik pengguna, mata pelajaran, dan pengguna baru secara dinamis.
- [x] Dasbor Guru: Menampilkan statistik terkait pengajaran, jadwal, dan tugas secara dinamis.
- [x] Dasbor Siswa: Menampilkan ringkasan kursus, tugas, dan jadwal secara dinamis.
- [x] Dasbor Pimpinan: Menampilkan statistik sekolah, rata-rata nilai, dan peringkat siswa secara dinamis.

## 5. Manajemen Kurikulum oleh Admin (100%)
- [x] CRUD untuk SKL (Standar Kompetensi Lulusan).
- [x] CRUD untuk CP (Capaian Pembelajaran).
- [x] CRUD untuk Kategori Materi Ajar.
- [x] CRUD untuk Materi Ajar (termasuk upload file simulasi dan tautan eksternal, `uploaderId` otomatis dari token).
- [x] CRUD untuk Struktur Kurikulum per tingkat dan jurusan.
- [x] CRUD untuk Silabus (termasuk upload file simulasi, `uploaderId` otomatis dari token).
- [x] CRUD untuk RPP (Rencana Pelaksanaan Pembelajaran, termasuk upload file simulasi, `uploaderId` otomatis dari token).

## 6. Manajemen Mata Pelajaran oleh Admin (100%)
- [x] CRUD Mata Pelajaran (kode, nama, kategori, deskripsi).
- [x] Tampilan daftar mata pelajaran dengan filter dan pencarian.

## 7. Manajemen Jadwal Pelajaran oleh Admin (100%)
- [x] CRUD Ruangan.
- [x] CRUD untuk Slot Waktu dan Konfigurasi Hari Efektif.
- [x] Pembuatan Jadwal Pelajaran manual per kelas/hari.
- [x] Deteksi konflik jadwal dasar (sisi server).
- [/] Impor jadwal (UI ada, backend masih simulasi, fitur tidak diaktifkan).

## 8. Fitur Modul Guru (100%)
- [x] Melihat jadwal mengajar yang dialokasikan.
- [x] Upload dan manajemen Materi Ajar (terhubung ke API backend).
- [x] Membuat dan manajemen Tugas (terhubung ke API backend).
- [x] Membuat dan manajemen Test/Ujian (terhubung ke API backend).
- [x] Halaman Absensi Siswa (Pencatatan harian dan rekapitulasi bulanan fungsional).
- [x] Halaman Penilaian & Rapor Siswa (UI input nilai semester fungsional, backend batch save fungsional).
- [x] Melihat pengumpulan tugas siswa dan memberikan nilai/feedback.
- [x] Melihat pengumpulan test/ujian siswa dan memberikan nilai/feedback.

## 9. Fitur Modul Siswa (100%)
- [x] Melihat jadwal pelajaran personal (harian & mingguan).
- [x] Melihat daftar tugas yang relevan.
- [x] Melihat dan mengakses materi pelajaran yang relevan.
- [x] Melihat daftar test/ujian yang relevan.
- [x] Pengumpulan tugas online (UI & API fungsional, simulasi penyimpanan file).
- [x] Pelaksanaan ujian online (Alur start/finish test fungsional, UI timer & placeholder soal).
- [x] Halaman Nilai & Rapor (Menampilkan nilai akhir per semester & grafik).

## 10. Struktur & Antarmuka Pengguna (UI) Aplikasi (100%)
- [x] Tata letak aplikasi responsif dengan Sidebar dan Header.
- [x] Navigasi dinamis berdasarkan peran pengguna.
- [x] Konsistensi penggunaan komponen UI dari ShadCN.
- [x] Sistem notifikasi (Toaster).
- [x] Implementasi toggle mode Terang/Gelap.

## 11. Backend API & Database (100%)
- [x] Entitas TypeORM untuk semua modul utama (termasuk Absensi & NilaiSemester).
- [x] API Routes untuk operasi CRUD pada semua modul utama.
- [x] Perlindungan API dengan token JWT dan pemeriksaan peran (RBAC).
- [x] Integrasi TypeORM dengan PostgreSQL.
- [x] Layanan email dasar dengan Nodemailer untuk verifikasi.

## 12. Logika Bisnis Inti Tambahan (95%)
- [x] Pengumpulan Tugas Online (Selesai).
- [x] Pelaksanaan Ujian Online (Selesai untuk alur dasar).
- [x] Proses Absensi Siswa yang Detail (Pencatatan harian & rekap bulanan fungsional).
- [x] Proses Penilaian Siswa yang Detail (Input nilai & kalkulasi fungsional).
- [x] Visualisasi data kehadiran di dasbor (Selesai).
- [ ] Generate rapor dalam format PDF/HTML.

## 13. Fitur Lanjutan & Penyempurnaan (5%)
- [ ] Notifikasi yang lebih interaktif & real-time (misalnya, via WebSockets).
- [ ] Implementasi penuh fitur impor data (parsing file CSV/Excel).
- [ ] Pengujian menyeluruh (Unit, Integrasi, End-to-End).
- [ ] Optimalisasi performa & database query.
- [ ] Implementasi fitur AI dengan Genkit.
- [ ] Dokumentasi pengguna dan teknis.

---
**Perkiraan Progres Keseluruhan Proyek (Non-AI): Sekitar 98%**
---
