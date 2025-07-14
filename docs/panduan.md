# Panduan Penggunaan Aplikasi EduCentral

Selamat datang di EduCentral! Dokumen ini adalah panduan lengkap untuk menggunakan berbagai fitur yang tersedia di aplikasi, disesuaikan untuk setiap peran pengguna: **Admin**, **Guru**, **Siswa**, dan **Pimpinan**. Panduan ini dirancang untuk dilengkapi dengan screenshot untuk memperjelas setiap langkah.

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
- **Statistik Utama**: Empat kartu di bagian atas menampilkan jumlah total pengguna, guru, mata pelajaran, dan siswa yang menunggu verifikasi.
- **Distribusi Peran**: Diagram lingkaran yang menunjukkan komposisi pengguna berdasarkan perannya (Admin, Guru, Siswa, dll.).
- **Pengguna Baru**: Tabel di sebelah kanan diagram menampilkan 5 pengguna terakhir yang baru saja mendaftar ke sistem.
- **Fitur Developer**: Di bagian bawah (hanya muncul di mode pengembangan), terdapat tombol **Seed Database**. Tombol ini sangat berguna untuk mengisi database dengan data dummy yang komprehensif untuk keperluan testing. **Gunakan dengan hati-hati karena akan menghapus semua data yang ada (kecuali superadmin).**

### 2. Manajemen Pengguna
Menu ini (`/admin/users`) adalah tempat Anda mengelola semua akun di sistem.
- **Membuat Pengguna**: Klik tombol "Buat Pengguna Baru" di pojok kanan atas. Sebuah form akan muncul. Anda bisa membuat akun untuk **Guru**, **Siswa**, **Admin**, atau **Pimpinan**. Isi semua detail yang relevan, seperti NIP untuk guru atau NIS dan kelas untuk siswa.
- **Mengedit Pengguna**: Di setiap baris pengguna pada tabel, klik ikon titik tiga (`...`) untuk membuka menu tindakan. Pilih "Edit Pengguna" untuk mengubah informasi profil mereka.
- **Memverifikasi Siswa**: Siswa yang baru mendaftar akan berstatus "Belum Terverifikasi" (ditandai dengan badge merah). Klik menu tindakan (`...`) di baris siswa tersebut dan pilih "Verifikasi Siswa" agar mereka dapat mengakses fitur-fitur siswa.
- **Mengubah Peran**: Anda dapat mengubah peran pengguna (misalnya, dari Siswa menjadi Pimpinan) melalui menu tindakan (`...`). Pilih peran baru dari daftar yang tersedia dan konfirmasi.
- **Menghapus Pengguna**: Hapus pengguna yang sudah tidak aktif melalui menu tindakan (`...`) dan pilih "Hapus Pengguna".
- **Filter & Pencarian**: Gunakan tab di atas tabel (Semua, Admin, Guru, dll.) dan kolom pencarian untuk menemukan pengguna dengan cepat berdasarkan peran atau nama/email.

### 3. Manajemen Kurikulum & Mata Pelajaran
Sebelum sistem dapat digunakan sepenuhnya, Anda harus mengatur fondasi kurikulum.
- **Manajemen Mata Pelajaran (`/admin/mata-pelajaran`)**:
  - Ini adalah langkah pertama yang penting. Klik "Tambah Mata Pelajaran" untuk menambahkan semua mata pelajaran yang ada di sekolah, lengkap dengan kode unik, nama, dan kategorinya (misalnya, Wajib Umum, Peminatan IPA).
  - Data master ini akan digunakan di seluruh aplikasi (jadwal, RPP, nilai, dll.).
