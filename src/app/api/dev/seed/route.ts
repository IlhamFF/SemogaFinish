
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { In, Not } from "typeorm";
import bcrypt from "bcryptjs";

// Import all entities
import { UserEntity } from "@/entities/user.entity";
import { MataPelajaranEntity } from "@/entities/mata-pelajaran.entity";
import { RuanganEntity } from "@/entities/ruangan.entity";
import { SlotWaktuEntity } from "@/entities/slot-waktu.entity";
import { JadwalPelajaranEntity } from "@/entities/jadwal-pelajaran.entity";
import { TugasEntity } from "@/entities/tugas.entity";
import { TugasSubmissionEntity } from "@/entities/tugas-submission.entity";
import { TestEntity } from "@/entities/test.entity";
import { TestSubmissionEntity } from "@/entities/test-submission.entity";
import { AbsensiSiswaEntity, type StatusKehadiran } from "@/entities/absensi-siswa.entity";
import { NilaiSemesterSiswaEntity, type SemesterTypeEntity } from "@/entities/nilai-semester-siswa.entity";
import type { Role } from "@/types";
import { KATEGORI_MAPEL } from "@/lib/constants";

// --- DUMMY DATA DEFINITIONS ---

const MAPEL_DATA = [
    { kode: "MTK-W", nama: "Matematika Wajib", kategori: "Wajib Umum" },
    { kode: "IND", nama: "Bahasa Indonesia", kategori: "Wajib Umum" },
    { kode: "ENG", nama: "Bahasa Inggris", kategori: "Wajib Umum" },
    { kode: "FIS", nama: "Fisika", kategori: "Wajib Peminatan IPA" },
    { kode: "KIM", nama: "Kimia", kategori: "Wajib Peminatan IPA" },
    { kode: "BIO", nama: "Biologi", kategori: "Wajib Peminatan IPA" },
    { kode: "EKO", nama: "Ekonomi", kategori: "Wajib Peminatan IPS" },
    { kode: "GEO", nama: "Geografi", kategori: "Wajib Peminatan IPS" },
    { kode: "SOS", nama: "Sosiologi", kategori: "Wajib Peminatan IPS" },
    { kode: "SJR-W", nama: "Sejarah Indonesia", kategori: "Wajib Umum" },
];

const GURU_DATA = [
    { fullName: "Budi Santoso", mapel: ["Matematika Wajib", "Fisika"] },
    { fullName: "Siti Aminah", mapel: ["Bahasa Indonesia"] },
    { fullName: "Ahmad Dahlan", mapel: ["Sejarah Indonesia"] },
    { fullName: "Dewi Lestari", mapel: ["Bahasa Inggris", "Sosiologi"] },
    { fullName: "Eko Prasetyo", mapel: ["Kimia"] },
    { fullName: "Fitri Handayani", mapel: ["Biologi"] },
    { fullName: "Gunawan Wicaksono", mapel: ["Ekonomi"] },
    { fullName: "Herlina Sari", mapel: ["Geografi"] },
];

const RUANGAN_DATA = [
    { nama: "Kelas X IPA 1", kode: "X-IPA-1", kapasitas: 36 },
    { nama: "Kelas X IPS 1", kode: "X-IPS-1", kapasitas: 36 },
    { nama: "Kelas XI IPA 1", kode: "XI-IPA-1", kapasitas: 36 },
    { nama: "Kelas XI IPS 1", kode: "XI-IPS-1", kapasitas: 36 },
    { nama: "Laboratorium Fisika", kode: "LAB-FIS", kapasitas: 40 },
    { nama: "Laboratorium Biologi", kode: "LAB-BIO", kapasitas: 40 },
    { nama: "Ruang Multimedia", kode: "MULTI-1", kapasitas: 50 },
];

const SLOT_WAKTU_DATA = [
    { namaSlot: "Jam ke-1", waktuMulai: "07:00", waktuSelesai: "07:45", urutan: 1 },
    { namaSlot: "Jam ke-2", waktuMulai: "07:45", waktuSelesai: "08:30", urutan: 2 },
    { namaSlot: "Jam ke-3", waktuMulai: "08:30", waktuSelesai: "09:15", urutan: 3 },
    { namaSlot: "Istirahat 1", waktuMulai: "09:15", waktuSelesai: "09:30", urutan: 4 },
    { namaSlot: "Jam ke-4", waktuMulai: "09:30", waktuSelesai: "10:15", urutan: 5 },
    { namaSlot: "Jam ke-5", waktuMulai: "10:15", waktuSelesai: "11:00", urutan: 6 },
    { namaSlot: "Jam ke-6", waktuMulai: "11:00", waktuSelesai: "11:45", urutan: 7 },
    { namaSlot: "Istirahat 2", waktuMulai: "11:45", waktuSelesai: "12:30", urutan: 8 },
    { namaSlot: "Jam ke-7", waktuMulai: "12:30", waktuSelesai: "13:15", urutan: 9 },
    { namaSlot: "Jam ke-8", waktuMulai: "13:15", waktuSelesai: "14:00", urutan: 10 },
];

