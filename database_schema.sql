-- Skema Database EduCentral SMA Az-Bail
-- Dibuat berdasarkan entitas TypeORM pada proyek.
-- Dialek: PostgreSQL

-- Ekstensi yang diperlukan untuk `gen_random_uuid()`
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum Types (didefinisikan secara manual untuk PostgreSQL)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_role_enum') THEN
        CREATE TYPE "users_role_enum" AS ENUM('admin', 'guru', 'siswa', 'pimpinan', 'superadmin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'standar_kompetensi_lulusan_kategori_enum') THEN
        CREATE TYPE "standar_kompetensi_lulusan_kategori_enum" AS ENUM('Sikap', 'Pengetahuan', 'Keterampilan');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'capaian_pembelajaran_fase_enum') THEN
        CREATE TYPE "capaian_pembelajaran_fase_enum" AS ENUM('A', 'B', 'C', 'D', 'E', 'F', 'Lainnya');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mata_pelajaran_kategori_enum') THEN
        CREATE TYPE "mata_pelajaran_kategori_enum" AS ENUM('Wajib Umum', 'Wajib Peminatan IPA', 'Wajib Peminatan IPS', 'Pilihan Lintas Minat', 'Muatan Lokal');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'materi_ajar_jenismateri_enum') THEN
        CREATE TYPE "materi_ajar_jenismateri_enum" AS ENUM('File', 'Link');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tests_tipe_enum') THEN
        CREATE TYPE "tests_tipe_enum" AS ENUM('Kuis', 'Ulangan Harian', 'UTS', 'UAS', 'Lainnya');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tests_status_enum') THEN
        CREATE TYPE "tests_status_enum" AS ENUM('Draf', 'Terjadwal', 'Berlangsung', 'Selesai', 'Menunggu Hasil', 'Dinilai');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tugas_submissions_status_enum') THEN
        CREATE TYPE "tugas_submissions_status_enum" AS ENUM('Menunggu Penilaian', 'Dinilai', 'Terlambat');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'test_submissions_status_enum') THEN
        CREATE TYPE "test_submissions_status_enum" AS ENUM('Berlangsung', 'Selesai', 'Dinilai');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'absensi_siswa_statuskehadiran_enum') THEN
        CREATE TYPE "absensi_siswa_statuskehadiran_enum" AS ENUM('Hadir', 'Izin', 'Sakit', 'Alpha');
    END IF;
     IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nilai_semester_siswa_semester_enum') THEN
        CREATE TYPE "nilai_semester_siswa_semester_enum" AS ENUM('Ganjil', 'Genap');
    END IF;
END$$;


-- =================================================================
-- Tabel: users
-- Menyimpan semua data pengguna dan peran mereka.
-- =================================================================
CREATE TABLE IF NOT EXISTS "users" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "name" character varying,
    "email" character varying NOT NULL,
    "emailVerified" TIMESTAMP,
    "image" character varying,
    "passwordHash" character varying,
    "role" "users_role_enum" NOT NULL DEFAULT 'siswa',
    "isVerified" boolean NOT NULL DEFAULT false,
    "fullName" character varying,
    "phone" character varying,
    "address" text,
    "birthDate" date,
    "bio" text,
    "nis" character varying,
    "nip" character varying,
    "joinDate" date,
    "kelasId" character varying,
    "mataPelajaran" text, -- simple-array diimplementasikan sebagai text
    "resetPasswordToken" character varying,
    "resetPasswordExpires" TIMESTAMP WITH TIME ZONE,
    "emailVerificationToken" character varying,
    "emailVerificationTokenExpires" TIMESTAMP WITH TIME ZONE,
    "firebaseUid" character varying,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"),
    CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
    CONSTRAINT "UQ_e64342f0a1c1d817b1651478548" UNIQUE ("firebaseUid")
);
CREATE INDEX IF NOT EXISTS "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email");

-- =================================================================
-- Tabel: mata_pelajaran
-- Menyimpan daftar semua mata pelajaran yang ada di sekolah.
-- =================================================================
CREATE TABLE IF NOT EXISTS "mata_pelajaran" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "kode" character varying(50) NOT NULL,
    "nama" character varying(255) NOT NULL,
    "deskripsi" text,
    "kategori" "mata_pelajaran_kategori_enum" NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT "PK_b896b53b84b728a50672102148d" PRIMARY KEY ("id"),
    CONSTRAINT "UQ_f47bb9f58525b0458859157a419" UNIQUE ("kode")
);
CREATE INDEX IF NOT EXISTS "IDX_f47bb9f58525b0458859157a41" ON "mata_pelajaran" ("kode");