- **Manajemen Kurikulum (`/admin/kurikulum`)**:
  - **SKL & CP**: Definisikan Standar Kompetensi Lulusan dan Capaian Pembelajaran sebagai acuan kurikulum. Klik tombol yang sesuai untuk menambah atau mengelola data ini.
  - **Struktur Kurikulum**: **Ini sangat penting.** Klik tombol "Struktur Kurikulum". Pilih Tingkat dan Jurusan, lalu klik "Tambah Mapel" untuk menentukan mata pelajaran apa saja yang diajarkan di kombinasi tersebut, beserta alokasi jam pelajarannya.
  - **Silabus & RPP**: Kelola dokumen silabus dan RPP. Anda dapat mengunggah dokumen baru, dan guru juga dapat mengunggah RPP mereka sendiri dari akun mereka.
  - **Bank Materi**: Halaman ini berfungsi sebagai gudang pusat untuk semua materi ajar yang diunggah oleh para guru. Anda bisa menambah, mencari, atau mengelola materi dari sini.

### 4. Manajemen Jadwal Pelajaran
Menu ini (`/admin/jadwal`) adalah tempat Anda mengatur seluruh jadwal pelajaran sekolah.
1.  **Konfigurasi Jam & Hari**: Klik tombol "Konfigurasi Jam & Hari". Tentukan slot waktu (misal, Jam ke-1: 07:00-07:45) dan tandai hari-hari efektif sekolah (Senin-Jumat). Ini adalah langkah pertama yang wajib dilakukan.
2.  **Manajemen Ruangan**: Klik tombol "Manajemen Ruangan". Daftarkan semua ruangan yang tersedia untuk kegiatan belajar mengajar, lengkap dengan kode dan kapasitasnya.
3.  **Buat Jadwal per Kelas**: Klik "Buat Jadwal per Kelas". Pilih kelas dan hari, lalu klik "Tambah Pelajaran" untuk menyusun jadwal secara manual untuk satu kelas pada hari tertentu.
4.  **Impor Jadwal**: Ini adalah cara paling efisien. Klik "Impor Jadwal", unduh template CSV, isi sesuai format yang ditentukan, lalu unggah file tersebut untuk membuat seluruh jadwal sekolah secara massal.
5.  **Deteksi Konflik**: Setelah jadwal dibuat, klik tombol "Deteksi Konflik". Sistem akan memeriksa apakah ada jadwal yang bentrok (guru atau ruangan yang sama pada waktu yang sama) dan menampilkan hasilnya.

---

## II. Panduan untuk Guru
Sebagai Guru, Anda adalah pengguna utama untuk kegiatan belajar mengajar sehari-hari.

### 1. Dasbor Guru
Dasbor Anda memberikan ringkasan cepat tentang:
- **Statistik Pengajaran**: Kartu di bagian atas menampilkan jumlah mata pelajaran dan kelas yang Anda ampu.
- **Jadwal Hari Ini**: Kolom di sebelah kiri menampilkan daftar pelajaran yang harus Anda ajar hari ini, diurutkan berdasarkan waktu.
- **Tugas Mendatang**: Kolom di sebelah kanan menampilkan tugas-tugas yang telah Anda buat dan akan segera mencapai tenggat waktu.

### 2. Manajemen Materi & Tugas
- **Upload Materi (`/guru/materi`)**: Klik "Upload Materi Baru". Anda bisa mengunggah materi pembelajaran seperti modul (PDF, DOCX) atau menyisipkan tautan ke video/situs eksternal. Materi ini akan tersedia bagi siswa di kelas yang relevan.
- **Manajemen Tugas (`/guru/tugas`)**:
  - Klik "Buat Tugas Baru" untuk membuat tugas. Isi judul, deskripsi, pilih mata pelajaran, kelas tujuan, dan atur tenggat waktu pengumpulan.
  - Anda bisa melampirkan file soal jika diperlukan.
  - Setelah tugas dibuat, Anda bisa memantau pengumpulan tugas dari siswa dengan mengklik tombol "Periksa & Nilai" pada baris tugas yang bersangkutan.