const KELAS_LIST = ["X IPA 1", "X IPS 1", "XI IPA 1", "XI IPS 1"];

function calculateNilaiAkhir(data: { nilaiTugas?: number | null, nilaiUTS?: number | null, nilaiUAS?: number | null, nilaiHarian?: number | null }): number | null {
  const { nilaiTugas, nilaiUTS, nilaiUAS, nilaiHarian } = data;
  const bobotTugas = 0.20;
  const bobotUTS = 0.30;
  const bobotUAS = 0.40;
  const bobotHarian = 0.10;

  let totalNilai = 0;
  let totalBobot = 0;

  if (typeof nilaiTugas === 'number') { totalNilai += nilaiTugas * bobotTugas; totalBobot += bobotTugas; }
  if (typeof nilaiUTS === 'number') { totalNilai += nilaiUTS * bobotUTS; totalBobot += bobotUTS; }
  if (typeof nilaiUAS === 'number') { totalNilai += nilaiUAS * bobotUAS; totalBobot += bobotUAS; }
  if (typeof nilaiHarian === 'number') { totalNilai += nilaiHarian * bobotHarian; totalBobot += bobotHarian; }

  if (totalBobot === 0) return null;
  return parseFloat((totalNilai / totalBobot).toFixed(2));
}

function determinePredikat(nilaiAkhir: number | null): string | null {
  if (nilaiAkhir === null) return null;
  if (nilaiAkhir >= 90) return "A";
  if (nilaiAkhir >= 80) return "B";
  if (nilaiAkhir >= 70) return "C";
  if (nilaiAkhir >= 60) return "D";
  return "E";
}


