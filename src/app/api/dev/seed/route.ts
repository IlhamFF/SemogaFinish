
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { In, Not } from "typeorm";
import bcrypt from "bcryptjs";
import { format, subDays, addDays } from 'date-fns';
import { id as localeID } from 'date-fns/locale';

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
import { SoalEntity } from "@/entities/soal.entity";
import { BankSoalTestEntity } from "@/entities/bank-soal-test.entity";
import type { Role, TipeSoal } from "@/types";
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

        // --- Hapus Data Lama (kecuali superadmin dan admin) ---
        console.log("Menghapus data lama...");
        const adminUsers = await queryRunner.manager.find(UserEntity, { where: { role: In(['superadmin', 'admin']) } });
        const adminIdsToKeep = adminUsers.map(u => u.id);

        const tablesToClear = [
            "nilai_semester_siswa", "absensi_siswa", "bank_soal_test", "test_submissions", "tugas_submissions", "soal", "tugas", "tests", "jadwal_pelajaran", "slot_waktu", "ruangan", "mata_pelajaran"
        ];
        for (const table of tablesToClear) {
            await queryRunner.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
        }
        if (adminIdsToKeep.length > 0) {
            await queryRunner.manager.delete(UserEntity, { id: Not(In(adminIdsToKeep)) });
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
        
        const userRepo = queryRunner.manager.getRepository(UserEntity);

        // --- Seed Admin & Pimpinan ---
        const adminSeed = userRepo.create({
            fullName: "Admin Sekolah", email: "admin@azbail.sch.id", passwordHash: hashedPassword, role: 'admin' as Role, isVerified: true, emailVerified: new Date(), nip: `ADM${Date.now()}`
        });
        await userRepo.save(adminSeed);
        console.log(`Akun Admin berhasil dibuat.`);

        const pimpinanSeed = userRepo.create({
            fullName: "Pimpinan Sekolah", email: "pimpinan@azbail.sch.id", passwordHash: hashedPassword, role: 'pimpinan' as Role, isVerified: true, emailVerified: new Date(), nip: `PIM${Date.now()}`
        });
        await userRepo.save(pimpinanSeed);
        console.log(`Akun Pimpinan berhasil dibuat.`);

        // --- Seed Guru ---
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
        
        // --- Seed Absensi (diperkaya) ---
        const absensiRepo = queryRunner.manager.getRepository(AbsensiSiswaEntity);
        let createdAbsensiCount = 0;
        const absensiStatuses: StatusKehadiran[] = ["Hadir", "Hadir", "Hadir", "Hadir", "Hadir", "Hadir", "Sakit", "Izin", "Alpha"];
        
        for (const jadwal of createdJadwal) { 
            const siswaDiKelas = createdSiswa.filter(s => s.kelasId === jadwal.kelas);
            // Buat data absensi untuk 2 bulan terakhir
            for (let d = 0; d < 60; d++) {
                const tanggalAbsensi = subDays(new Date(), d);
                // Hanya buat absensi jika hari sama dengan hari jadwal
                if (format(tanggalAbsensi, 'eeee', { locale: localeID }) === jadwal.hari) {
                    for(const siswa of siswaDiKelas) {
                        const status = absensiStatuses[Math.floor(Math.random() * absensiStatuses.length)];
                        // Hindari membuat duplikat
                        const exists = await absensiRepo.findOne({where: {siswaId: siswa.id, jadwalPelajaranId: jadwal.id, tanggalAbsensi: format(tanggalAbsensi, 'yyyy-MM-dd')}});
                        if(!exists) {
                            const newAbsensi = absensiRepo.create({
                                siswaId: siswa.id,
                                jadwalPelajaranId: jadwal.id,
                                tanggalAbsensi: format(tanggalAbsensi, 'yyyy-MM-dd'),
                                statusKehadiran: status
                            });
                            await absensiRepo.save(newAbsensi);
                            createdAbsensiCount++;
                        }
                    }
                }
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
        
        // --- Seed Bank Soal ---
        const soalRepo = queryRunner.manager.getRepository(SoalEntity);
        const createdSoal = [];
        for (const guru of createdGurus) {
            const mapel = createdMapels.find(m => m.nama === guru.mataPelajaran![0]);
            if (mapel) {
                for(let i=0; i<5; i++) {
                    const newSoal = soalRepo.create({
                        paketSoal: `Kumpulan Soal ${mapel.nama}`,
                        tipeSoal: 'Pilihan Ganda' as TipeSoal,
                        pertanyaan: `Ini adalah pertanyaan nomor ${i+1} untuk mata pelajaran ${mapel.nama}. Berapakah hasil dari ${i+1} + ${i+1}?`,
                        pilihanJawaban: [
                            { id: 'A', text: `Jawaban A (${(i+1)+(i+1)})`},
                            { id: 'B', text: `Jawaban B (${(i+1)+1})`},
                            { id: 'C', text: `Jawaban C (${(i+1)+2})`},
                        ],
                        kunciJawaban: 'A',
                        tingkatKesulitan: 'Mudah',
                        mapelId: mapel.id,
                        pembuatId: guru.id,
                    });
                    createdSoal.push(await soalRepo.save(newSoal));
                }
            }
        }
        console.log(`${createdSoal.length} soal berhasil dibuat.`);
        
        // --- Seed Test & Submissions (with takable tests) ---
        const testRepo = queryRunner.manager.getRepository(TestEntity);
        const bankSoalTestRepo = queryRunner.manager.getRepository(BankSoalTestEntity);
        const testSubmissionRepo = queryRunner.manager.getRepository(TestSubmissionEntity);
        
        for (const guru of createdGurus.slice(0, 2)) {
            const mapelNama = guru.mataPelajaran![0];
            const mapel = createdMapels.find(m => m.nama === mapelNama)!;
            const soalUntukMapelIni = createdSoal.filter(s => s.mapelId === mapel.id);
            
            if (soalUntukMapelIni.length > 0) {
                // Test yang akan datang
                const tglMendatang = new Date();
                tglMendatang.setDate(tglMendatang.getDate() + 3);
                tglMendatang.setHours(8, 0, 0, 0);
                const testMendatang = await testRepo.save(testRepo.create({
                    judul: `Ulangan Harian Mendatang - ${mapel.nama}`,
                    mapel: mapel.nama,
                    kelas: KELAS_LIST[0],
                    tanggal: tglMendatang,
                    durasi: 45,
                    tipe: "Ulangan Harian",
                    status: "Terjadwal",
                    uploaderId: guru.id,
                    soalCount: soalUntukMapelIni.length
                }));
                await bankSoalTestRepo.save(soalUntukMapelIni.map(s => ({ testId: testMendatang.id, soalId: s.id })));
                
                // Test yang sedang berlangsung
                const tglBerlangsung = new Date();
                const testBerlangsung = await testRepo.save(testRepo.create({
                    judul: `Kuis Berlangsung - ${mapel.nama}`,
                    mapel: mapel.nama,
                    kelas: KELAS_LIST[1],
                    tanggal: tglBerlangsung,
                    durasi: 15,
                    tipe: "Kuis",
                    status: "Berlangsung",
                    uploaderId: guru.id,
                    soalCount: soalUntukMapelIni.slice(0, 2).length
                }));
                await bankSoalTestRepo.save(soalUntukMapelIni.slice(0, 2).map(s => ({ testId: testBerlangsung.id, soalId: s.id })));

                // Test yang sudah selesai dan bisa dinilai
                const tglSelesai = new Date();
                tglSelesai.setDate(tglSelesai.getDate() - 1);
                const testSelesai = await testRepo.save(testRepo.create({
                    judul: `UTS Selesai - ${mapel.nama}`,
                    mapel: mapel.nama,
                    kelas: KELAS_LIST[2],
                    tanggal: tglSelesai,
                    durasi: 90,
                    tipe: "UTS",
                    status: "Selesai",
                    uploaderId: guru.id,
                    soalCount: soalUntukMapelIni.length
                }));
                await bankSoalTestRepo.save(soalUntukMapelIni.map(s => ({ testId: testSelesai.id, soalId: s.id })));
                const siswaDiKelasIni = createdSiswa.find(s => s.kelasId === KELAS_LIST[2]);
                if(siswaDiKelasIni) {
                    await testSubmissionRepo.save(testSubmissionRepo.create({
                        siswaId: siswaDiKelasIni.id,
                        testId: testSelesai.id,
                        waktuMulai: tglSelesai,
                        waktuSelesai: new Date(tglSelesai.getTime() + 45 * 60000),
                        status: "Selesai",
                        jawabanSiswa: { [soalUntukMapelIni[0].id]: 'A' }
                    }));
                }
            }
        }
        console.log(`Test dengan berbagai status berhasil dibuat.`);

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
                nilaiTugas: Math.floor(Math.random() * 35) + 65,
                nilaiUTS: Math.floor(Math.random() * 40) + 60,
                nilaiUAS: Math.floor(Math.random() * 45) + 55,
                nilaiHarian: Math.floor(Math.random() * 30) + 70,
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
        return NextResponse.json({ message: `Database berhasil di-seed. Data baru telah ditambahkan.` });

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
