
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { NilaiSemesterSiswaEntity } from "@/entities/nilai-semester-siswa.entity";
import { UserEntity } from "@/entities/user.entity";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";
import { MataPelajaranEntity } from "@/entities/mata-pelajaran.entity";

export async function GET(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
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
      mapelRepo.count()
    ]);

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
      totalMataPelajaran
    });

  } catch (error: any) {
    console.error("Error fetching laporan akademik:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", details: error.message }, { status: 500 });
  }
}
