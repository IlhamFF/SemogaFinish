
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { UserEntity } from "@/entities/user.entity";
import { AbsensiSiswaEntity } from "@/entities/absensi-siswa.entity";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";
import { Like, FindOptionsWhere, In } from "typeorm";
import { startOfMonth, endOfMonth, eachMonthOfInterval, format } from 'date-fns';

export async function GET(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser || !['pimpinan', 'superadmin', 'admin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }
  
  const { searchParams } = new URL(request.url);
  const tingkat = searchParams.get("tingkat");
  const kelas = searchParams.get("kelas");
  const tahunAjaran = searchParams.get("tahunAjaran"); // e.g., "2023/2024"
  const semester = searchParams.get("semester"); // "Ganjil" or "Genap"

  if (!tingkat || !tahunAjaran || !semester) {
    return NextResponse.json({ message: "Parameter 'tingkat', 'tahunAjaran', dan 'semester' wajib diisi." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const userRepo = dataSource.getRepository(UserEntity);
    const absensiRepo = dataSource.getRepository(AbsensiSiswaEntity);

    // --- Determine Date Range from Semester and Tahun Ajaran ---
    const [startYear, endYear] = tahunAjaran.split('/').map(Number);
    let startDate: Date, endDate: Date;
    if (semester === "Ganjil") {
        startDate = new Date(startYear, 6, 1); // July 1st
        endDate = new Date(startYear, 11, 31); // December 31st
    } else { // Genap
        startDate = new Date(endYear, 0, 1); // January 1st
        endDate = new Date(endYear, 5, 30); // June 30th
    }
    const monthsInInterval = eachMonthOfInterval({ start: startDate, end: endDate });

    // --- Find Students ---
    const studentWhereClause: FindOptionsWhere<UserEntity> = { role: 'siswa' };
    if (kelas && kelas !== "semua") {
      studentWhereClause.kelasId = kelas;
    } else {
      studentWhereClause.kelasId = Like(`${tingkat}%`);
    }
    const students = await userRepo.find({ where: studentWhereClause, select: ['id', 'fullName', 'name', 'nis', 'kelasId'] });

    if (students.length === 0) {
      return NextResponse.json({ studentStats: [], trendData: [] });
    }
    const studentIds = students.map(s => s.id);

    // --- Fetch Attendance Data ---
    const attendanceRecords = await absensiRepo.createQueryBuilder("absensi")
        .where("absensi.siswaId IN (:...studentIds)", { studentIds })
        .andWhere("absensi.tanggalAbsensi BETWEEN :startDate AND :endDate", { startDate: format(startDate, 'yyyy-MM-dd'), endDate: format(endDate, 'yyyy-MM-dd') })
        .getMany();
    
    // --- Process for Student Stats Table ---
    const statsMap = new Map<string, { hadir: number, izin: number, sakit: number, alpha: number, total: number }>();
    students.forEach(s => statsMap.set(s.id, { hadir: 0, izin: 0, sakit: 0, alpha: 0, total: 0 }));

    // Ambil total jadwal untuk setiap siswa dalam rentang waktu
    const totalJadwalQuery = await dataSource.query(`
        SELECT jp."kelas", COUNT(DISTINCT jp.id) AS "totalSesi"
        FROM jadwal_pelajaran jp
        WHERE jp.kelas IN (:...kelasIds)
        GROUP BY jp."kelas"
    `, [ [...new Set(students.map(s => s.kelasId))] ]);
    
    const sesiPerKelas = new Map<string, number>();
    totalJadwalQuery.forEach((item: { kelas: string, totalSesi: string }) => {
        // Asumsi 4 minggu per bulan, dan 6 bulan per semester
        const totalSesiSemester = parseInt(item.totalSesi, 10) * 4 * 6;
        sesiPerKelas.set(item.kelas, totalSesiSemester);
    });

    attendanceRecords.forEach(rec => {
        const stat = statsMap.get(rec.siswaId);
        if (stat) {
            if (rec.statusKehadiran === 'Hadir') stat.hadir++;
            else if (rec.statusKehadiran === 'Izin') stat.izin++;
            else if (rec.statusKehadiran === 'Sakit') stat.sakit++;
            else if (rec.statusKehadiran === 'Alpha') stat.alpha++;
        }
    });

    const studentStats = students.map(s => {
        const stat = statsMap.get(s.id)!;
        const totalPertemuan = sesiPerKelas.get(s.kelasId || "") || (stat.hadir + stat.izin + stat.sakit + stat.alpha);
        return {
            id: s.id,
            name: s.fullName || s.name || "Nama Tidak Ada",
            nis: s.nis || null,
            kelas: s.kelasId || "N/A",
            ...stat,
            total: totalPertemuan,
            persentaseKehadiran: totalPertemuan > 0 ? (stat.hadir / totalPertemuan) * 100 : 0,
        }
    }).sort((a, b) => b.alpha - a.alpha || a.persentaseKehadiran - b.persentaseKehadiran);


    // --- Process for Trend Chart ---
    const trendMap: Record<string, { total: number, hadir: number }> = {};
    monthsInInterval.forEach(month => {
      const monthKey = format(month, 'yyyy-MM');
      trendMap[monthKey] = { total: 0, hadir: 0 };
    });

    attendanceRecords.forEach(rec => {
        const monthKey = format(new Date(rec.tanggalAbsensi), 'yyyy-MM');
        if (trendMap[monthKey]) {
            trendMap[monthKey].total++;
            if (rec.statusKehadiran === 'Hadir') {
                trendMap[monthKey].hadir++;
            }
        }
    });

    const trendData = Object.entries(trendMap).map(([monthKey, data]) => ({
      name: format(new Date(monthKey + '-02'), 'MMM yy'), // use day 2 to avoid timezone issues
      Kehadiran: data.total > 0 ? parseFloat(((data.hadir / data.total) * 100).toFixed(1)) : 0,
    }));


    return NextResponse.json({ studentStats, trendData });

  } catch (error: any) {
    console.error("Error fetching attendance report:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", details: error.message }, { status: 500 });
  }
}
