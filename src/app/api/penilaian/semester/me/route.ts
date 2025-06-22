
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { NilaiSemesterSiswaEntity } from "@/entities/nilai-semester-siswa.entity";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";

export async function GET(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }
  // Hanya siswa yang dapat mengakses data nilai mereka sendiri melalui endpoint ini
  if (authenticatedUser.role !== 'siswa' && authenticatedUser.role !== 'superadmin') {
      return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const nilaiRepo = dataSource.getRepository(NilaiSemesterSiswaEntity);

    const semesterGrades = await nilaiRepo.find({
      where: { siswaId: authenticatedUser.id },
      relations: ["mapel", "dicatatOlehGuru"],
      order: { tahunAjaran: "DESC", semester: "DESC", mapel: { nama: "ASC" } },
    });
    
    // Format data sebelum mengirim untuk keamanan dan konsistensi
    const formattedGrades = semesterGrades.map(grade => ({
        ...grade,
        mapel: grade.mapel ? { id: grade.mapel.id, nama: grade.mapel.nama, kode: grade.mapel.kode } : undefined,
        dicatatOlehGuru: grade.dicatatOlehGuru ? { fullName: grade.dicatatOlehGuru.fullName, name: grade.dicatatOlehGuru.name } : undefined,
        siswa: undefined, // Tidak perlu mengirim data siswa kembali ke siswa
    }));

    return NextResponse.json(formattedGrades);

  } catch (error: any) {
    console.error("Error fetching student semester grades:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", details: error.message }, { status: 500 });
  }
}
