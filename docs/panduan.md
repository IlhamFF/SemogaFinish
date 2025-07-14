# Panduan Penggunaan Aplikasi EduCentral

Selamat datang di EduCentral! Dokumen ini adalah panduan lengkap untuk menggunakan berbagai fitur yang tersedia di aplikasi, disesuaikan untuk setiap peran pengguna: **Admin**, **Guru**, **Siswa**, dan **Pimpinan**.

---

## Daftar Isi
1.  [**Panduan untuk Admin**](#i-panduan-untuk-admin)
    -   [Dasbor & Tugas Utama](#1-dasbor--tugas-utama-admin)
    -   [Manajemen Pengguna](#2-manajemen-pengguna)
    -   [Manajemen Kurikulum & Mapel](#3-manajemen-kurikulum--mata-pelajaran)
    -   [Manajemen Jadwal Pelajaran](#4-manajemen-jadwal-pelajaran)
2.  [**Panduan untuk Guru**](#ii-panduan-untuk-guru)
    -   [Dasbor & Ringkasan Harian](#1-dasbor-guru)
    -   [Manajemen Materi & Tugas](#2-manajemen-materi--tugas)
    -   [Bank Soal & Manajemen Test](#3-bank-soal--manajemen-test)
    -   [Absensi & Penilaian](#4-absensi--penilaian)
3.  [**Panduan untuk Siswa**](#iii-panduan-untuk-siswa)
    -   [Pendaftaran & Dasbor](#1-pendaftaran--dasbor-siswa)
    -   [Mengakses Jadwal & Materi](#2-mengakses-jadwal--materi)
    -   [Mengerjakan Tugas & Test](#3-mengerjakan-tugas--test)
    -   [Melihat Nilai & Rapor](#4-melihat-nilai--rapor)
4.  [**Panduan untuk Pimpinan**](#iv-panduan-untuk-pimpinan)
    -   [Dasbor Kinerja Akademik](#1-dasbor-kinerja-akademik)
    -   [Laporan Rincian](#2-laporan-rincian-nilai--kehadiran)
5.  [**Pengaturan Akun (Semua Pengguna)**](#v-pengaturan-akun-semua-pengguna)

---

## I. Panduan untuk Admin

Sebagai Admin, Anda memiliki kontrol penuh atas konfigurasi sistem, data master, dan manajemen pengguna. Peran Anda sangat penting untuk kelancaran operasional aplikasi.

### 1. Dasbor & Tugas Utama Admin
Dasbor Admin adalah pusat kendali Anda. Di sini Anda dapat melihat:
- **Statistik Utama**: Jumlah total pengguna, guru, mata pelajaran, dan siswa yang menunggu verifikasi.
- **Distribusi Peran**: Diagram lingkaran yang menunjukkan komposisi pengguna berdasarkan perannya.
- **Pengguna Baru**: Daftar pengguna yang baru saja mendaftar.
- **Fitur Developer**: Tombol **Seed Database** (hanya muncul di mode pengembangan) untuk mengisi database dengan data dummy yang komprehensif. **Gunakan dengan hati-hati karena akan menghapus data yang ada.**

### 2. Manajemen Pengguna
Menu ini (`/admin/users`) adalah tempat Anda mengelola semua akun di sistem.
- **Membuat Pengguna**: Klik tombol "Buat Pengguna Baru". Anda bisa membuat akun untuk **Guru**, **Siswa**, **Admin**, atau **Pimpinan**. Isi semua detail yang relevan, seperti NIP untuk guru atau NIS dan kelas untuk siswa.
- **Mengedit Pengguna**: Gunakan menu titik tiga di setiap baris pengguna untuk mengedit informasi profil mereka.
- **Memverifikasi Siswa**: Siswa yang baru mendaftar akan berstatus "Belum Terverifikasi". Anda harus memverifikasi mereka secara manual melalui menu tindakan agar mereka dapat mengakses fitur siswa.
- **Mengubah Peran**: Anda dapat mengubah peran pengguna (misalnya, dari Siswa menjadi Pimpinan) melalui menu tindakan.
- **Menghapus Pengguna**: Hapus pengguna yang sudah tidak aktif.
- **Filter & Pencarian**: Gunakan tab dan kolom pencarian untuk menemukan pengguna dengan cepat berdasarkan peran atau nama/email.

### 3. Manajemen Kurikulum & Mata Pelajaran
Sebelum sistem dapat digunakan sepenuhnya, Anda harus mengatur fondasi kurikulum.
- **Manajemen Mata Pelajaran (`/admin/mata-pelajaran`)**:
  - Tambahkan semua mata pelajaran yang ada di sekolah, lengkap dengan kode unik, nama, dan kategorinya (misalnya, Wajib Umum, Peminatan IPA).
  - Ini adalah data master yang akan digunakan di seluruh aplikasi (jadwal, RPP, nilai, dll.).
- **Manajemen Kurikulum (`/admin/kurikulum`)**:
  - **SKL & CP**: Definisikan Standar Kompetensi Lulusan dan Capaian Pembelajaran sebagai acuan kurikulum.
  - **Struktur Kurikulum**: **Ini sangat penting.** Tentukan mata pelajaran apa saja yang diajarkan di setiap tingkat dan jurusan, beserta alokasi jam pelajarannya.
  - **Silabus & RPP**: Kelola dokumen silabus dan RPP. Guru juga dapat mengunggah RPP mereka sendiri.
  - **Bank Materi**: Tambah atau lihat semua materi ajar yang diunggah oleh guru.

### 4. Manajemen Jadwal Pelajaran
Menu ini (`/admin/jadwal`) adalah tempat Anda mengatur seluruh jadwal pelajaran sekolah.
1.  **Konfigurasi Jam & Hari**: Tentukan slot waktu (misal, Jam ke-1: 07:00-07:45) dan hari-hari efektif sekolah. Ini adalah langkah pertama yang wajib dilakukan.
2.  **Manajemen Ruangan**: Daftarkan semua ruangan yang tersedia untuk kegiatan belajar mengajar.
3.  **Buat Jadwal per Kelas**: Fitur untuk menyusun jadwal secara manual untuk satu kelas pada hari tertentu.
4.  **Impor Jadwal**: Cara paling efisien. Unduh template CSV, isi sesuai format, lalu unggah untuk membuat seluruh jadwal sekolah secara massal.
5.  **Deteksi Konflik**: Setelah jadwal dibuat, gunakan tombol ini untuk memeriksa apakah ada jadwal yang bentrok (guru atau ruangan yang sama pada waktu yang sama).

---

## II. Panduan untuk Guru
Sebagai Guru, Anda adalah pengguna utama untuk kegiatan belajar mengajar sehari-hari.

### 1. Dasbor Guru
Dasbor Anda memberikan ringkasan cepat tentang:
- **Statistik Pengajaran**: Jumlah mata pelajaran dan kelas yang Anda ampu.
- **Jadwal Hari Ini**: Daftar pelajaran yang harus Anda ajar hari ini.
- **Tugas Mendatang**: Tugas-tugas yang akan segera mencapai tenggat waktu.

### 2. Manajemen Materi & Tugas
- **Upload Materi (`/guru/materi`)**: Unggah materi pembelajaran seperti modul (PDF, DOCX) atau tautan ke video/situs eksternal. Materi ini akan tersedia bagi siswa di kelas yang relevan.
- **Manajemen Tugas (`/guru/tugas`)**:
  - Buat tugas baru dengan judul, deskripsi, mata pelajaran, kelas tujuan, dan tenggat waktu.
  - Anda bisa melampirkan file soal jika diperlukan.
  - Pantau pengumpulan tugas dari siswa melalui tombol "Periksa & Nilai".

### 3. Bank Soal & Manajemen Test
- **Bank Soal (`/guru/bank-soal`)**:
  - Buat "Paket Soal" yang berisi kumpulan pertanyaan (Pilihan Ganda atau Esai). Ini adalah gudang soal Anda.
- **Manajemen Test (`/guru/test`)**:
  - Buat test/ujian baru (Kuis, UTS, UAS).
  - Atur jadwal pelaksanaan, durasi, dan statusnya.
  - **Penting**: Setelah test dibuat, klik tombol "Soal" untuk melampirkan soal dari Bank Soal yang telah Anda buat. Test tidak bisa dikerjakan siswa jika belum ada soalnya.

### 4. Absensi & Penilaian
- **Absensi Siswa (`/guru/absensi`)**:
  - Pilih kelas dan tanggal untuk mencatat kehadiran siswa pada sesi pelajaran Anda.
  - Anda juga bisa melihat dan mengekspor rekap absensi bulanan per kelas.
- **Penilaian Siswa (`/guru/penilaian`)**:
  - Ini adalah halaman untuk menginput nilai akhir semester siswa.
  - Pilih kelas, mata pelajaran, semester, dan tahun ajaran.
  - Masukkan nilai komponen (Tugas, UTS, UAS, Harian), dan nilai akhir serta predikat akan terhitung secara otomatis.
  - Simpan semua nilai untuk satu kelas sekaligus dengan tombol "Simpan Semua Nilai".

---

## III. Panduan untuk Siswa
Sebagai Siswa, Anda akan menggunakan aplikasi ini untuk mendukung proses belajar Anda.

### 1. Pendaftaran & Dasbor Siswa
- **Pendaftaran**: Buat akun baru melalui halaman "Register". Isi nama lengkap, email, NIS, dan pilih kelas Anda.
- **Verifikasi Email**: Setelah mendaftar, Anda akan diarahkan ke halaman verifikasi. **Anda harus memverifikasi email Anda** sebelum dapat mengakses fitur-fitur siswa.
- **Dasbor**: Halaman utama Anda yang menampilkan ringkasan jadwal hari ini, tugas yang belum dikerjakan, dan test yang akan datang.

### 2. Mengakses Jadwal & Materi
- **Jadwal Pelajaran (`/siswa/jadwal`)**: Lihat jadwal harian dan mingguan Anda, lengkap dengan nama guru dan ruangan.
- **Materi Pelajaran (`/siswa/materi`)**: Temukan semua materi (file atau link) yang telah diunggah oleh guru untuk mata pelajaran Anda. Anda bisa mengunduh atau membuka tautan materi tersebut.

### 3. Mengerjakan Tugas & Test
- **Tugas Saya (`/siswa/tugas`)**:
  - Lihat daftar tugas yang aktif dan yang sudah selesai.
  - Klik "Kumpulkan Jawaban" untuk mengunggah file jawaban Anda atau mengetik jawaban langsung.
  - Setelah dinilai, Anda dapat melihat nilai dan feedback dari guru di sini.
- **Test & Ujian (`/siswa/test`)**:
  - Lihat daftar test yang dijadwalkan.
  - Tombol "Mulai Test" akan aktif jika sudah waktunya.
  - Kerjakan test dalam batas waktu yang ditentukan. Jawaban akan otomatis tersimpan saat Anda berpindah soal. Pastikan untuk menekan "Selesaikan Test" sebelum waktu habis.

### 4. Melihat Nilai & Rapor
- **Nilai & Rapor (`/siswa/nilai`)**:
  - Halaman ini menampilkan rekapitulasi semua nilai akhir semester Anda.
  - Lihat grafik perbandingan nilai antar mata pelajaran.
  - Klik tombol "Lihat Detail" pada setiap nilai untuk melihat rincian komponennya.
  - Unduh rapor semester Anda dalam format PDF melalui tombol yang tersedia.

---

## IV. Panduan untuk Pimpinan
Sebagai Pimpinan, Anda memiliki akses ke dasbor analitik untuk memantau kinerja sekolah secara keseluruhan.

### 1. Dasbor Kinerja Akademik
Dasbor utama Anda (`/pimpinan/dashboard`) menampilkan metrik-metrik kunci dalam bentuk visual:
- **Statistik Umum**: Total siswa, rasio guru-siswa, rata-rata kehadiran, dll.
- **Grafik Tren Kehadiran**: Visualisasi persentase kehadiran siswa selama beberapa bulan terakhir.
- **Perbandingan Nilai**: Diagram batang yang membandingkan rata-rata nilai akhir antar kelas.
- **Peringkat Siswa**: Tabel yang menampilkan siswa dengan prestasi akademik tertinggi.
- **Distribusi Sumber Daya**: Informasi mengenai sebaran guru per mapel dan siswa per jurusan.

### 2. Laporan Rincian Nilai & Kehadiran
Untuk analisis yang lebih mendalam, Anda dapat mengakses menu laporan:
- **Analisis Nilai Siswa (`/pimpinan/laporan/kelas`)**:
  - Filter data berdasarkan angkatan (Tingkat) dan kelas spesifik.
  - Lihat tabel perbandingan nilai semua siswa di kelas tersebut untuk setiap mata pelajaran.
  - Halaman ini sangat berguna untuk melihat peringkat paralel dan kinerja akademik per kelas/jurusan.
- **Analisis Kehadiran (`/pimpinan/laporan/kehadiran`)**:
  - Filter data berdasarkan tahun ajaran, semester, angkatan, dan kelas.
  - Lihat tren kehadiran bulanan dan tabel rincian jumlah hadir, izin, sakit, dan alpha untuk setiap siswa.

Semua laporan dapat diekspor ke format CSV atau dicetak ke PDF.

---

## V. Pengaturan Akun (Semua Pengguna)
Semua pengguna dapat mengakses menu **Pengaturan** (`/settings`) melalui menu dropdown di pojok kanan atas. Di sini Anda dapat:
- **Memperbarui Profil**: Mengubah nama lengkap, nomor telepon, alamat, bio, dan foto profil.
- **Mengubah Kata Sandi**: Memperbarui kata sandi Anda demi keamanan.