-- =================================================================
-- Tabel: ruangan
-- Menyimpan daftar ruangan yang tersedia untuk kegiatan belajar.
-- =================================================================
CREATE TABLE IF NOT EXISTS "ruangan" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "nama" character varying(255) NOT NULL,
    "kode" character varying(50) NOT NULL,
    "kapasitas" integer NOT NULL,
    "fasilitas" text,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT "PK_5ed654d5b7a14e195f137e19e79" PRIMARY KEY ("id"),
    CONSTRAINT "UQ_ac988b0439603099c222624a919" UNIQUE ("kode")
);
CREATE INDEX IF NOT EXISTS "IDX_ac988b0439603099c222624a91" ON "ruangan" ("kode");


-- =================================================================
-- Tabel: slot_waktu
-- Mendefinisikan slot-slot waktu untuk jadwal pelajaran.
-- =================================================================
CREATE TABLE IF NOT EXISTS "slot_waktu" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "namaSlot" character varying(100) NOT NULL,
    "waktuMulai" TIME NOT NULL,
    "waktuSelesai" TIME NOT NULL,
    "urutan" integer,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT "PK_3e11440263f35061614e59178f7" PRIMARY KEY ("id"),
    CONSTRAINT "UQ_819e64d7c67534d58a5c3789417" UNIQUE ("namaSlot")
);
CREATE INDEX IF NOT EXISTS "IDX_819e64d7c67534d58a5c378941" ON "slot_waktu" ("namaSlot");


-- =================================================================
-- Tabel Kurikulum (SKL, CP, Kategori)
-- =================================================================
CREATE TABLE IF NOT EXISTS "standar_kompetensi_lulusan" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "kode" character varying(50) NOT NULL,
    "deskripsi" text NOT NULL,
    "kategori" "standar_kompetensi_lulusan_kategori_enum" NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT "PK_e88b8d2d6342838e12a45a34e0a" PRIMARY KEY ("id"),
    CONSTRAINT "UQ_385966581451f2515b81a704439" UNIQUE ("kode")
);
CREATE INDEX IF NOT EXISTS "IDX_385966581451f2515b81a70443" ON "standar_kompetensi_lulusan" ("kode");

CREATE TABLE IF NOT EXISTS "capaian_pembelajaran" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "kode" character varying(100) NOT NULL,
    "deskripsi" text NOT NULL,
    "fase" "capaian_pembelajaran_fase_enum" NOT NULL,
    "elemen" character varying(255) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT "PK_8e3c310c8152b1b516b472e3a1f" PRIMARY KEY ("id"),
    CONSTRAINT "UQ_1a3f019f3f27806509a25b3a628" UNIQUE ("kode")
);
CREATE INDEX IF NOT EXISTS "IDX_1a3f019f3f27806509a25b3a62" ON "capaian_pembelajaran" ("kode");

CREATE TABLE IF NOT EXISTS "materi_kategori" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "nama" character varying(255) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT "PK_d88f192b95b8772322301c24d4e" PRIMARY KEY ("id"),
    CONSTRAINT "UQ_714d24a87d4681e42ac596856d1" UNIQUE ("nama")
);
CREATE INDEX IF NOT EXISTS "IDX_714d24a87d4681e42ac596856d" ON "materi_kategori" ("nama");


-- =================================================================
-- Tabel Perangkat Ajar (Silabus, RPP, Materi Ajar)
-- =================================================================
CREATE TABLE IF NOT EXISTS "materi_ajar" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "judul" character varying(255) NOT NULL,
    "deskripsi" text,
    "mapelNama" character varying(255) NOT NULL,
    "jenisMateri" "materi_ajar_jenismateri_enum" NOT NULL,
    "namaFileOriginal" character varying(255),
    "fileUrl" character varying(500),
    "tanggalUpload" date NOT NULL,
    "uploaderId" uuid NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT "PK_0e9e4e6e8e8e6e5e4e3e2e1e0d" PRIMARY KEY ("id"),
    CONSTRAINT "FK_materi_ajar_uploader" FOREIGN KEY ("uploaderId") REFERENCES "users"("id") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "silabus" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "judul" character varying(255) NOT NULL,
    "mapelId" uuid NOT NULL,
    "kelas" character varying(100) NOT NULL,
    "deskripsiSingkat" text,
    "namaFileOriginal" character varying(255),
    "fileUrl" character varying(500),
    "uploaderId" uuid NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT "PK_b896b53b84b728a50672102148e" PRIMARY KEY ("id"),
    CONSTRAINT "FK_silabus_mapel" FOREIGN KEY ("mapelId") REFERENCES "mata_pelajaran"("id") ON DELETE CASCADE,
    CONSTRAINT "FK_silabus_uploader" FOREIGN KEY ("uploaderId") REFERENCES "users"("id") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "rpp" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "judul" character varying(255) NOT NULL,
    "mapelId" uuid NOT NULL,
    "kelas" character varying(100) NOT NULL,
    "pertemuanKe" integer NOT NULL,
    "materiPokok" text,
    "kegiatanPembelajaran" text,
    "penilaian" text,
    "namaFileOriginal" character varying(255),
    "fileUrl" character varying(500),
    "uploaderId" uuid NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT "PK_b896b53b84b728a50672102148f" PRIMARY KEY ("id"),
    CONSTRAINT "FK_rpp_mapel" FOREIGN KEY ("mapelId") REFERENCES "mata_pelajaran"("id") ON DELETE CASCADE,
    CONSTRAINT "FK_rpp_uploader" FOREIGN KEY ("uploaderId") REFERENCES "users"("id") ON DELETE SET NULL
);


