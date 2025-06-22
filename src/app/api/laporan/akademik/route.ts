
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { NilaiSemesterSiswaEntity } from "@/entities/nilai-semester-siswa.entity";
import { UserEntity } from "@/entities/user.entity";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";

export async function GET(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser || !['pimpinan', 'superadmin', 'admin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const nilaiRepo = dataSource.getRepository(NilaiSemesterSiswaEntity);
    const userRepo = dataSource.getRepository(UserEntity);

    // Rata-rata per kelas
    const rataRataKelasData = await nilaiRepo.createQueryBuilder("nilai")
      .select("nilai.kelasId", "name")
      .addSelect("AVG(nilai.nilaiAkhir)", "rataRata")
      .where("nilai.nilaiAkhir IS NOT NULL")
      .groupBy("nilai.kelasId")
      .orderBy("rataRata", "DESC")
      .getRawMany();

    // Peringkat siswa
    const peringkatSiswaData = await userRepo.createQueryBuilder("user")
      .select("user.fullName", "nama")
      .addSelect("user.kelasId", "kelas")
      .addSelect("AVG(nilai.nilaiAkhir)", "rataRata")
      .leftJoin("user.nilaiSemesterSiswa", "nilai", "nilai.siswaId = user.id")
      .where("user.role = :role", { role: 'siswa' })
      .andWhere("nilai.nilaiAkhir IS NOT NULL")
      .groupBy("user.id") // Menggunakan user.id untuk grouping yang benar
      .orderBy("rataRata", "DESC")
      .limit(5)
      .getRawMany();

    // Pastikan tipe data numerik benar
    const rataRataKelas = rataRataKelasData.map(item => ({
        ...item,
        rataRata: parseFloat(item.rataRata)
    }));

    const peringkatSiswa = peringkatSiswaData.map(item => ({
        ...item,
        rataRata: parseFloat(item.rataRata)
    }));
    
    return NextResponse.json({ rataRataKelas, peringkatSiswa });

  } catch (error: any) {
    console.error("Error fetching laporan akademik:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", details: error.message }, { status: 500 });
  }
}