### 3. Bank Soal & Manajemen Test
- **Bank Soal (`/guru/bank-soal`)**:
  - Klik "Buat Paket Soal Baru" untuk membuat "Paket Soal" yang berisi kumpulan pertanyaan (Pilihan Ganda atau Esai). Ini adalah gudang soal Anda yang bisa digunakan berulang kali.
  - Setelah paket dibuat, klik "Tambah Soal ke Paket Ini" untuk mulai menambahkan pertanyaan satu per satu.
- **Manajemen Test (`/guru/test`)**:
  - Klik "Buat Test Baru" untuk membuat test/ujian baru (Kuis, UTS, UAS).
  - Atur judul, mapel, kelas, jadwal pelaksanaan, dan durasi.
  - **Penting**: Setelah test dibuat, klik tombol "Soal" pada baris test tersebut. Sebuah jendela akan muncul memungkinkan Anda untuk melampirkan soal-soal dari Bank Soal yang telah Anda buat. Test tidak bisa dikerjakan siswa jika belum ada soalnya.

### 4. Absensi & Penilaian
- **Absensi Siswa (`/guru/absensi`)**:
  - Pilih kelas dan tanggal pada filter di bagian atas. Klik "Cari Sesi Pelajaran".
  - Pilih sesi pelajaran yang ingin Anda absensi. Daftar siswa akan muncul.
  - Pilih status kehadiran (Hadir, Izin, Sakit, Alpha) untuk setiap siswa, lalu klik "Simpan Absensi".
  - Anda juga bisa melihat dan mengekspor rekapitulasi absensi bulanan per kelas melalui tombol "Rekap Bulanan".
- **Penilaian Siswa (`/guru/penilaian`)**:
  - Ini adalah halaman untuk menginput nilai akhir semester siswa.
  - Pilih kelas, mata pelajaran, semester, dan tahun ajaran pada filter di atas.
  - Masukkan nilai komponen (Tugas, UTS, UAS, Harian) untuk setiap siswa. Nilai akhir dan predikat akan terhitung secara otomatis.
  - Setelah semua nilai terisi, klik tombol "Simpan Semua Nilai" di bagian bawah untuk menyimpan semua data ke database.

---

## III. Panduan untuk Siswa
Sebagai Siswa, Anda akan menggunakan aplikasi ini untuk mendukung proses belajar Anda.

### 1. Pendaftaran & Dasbor Siswa
- **Pendaftaran**: Klik tombol "Daftar" di halaman login. Isi nama lengkap, email, NIS, dan pilih kelas Anda dari daftar. Pastikan NIS Anda benar.
- **Verifikasi Email**: Setelah mendaftar, Anda akan diarahkan ke halaman verifikasi. Anda **harus membuka email Anda** dan mengklik tautan verifikasi sebelum dapat mengakses fitur-fitur siswa.
- **Dasbor**: Halaman utama Anda yang menampilkan ringkasan jadwal hari ini, tugas yang belum dikerjakan, dan test yang akan datang.

### 2. Mengakses Jadwal & Materi
- **Jadwal Pelajaran (`/siswa/jadwal`)**: Halaman ini menampilkan jadwal harian dan mingguan Anda secara lengkap, beserta nama guru dan ruangan.
- **Materi Pelajaran (`/siswa/materi`)**: Temukan semua materi (file atau link) yang telah diunggah oleh guru untuk mata pelajaran Anda. Anda bisa mengunduh atau membuka tautan materi tersebut melalui tombol yang tersedia.

### 3. Mengerjakan Tugas & Test
- **Tugas Saya (`/siswa/tugas`)**:
  - Lihat daftar tugas yang aktif (belum melewati tenggat) dan riwayat tugas yang sudah selesai.
  - Klik "Kumpulkan Jawaban" pada tugas yang aktif untuk membuka jendela pengumpulan. Anda bisa mengunggah file jawaban Anda atau mengetik jawaban langsung di kolom catatan.
  - Setelah dinilai, Anda dapat melihat nilai dan feedback dari guru di sini.