export async function GET(request: NextRequest) {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ message: "Akses ditolak. Seeding hanya tersedia di lingkungan pengembangan." }, { status: 403 });
    }

    const dataSource = await getInitializedDataSource();
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        console.log("--- Memulai Proses Seeding ---");

        // --- Hapus Data Lama (kecuali superadmin) ---
        console.log("Menghapus data lama...");
        const superAdmin = await queryRunner.manager.findOne(UserEntity, { where: { role: 'superadmin' } });
        const tablesToClear = [
            "nilai_semester_siswa", "absensi_siswa", "test_submissions", "tugas_submissions", "tugas", "tests", "jadwal_pelajaran", "slot_waktu", "ruangan", "mata_pelajaran"
        ];
        for (const table of tablesToClear) {
            await queryRunner.query(`DELETE FROM ${table};`);
        }
        if (superAdmin) {
            await queryRunner.manager.delete(UserEntity, { id: Not(superAdmin.id) });
        } else {
            await queryRunner.manager.clear(UserEntity);
        }
        console.log("Data lama berhasil dihapus.");

        const defaultPassword = "password";
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        
        // --- Seed Mata Pelajaran ---
        const mapelRepo = queryRunner.manager.getRepository(MataPelajaranEntity);
        const createdMapels = await mapelRepo.save(MAPEL_DATA.map(m => mapelRepo.create(m as any)));
        console.log(`${createdMapels.length} mata pelajaran berhasil dibuat.`);

        // --- Seed Ruangan ---
        const ruanganRepo = queryRunner.manager.getRepository(RuanganEntity);
        const createdRuangans = await ruanganRepo.save(RUANGAN_DATA.map(r => ruanganRepo.create(r)));
        console.log(`${createdRuangans.length} ruangan berhasil dibuat.`);

        // --- Seed Slot Waktu ---
        const slotWaktuRepo = queryRunner.manager.getRepository(SlotWaktuEntity);
        const createdSlots = await slotWaktuRepo.save(SLOT_WAKTU_DATA.map(s => slotWaktuRepo.create(s)));
        console.log(`${createdSlots.length} slot waktu berhasil dibuat.`);

        // --- Seed Guru ---
        const userRepo = queryRunner.manager.getRepository(UserEntity);
        const createdGurus = [];
        for (const [i, guru] of GURU_DATA.entries()) {
            const newGuru = userRepo.create({
                fullName: guru.fullName,
                email: `guru${i+1}@azbail.sch.id`,
                passwordHash: hashedPassword,
                role: 'guru' as Role,
                isVerified: true,
                emailVerified: new Date(),
                mataPelajaran: guru.mapel,
                nip: `G${Date.now() + i}`
            });
            createdGurus.push(await userRepo.save(newGuru));
        }
        console.log(`${createdGurus.length} guru berhasil dibuat.`);

        // --- Seed Siswa ---
        const createdSiswa = [];
        for (let i = 0; i < 100; i++) {
            const kelas = KELAS_LIST[i % KELAS_LIST.length];
            const newSiswa = userRepo.create({
                fullName: `Siswa Dummy ${i + 1}`,
                email: `siswa${i+1}@azbail.sch.id`,
                passwordHash: hashedPassword,
                role: 'siswa' as Role,
                isVerified: true,
                emailVerified: new Date(),
                kelasId: kelas,
                nis: `S${Date.now() + i}`
            });
            createdSiswa.push(await userRepo.save(newSiswa));
        }
        console.log(`${createdSiswa.length} siswa berhasil dibuat.`);

        // --- Seed Jadwal Pelajaran ---
        const jadwalRepo = queryRunner.manager.getRepository(JadwalPelajaranEntity);
        const createdJadwal = [];
        const hariEfektif = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
        for(const kelas of KELAS_LIST) {
            for (const hari of hariEfektif) {
                for(let i=0; i<4; i++) { // 4 pelajaran per hari per kelas
                    const guru = createdGurus[Math.floor(Math.random() * createdGurus.length)];
                    const mapelNama = guru.mataPelajaran![Math.floor(Math.random() * guru.mataPelajaran!.length)];
                    const mapel = createdMapels.find(m => m.nama === mapelNama)!;
                    const slot = createdSlots[i];
                    const ruangan = createdRuangans[Math.floor(Math.random() * createdRuangans.length)];

                    const isSlotTaken = await jadwalRepo.findOne({ where: { kelas, hari, slotWaktuId: slot.id } });
                    const isGuruTaken = await jadwalRepo.findOne({ where: { guruId: guru.id, hari, slotWaktuId: slot.id }});
                    if (!isSlotTaken && !isGuruTaken) {
                        const newJadwal = jadwalRepo.create({ kelas, hari, guruId: guru.id, mapelId: mapel.id, slotWaktuId: slot.id, ruanganId: ruangan.id });
                        createdJadwal.push(await jadwalRepo.save(newJadwal));
                    }
                }
            }
        }
        console.log(`${createdJadwal.length} jadwal pelajaran berhasil dibuat.`);
        
        // --- Seed Absensi ---
        const absensiRepo = queryRunner.manager.getRepository(AbsensiSiswaEntity);
        let createdAbsensiCount = 0;
        const absensiStatuses: StatusKehadiran[] = ["Hadir", "Hadir", "Hadir", "Hadir", "Hadir", "Hadir", "Sakit", "Izin", "Alpha"];
        for (const jadwal of createdJadwal.slice(0, 50)) { // Ambil 50 jadwal acak untuk diisi absensinya
            const siswaDiKelas = createdSiswa.filter(s => s.kelasId === jadwal.kelas);
            for(const siswa of siswaDiKelas) {
                const status = absensiStatuses[Math.floor(Math.random() * absensiStatuses.length)];
                const newAbsensi = absensiRepo.create({
                    siswaId: siswa.id,
                    jadwalPelajaranId: jadwal.id,
                    tanggalAbsensi: new Date().toISOString().split('T')[0],
                    statusKehadiran: status
                });
                await absensiRepo.save(newAbsensi);
                createdAbsensiCount++;
            }
        }
        console.log(`${createdAbsensiCount} absensi berhasil dibuat.`);


        // --- Seed Tugas & Submissions ---
        const tugasRepo = queryRunner.manager.getRepository(TugasEntity);
        const submissionRepo = queryRunner.manager.getRepository(TugasSubmissionEntity);
        let createdTugasCount = 0;
        let createdSubmissionCount = 0;
        for (const guru of createdGurus) {
            for (const kelas of KELAS_LIST) {
                const mapelNama = guru.mataPelajaran![Math.floor(Math.random() * guru.mataPelajaran!.length)];
                
                const tenggat = new Date();
                tenggat.setDate(tenggat.getDate() + 7);

                const newTugas = tugasRepo.create({
                    judul: `Tugas ${mapelNama} untuk kelas ${kelas}`,
                    mapel: mapelNama,
                    kelas: kelas,
                    uploaderId: guru.id,
                    deskripsi: `Kerjakan tugas ini dengan baik dan kumpulkan sebelum tenggat waktu.`,
                    tenggat: tenggat,
                });
                const savedTugas = await tugasRepo.save(newTugas);
                createdTugasCount++;
                
                const siswaDiKelas = createdSiswa.filter(s => s.kelasId === kelas);
                for (const siswa of siswaDiKelas.slice(0, Math.floor(siswaDiKelas.length * 0.8))) { // 80% siswa mengumpulkan
                     const newSubmission = submissionRepo.create({
                         tugasId: savedTugas.id,
                         siswaId: siswa.id,
                         status: "Dinilai",
                         dikumpulkanPada: new Date(),
                         nilai: Math.floor(Math.random() * 40) + 60, // Nilai 60-100
                         feedbackGuru: "Kerja bagus, pertahankan!",
                         fileUrlJawaban: "/placeholder.pdf",
                         namaFileJawaban: "jawaban.pdf"
                     });
                     await submissionRepo.save(newSubmission);
                     createdSubmissionCount++;
                }
            }
        }
        console.log(`${createdTugasCount} tugas dan ${createdSubmissionCount} submission berhasil dibuat.`);
        
        // --- Seed Test & Submissions ---
        const testRepo = queryRunner.manager.getRepository(TestEntity);
        const testSubmissionRepo = queryRunner.manager.getRepository(TestSubmissionEntity);
        let createdTestCount = 0;
        for (const jadwal of createdJadwal.slice(0,10)) { // Buat test untuk 10 jadwal
            const newTest = testRepo.create({
                judul: `Kuis ${jadwal.mapel.nama}`,
                mapel: jadwal.mapel.nama,
                kelas: jadwal.kelas,
                tanggal: new Date(),
                durasi: 60,
                tipe: "Kuis",
                status: "Selesai",
                uploaderId: jadwal.guruId
            });
            const savedTest = await testRepo.save(newTest);
            createdTestCount++;
            const siswaDiKelas = createdSiswa.filter(s => s.kelasId === jadwal.kelas);
            for(const siswa of siswaDiKelas) {
                const newSubmission = testSubmissionRepo.create({
                    siswaId: siswa.id,
                    testId: savedTest.id,
                    waktuMulai: new Date(),
                    waktuSelesai: new Date(Date.now() + 30 * 60 * 1000), // 30 menit kemudian
                    status: "Selesai"
                });
                await testSubmissionRepo.save(newSubmission);
            }
        }
        console.log(`${createdTestCount} test berhasil dibuat.`);

        // --- Seed Nilai Semester ---
        const nilaiRepo = queryRunner.manager.getRepository(NilaiSemesterSiswaEntity);
        const createdNilai = [];
        const semester: SemesterTypeEntity = "Ganjil";
        const tahunAjaran = "2023/2024";

        const uniquePelajaranSiswa = new Map<string, { siswaId: string, mapelId: string, kelasId: string, guruId: string }>();
        for (const jadwal of createdJadwal) {
            const siswaDiKelas = createdSiswa.filter(s => s.kelasId === jadwal.kelas);
            for (const siswa of siswaDiKelas) {
                const key = `${siswa.id}-${jadwal.mapelId}`;
                if (!uniquePelajaranSiswa.has(key)) {
                    uniquePelajaranSiswa.set(key, {
                        siswaId: siswa.id,
                        mapelId: jadwal.mapelId,
                        kelasId: jadwal.kelas,
                        guruId: jadwal.guruId
                    });
                }
            }
        }

        for (const { siswaId, mapelId, kelasId, guruId } of uniquePelajaranSiswa.values()) {
            const nilaiKomponen = {
                nilaiTugas: Math.floor(Math.random() * 35) + 65, // 65-99
                nilaiUTS: Math.floor(Math.random() * 40) + 60, // 60-99
                nilaiUAS: Math.floor(Math.random() * 45) + 55, // 55-99
                nilaiHarian: Math.floor(Math.random() * 30) + 70, // 70-99
            };
            
            const nilaiAkhir = calculateNilaiAkhir(nilaiKomponen);
            const predikat = determinePredikat(nilaiAkhir);

            const newNilai = nilaiRepo.create({
                siswaId,
                mapelId,
                kelasId,
                semester,
                tahunAjaran,
                ...nilaiKomponen,
                nilaiAkhir,
                predikat,
                catatanGuru: "Perlu lebih giat belajar untuk meningkatkan pemahaman konsep.",
                dicatatOlehGuruId: guruId
            });
            createdNilai.push(await nilaiRepo.save(newNilai));
        }
        console.log(`${createdNilai.length} nilai semester berhasil dibuat.`);

        // Commit transaction
        await queryRunner.commitTransaction();
        console.log("--- Seeding Selesai ---");
        return NextResponse.json({ message: `Database berhasil di-seed. ${createdGurus.length} guru, ${createdSiswa.length} siswa, ${createdTugasCount} tugas, dan data lainnya telah ditambahkan.` });

    } catch (error: any) {
        // Rollback transaction on error
        await queryRunner.rollbackTransaction();
        console.error("Seeding error:", error);
        return NextResponse.json({ message: "Gagal melakukan seeding database.", error: error.message }, { status: 500 });
    } finally {
        // Release query runner
        await queryRunner.release();
    }
}

    