-- =================================================================
-- Tabel Struktur Kurikulum
-- =================================================================
CREATE TABLE IF NOT EXISTS "struktur_kurikulum" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "tingkat" character varying(10) NOT NULL,
    "jurusan" character varying(50) NOT NULL,
    "mapelId" uuid NOT NULL,
    "alokasiJam" integer NOT NULL,
    "guruPengampuId" uuid,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7434" PRIMARY KEY ("id"),
    CONSTRAINT "UQ_struktur_kurikulum_unique" UNIQUE ("tingkat", "jurusan", "mapelId"),
    CONSTRAINT "FK_struktur_kurikulum_mapel" FOREIGN KEY ("mapelId") REFERENCES "mata_pelajaran"("id") ON DELETE CASCADE,
    CONSTRAINT "FK_struktur_kurikulum_guru" FOREIGN KEY ("guruPengampuId") REFERENCES "users"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "IDX_struktur_kurikulum_unique" ON "struktur_kurikulum" ("tingkat", "jurusan", "mapelId");


-- =================================================================
-- Tabel Jadwal Pelajaran
-- =================================================================
CREATE TABLE IF NOT EXISTS "jadwal_pelajaran" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "hari" character varying(20) NOT NULL,
    "kelas" character varying(100) NOT NULL,
    "slotWaktuId" uuid NOT NULL,
    "mapelId" uuid NOT NULL,
    "guruId" uuid NOT NULL,
    "ruanganId" uuid NOT NULL,
    "catatan" text,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT "PK_c3e1c6b0b6c6b6e6d6c6c6c6c6c" PRIMARY KEY ("id"),
    CONSTRAINT "UQ_jadwal_kelas_slot" UNIQUE ("hari", "kelas", "slotWaktuId"),
    CONSTRAINT "FK_jadwal_slot" FOREIGN KEY ("slotWaktuId") REFERENCES "slot_waktu"("id") ON DELETE CASCADE,
    CONSTRAINT "FK_jadwal_mapel" FOREIGN KEY ("mapelId") REFERENCES "mata_pelajaran"("id") ON DELETE CASCADE,
    CONSTRAINT "FK_jadwal_guru" FOREIGN KEY ("guruId") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "FK_jadwal_ruangan" FOREIGN KEY ("ruanganId") REFERENCES "ruangan"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "IDX_jadwal_guru_slot" ON "jadwal_pelajaran" ("hari", "guruId", "slotWaktuId");
CREATE INDEX IF NOT EXISTS "IDX_jadwal_ruangan_slot" ON "jadwal_pelajaran" ("hari", "ruanganId", "slotWaktuId");


-- =================================================================
-- Tabel Tugas dan Ujian
-- =================================================================
CREATE TABLE IF NOT EXISTS "tugas" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "judul" character varying(255) NOT NULL,
    "deskripsi" text,
    "mapel" character varying(255) NOT NULL,
    "kelas" character varying(255) NOT NULL,
    "tenggat" TIMESTAMP WITH TIME ZONE NOT NULL,
    "namaFileLampiran" character varying(255),
    "fileUrlLampiran" character varying(500),
    "uploaderId" uuid NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT "PK_tugas" PRIMARY KEY ("id"),
    CONSTRAINT "FK_tugas_uploader" FOREIGN KEY ("uploaderId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "tests" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "judul" character varying(255) NOT NULL,
    "mapel" character varying(255) NOT NULL,
    "kelas" character varying(255) NOT NULL,
    "tanggal" TIMESTAMP WITH TIME ZONE NOT NULL,
    "durasi" integer NOT NULL,
    "tipe" "tests_tipe_enum" NOT NULL,
    "status" "tests_status_enum" NOT NULL DEFAULT 'Draf',
    "deskripsi" text,
    "jumlahSoal" integer,
    "uploaderId" uuid NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT "PK_tests" PRIMARY KEY ("id"),
    CONSTRAINT "FK_tests_uploader" FOREIGN KEY ("uploaderId") REFERENCES "users"("id") ON DELETE CASCADE
);


