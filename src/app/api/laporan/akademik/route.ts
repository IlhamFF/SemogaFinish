
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { NilaiSemesterSiswaEntity } from "@/entities/nilai-semester-siswa.entity";
import { UserEntity } from "@/entities/user.entity";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";
import { MataPelajaranEntity } from "@/entities/mata-pelajaran.entity";

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

    // Perform all queries in parallel for efficiency
    const [
      rataRataKelasData,
      peringkatSiswaData,
      totalSiswa,
      totalGuru,
      kelasData,
      totalMataPelajaran,
      allGurus,
      allSiswa
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
      userRepo.find({ where: { role: 'siswa' } })
    ]);
    
    // --- Additional Calculations ---

    // Rasio Guru:Siswa
    const rasioGuruSiswa = totalGuru > 0 ? `1 : ${(totalSiswa / totalGuru).toFixed(1)}` : "N/A";

    // Distribusi Guru per Mapel
    const guruMapelCount: Record<string, number> = {};
    allGurus.forEach(guru => {
        if (guru.mataPelajaran) {
            guru.mataPelajaran.forEach(mapel => {
                guruMapelCount[mapel] = (guruMapelCount[mapel] || 0) + 1;
            });
        }
    });
    const distribusiGuruMapel = Object.entries(guruMapelCount).map(([name, value]) => ({ name, value }));
    
    // Sebaran Siswa per Jurusan
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


    // Mock Data for Attendance Trend
    const kehadiranSiswaBulanan = [
        { name: 'Jan', Kehadiran: 95.5 },
        { name: 'Feb', Kehadiran: 96.2 },
        { name: 'Mar', Kehadiran: 94.8 },
        { name: 'Apr', Kehadiran: 97.1 },
        { name: 'Mei', Kehadiran: 93.5 },
        { name: 'Jun', Kehadiran: 98.0 },
    ];
    const rataRataKehadiranGuru = 98.5; // Mock data

    // Pastikan tipe data numerik benar
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
      rataRataKehadiranGuru,
      distribusiGuruMapel,
      sebaranSiswaJurusan
    });

  } catch (error: any) {
    console.error("Error fetching laporan akademik:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", details: error.message }, { status: 500 });
  }
}
