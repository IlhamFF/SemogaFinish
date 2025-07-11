
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { NilaiSemesterSiswaEntity } from "@/entities/nilai-semester-siswa.entity";
import { UserEntity } from "@/entities/user.entity";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";
import { MataPelajaranEntity } from "@/entities/mata-pelajaran.entity";
import { AbsensiSiswaEntity } from "@/entities/absensi-siswa.entity";
import { format, subMonths } from 'date-fns';

export async function GET(request: NextRequest) {
  const authenticatedUser = await getAuthenticatedUser(request);
  if (!authenticatedUser || !['pimpinan', 'superadmin', 'admin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const nilaiRepo = dataSource.getRepository(NilaiSemesterSiswaEntity);
    const userRepo = dataSource.getRepository(UserEntity);
    const mapelRepo = dataSource.getRepository(MataPelajaranEntity);
    const absensiRepo = dataSource.getRepository(AbsensiSiswaEntity);

    // --- Start Real Attendance Calculation ---
    const sixMonthsAgo = format(subMonths(new Date(), 5), 'yyyy-MM-01'); // Start of the month, 6 months ago including current
    const attendanceDataRaw = await absensiRepo.query(
      `SELECT
          TO_CHAR(DATE_TRUNC('month', "tanggalAbsensi"), 'Mon') AS "name",
          COUNT(*) as "total",
          COUNT(CASE WHEN "statusKehadiran" = 'Hadir' THEN 1 END) as "hadir"
       FROM absensi_siswa
       WHERE "tanggalAbsensi" >= $1
       GROUP BY DATE_TRUNC('month', "tanggalAbsensi")
       ORDER BY DATE_TRUNC('month', "tanggalAbsensi") ASC;`,
       [sixMonthsAgo]
    );

    const kehadiranSiswaBulanan = attendanceDataRaw.map((row: { name: string, total: string, hadir: string }) => ({
        name: row.name,
        Kehadiran: row.total === "0" ? 0 : parseFloat(((parseInt(row.hadir, 10) / parseInt(row.total, 10)) * 100).toFixed(1))
    }));
    // --- End Real Attendance Calculation ---

    // Perform other queries in parallel for efficiency
    const [
      rataRataKelasData,
      peringkatSiswaData,
      totalSiswa,
      totalGuru,
      kelasData,
      totalMataPelajaran,
      allGurus,
      allSiswa,
      absensiBermasalahData,
    ] = await Promise.all([
      // Rata-rata per kelas
      nilaiRepo.createQueryBuilder("nilai")
        .select("nilai.kelasId", "name")
        .addSelect("AVG(nilai.nilaiAkhir)", "rataRata")
        .where("nilai.nilaiAkhir IS NOT NULL")
        .groupBy("nilai.kelasId")
        .orderBy('AVG("nilai"."nilaiAkhir")', "DESC")
        .getRawMany(),
      // Peringkat siswa
      userRepo.createQueryBuilder("user")
        .select("user.fullName", "nama")
        .addSelect("user.kelasId", "kelas")
        .addSelect("AVG(nilai.nilaiAkhir)", "rataRata")
        .leftJoin("user.nilaiSemesterSiswa", "nilai", "nilai.siswaId = user.id")
        .where("user.role = :role", { role: 'siswa' })
        .andWhere("nilai.nilaiAkhir IS NOT NULL")
        .groupBy("user.id")
        .orderBy('AVG("nilai"."nilaiAkhir")', "DESC")
        .limit(10)
        .getRawMany(),
      // Counts
      userRepo.count({ where: { role: 'siswa' } }),
      userRepo.count({ where: { role: 'guru' } }),
      userRepo.createQueryBuilder("user")
        .select("DISTINCT user.kelasId", "kelas")
        .where("user.role = :role AND user.kelasId IS NOT NULL", { role: 'siswa' })
        .getRawMany(),
      mapelRepo.count(),
      userRepo.find({ where: { role: 'guru' } }),
      userRepo.find({ where: { role: 'siswa' } }),
      // Absensi Bermasalah (Alpha terbanyak 30 hari terakhir)
      absensiRepo
        .createQueryBuilder("absensi")
        .select("absensi.siswaId", "siswaId")
        .addSelect("user.fullName", "nama")
        .addSelect("user.kelasId", "kelas")
        .addSelect("COUNT(*)", "alphaCount")
        .leftJoin("absensi.siswa", "user")
        .where("absensi.statusKehadiran = :status", { status: 'Alpha' })
        .andWhere("absensi.tanggalAbsensi BETWEEN :startDate AND :endDate", { 
          startDate: format(subMonths(new Date(), 1), 'yyyy-MM-dd'), 
          endDate: format(new Date(), 'yyyy-MM-dd') 
        })
        .groupBy("absensi.siswaId, user.fullName, user.kelasId")
        .orderBy("\"alphaCount\"", "DESC")
        .limit(5)
        .getRawMany(),
    ]);
    
    // --- Additional Calculations ---
    const rasioGuruSiswa = totalGuru > 0 ? `1 : ${(totalSiswa / totalGuru).toFixed(1)}` : "N/A";

    const guruMapelCount: Record<string, number> = {};
    allGurus.forEach(guru => {
        if (guru.mataPelajaran) {
            guru.mataPelajaran.forEach(mapel => {
                guruMapelCount[mapel] = (guruMapelCount[mapel] || 0) + 1;
            });
        }
    });
    const distribusiGuruMapel = Object.entries(guruMapelCount).map(([name, value]) => ({ name, value }));
    
    const siswaJurusanCount: Record<string, number> = { 'IPA': 0, 'IPS': 0, 'Lainnya': 0 };
    allSiswa.forEach(siswa => {
        if(siswa.kelasId?.includes('IPA')) {
            siswaJurusanCount['IPA']++;
        } else if (siswa.kelasId?.includes('IPS')) {
            siswaJurusanCount['IPS']++;
        } else if (siswa.kelasId) {
            siswaJurusanCount['Lainnya']++;
        }
    });
    const sebaranSiswaJurusan = Object.entries(siswaJurusanCount).filter(([,value]) => value > 0).map(([name, value]) => ({ name, value }));
    
    const rataRataKelas = rataRataKelasData.map(item => ({
        ...item,
        rataRata: parseFloat(item.rataRata)
    }));

    const peringkatSiswa = peringkatSiswaData.map(item => ({
        ...item,
        rataRata: parseFloat(item.rataRata)
    }));
    
    const totalKelas = kelasData.length;
    
    return NextResponse.json({ 
      rataRataKelas, 
      peringkatSiswa,
      totalSiswa,
      totalGuru,
      totalKelas,
      totalMataPelajaran,
      rasioGuruSiswa,
      kehadiranSiswaBulanan,
      distribusiGuruMapel,
      sebaranSiswaJurusan,
      absensiBermasalah: absensiBermasalahData,
    });

  } catch (error: any) {
    console.error("Error fetching laporan akademik:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", details: error.message }, { status: 500 });
  }
}