-- =================================================================
-- Tabel Submission (Tugas dan Ujian)
-- =================================================================
CREATE TABLE IF NOT EXISTS "tugas_submissions" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "siswaId" uuid NOT NULL,
    "tugasId" uuid NOT NULL,
    "namaFileJawaban" character varying(255),
    "fileUrlJawaban" character varying(500),
    "catatanSiswa" text,
    "dikumpulkanPada" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "status" "tugas_submissions_status_enum" NOT NULL DEFAULT 'Menunggu Penilaian',
    "nilai" numeric(5, 2),
    "feedbackGuru" text,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT "PK_tugas_submissions" PRIMARY KEY ("id"),
    CONSTRAINT "UQ_tugas_submission_unique" UNIQUE ("siswaId", "tugasId"),
    CONSTRAINT "FK_tugas_submission_siswa" FOREIGN KEY ("siswaId") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "FK_tugas_submission_tugas" FOREIGN KEY ("tugasId") REFERENCES "tugas"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "IDX_tugas_submission_unique" ON "tugas_submissions" ("siswaId", "tugasId");

CREATE TABLE IF NOT EXISTS "test_submissions" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "siswaId" uuid NOT NULL,
    "testId" uuid NOT NULL,
    "waktuMulai" TIMESTAMP WITH TIME ZONE NOT NULL,
    "waktuSelesai" TIMESTAMP WITH TIME ZONE,
    "jawabanSiswa" jsonb,
    "nilai" numeric(5, 2),
    "catatanGuru" text,
    "status" "test_submissions_status_enum" NOT NULL DEFAULT 'Berlangsung',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT "PK_test_submissions" PRIMARY KEY ("id"),
    CONSTRAINT "UQ_test_submission_unique" UNIQUE ("siswaId", "testId"),
    CONSTRAINT "FK_test_submission_siswa" FOREIGN KEY ("siswaId") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "FK_test_submission_test" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "IDX_test_submission_unique" ON "test_submissions" ("siswaId", "testId");


-- =================================================================
-- Tabel Penilaian dan Absensi
-- =================================================================
CREATE TABLE IF NOT EXISTS "absensi_siswa" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "siswaId" uuid NOT NULL,
    "jadwalPelajaranId" uuid NOT NULL,
    "tanggalAbsensi" date NOT NULL,
    "statusKehadiran" "absensi_siswa_statuskehadiran_enum" NOT NULL,
    "catatan" text,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT "PK_absensi_siswa" PRIMARY KEY ("id"),
    CONSTRAINT "UQ_absensi_unique" UNIQUE ("siswaId", "jadwalPelajaranId", "tanggalAbsensi"),
    CONSTRAINT "FK_absensi_siswa" FOREIGN KEY ("siswaId") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "FK_absensi_jadwal" FOREIGN KEY ("jadwalPelajaranId") REFERENCES "jadwal_pelajaran"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "nilai_semester_siswa" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "siswaId" uuid NOT NULL,
    "mapelId" uuid NOT NULL,
    "kelasId" character varying(100) NOT NULL,
    "semester" "nilai_semester_siswa_semester_enum" NOT NULL,
    "tahunAjaran" character varying(10) NOT NULL,
    "nilaiTugas" numeric(5, 2),
    "nilaiUTS" numeric(5, 2),
    "nilaiUAS" numeric(5, 2),
    "nilaiHarian" numeric(5, 2),
    "nilaiAkhir" numeric(5, 2),
    "predikat" character varying(5),
    "catatanGuru" text,
    "dicatatOlehGuruId" uuid NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT "PK_nilai_semester_siswa" PRIMARY KEY ("id"),
    CONSTRAINT "UQ_nilai_semester_unique" UNIQUE ("siswaId", "mapelId", "kelasId", "semester", "tahunAjaran"),
    CONSTRAINT "FK_nilai_siswa" FOREIGN KEY ("siswaId") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "FK_nilai_mapel" FOREIGN KEY ("mapelId") REFERENCES "mata_pelajaran"("id") ON DELETE CASCADE,
    CONSTRAINT "FK_nilai_guru" FOREIGN KEY ("dicatatOlehGuruId") REFERENCES "users"("id") ON DELETE SET NULL
);

-- Akhir dari skema --