- **Test & Ujian (`/siswa/test`)**:
  - Lihat daftar test yang dijadwalkan untuk Anda.
  - Tombol "Mulai Test" akan aktif jika sudah masuk waktu pelaksanaan.
  - Setelah mengklik "Mulai", Anda akan masuk ke halaman pengerjaan soal dengan timer yang berjalan. Kerjakan test dalam batas waktu yang ditentukan. Jawaban akan otomatis tersimpan saat Anda berpindah soal. Pastikan untuk menekan "Selesaikan Test" sebelum waktu habis.

### 4. Melihat Nilai & Rapor
- **Nilai & Rapor (`/siswa/nilai`)**:
  - Halaman ini menampilkan rekapitulasi semua nilai akhir semester Anda dalam bentuk tabel.
  - Lihat grafik perbandingan nilai antar mata pelajaran untuk melihat performa Anda secara visual.
  - Klik tombol "Lihat Detail" (ikon mata) pada setiap baris nilai untuk melihat rincian komponennya (nilai tugas, UTS, UAS, harian) dan catatan dari guru.
  - Unduh rapor semester Anda dalam format PDF melalui tombol "Unduh Rapor" di pojok kanan atas.

---

## IV. Panduan untuk Pimpinan
Sebagai Pimpinan, Anda memiliki akses ke dasbor analitik untuk memantau kinerja sekolah secara keseluruhan.

### 1. Dasbor Kinerja Akademik
Dasbor utama Anda (`/pimpinan/dashboard`) menampilkan metrik-metrik kunci dalam bentuk visual:
- **Statistik Umum**: Kartu-kartu di atas menampilkan data kunci seperti total siswa, rasio guru-siswa, rata-rata kehadiran, dll.
- **Grafik Tren Kehadiran**: Visualisasi persentase kehadiran siswa selama beberapa bulan terakhir untuk melihat tren.
- **Perbandingan Nilai**: Diagram batang yang membandingkan rata-rata nilai akhir antar kelas, memudahkan identifikasi kelas berprestasi.
- **Peringkat Siswa**: Tabel yang menampilkan 10 siswa dengan prestasi akademik tertinggi di seluruh sekolah.
- **Distribusi Sumber Daya**: Informasi mengenai sebaran guru per mata pelajaran dan siswa per jurusan.

### 2. Laporan Rincian Nilai & Kehadiran
Untuk analisis yang lebih mendalam, Anda dapat mengakses menu laporan di sidebar:
- **Analisis Nilai Siswa (`/pimpinan/laporan/kelas`)**:
  - Gunakan filter di bagian atas untuk memilih angkatan (Tingkat) dan kelas/jurusan spesifik.
  - Klik "Tampilkan Laporan" untuk melihat tabel perbandingan nilai semua siswa di kelompok tersebut untuk setiap mata pelajaran. Halaman ini sangat berguna untuk melihat peringkat paralel dan kinerja akademik per kelas/jurusan.
- **Analisis Kehadiran (`/pimpinan/laporan/kehadiran`)**:
  - Gunakan filter untuk memilih tahun ajaran, semester, angkatan, dan kelas.
  - Klik "Tampilkan" untuk melihat tren kehadiran bulanan dalam bentuk grafik dan tabel rincian jumlah hadir, izin, sakit, dan alpha untuk setiap siswa dalam kelompok yang dipilih.

Semua laporan dapat diekspor ke format CSV atau dicetak ke PDF melalui tombol yang tersedia di pojok kanan atas.

---

## V. Pengaturan Akun (Semua Pengguna)
Semua pengguna dapat mengakses menu **Pengaturan** (`/settings`) melalui menu dropdown di pojok kanan atas (klik pada foto profil Anda). Di sini Anda dapat:
- **Memperbarui Profil**: Mengubah nama lengkap, nomor telepon, alamat, bio, dan mengganti foto profil Anda.
- **Mengubah Kata Sandi**: Memperbarui kata sandi Anda demi keamanan. Anda perlu memasukkan kata sandi saat ini dan kata sandi baru.
