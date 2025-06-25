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
  
  const { searchParams } = new URL(request.url);
  const kelasId = searchParams.get("kelasId");

  if (!kelasId) {
    return NextResponse.json({ message: "Parameter 'kelasId' wajib diisi." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const nilaiRepo = dataSource.getRepository(NilaiSemesterSiswaEntity);

    // Get all grades for the specific class, including relations to student and subject
    const allGradesInClass = await nilaiRepo.find({
        where: { kelasId: kelasId },
        relations: ["siswa", "mapel"],
        order: { siswa: { fullName: "ASC" }, mapel: { nama: "ASC" } },
    });

    if (allGradesInClass.length === 0) {
        return NextResponse.json({ students: [], subjects: [] });
    }

    // Get all unique subjects in this class from the grades data
    const subjectsSet = new Set<string>();
    allGradesInClass.forEach(grade => {
        if (grade.mapel?.nama) {
            subjectsSet.add(grade.mapel.nama);
        }
    });
    const subjects = Array.from(subjectsSet).sort();

    // Group grades by student
    const studentsDataMap = new Map<string, { id: string; name: string; nis: string | null; grades: Record<string, number | null> }>();

    allGradesInClass.forEach(grade => {
        if (grade.siswa) {
            if (!studentsDataMap.has(grade.siswa.id)) {
                studentsDataMap.set(grade.siswa.id, {
                    id: grade.siswa.id,
                    name: grade.siswa.fullName || grade.siswa.name || "Nama Tidak Ada",
                    nis: grade.siswa.nis || null,
                    grades: {},
                });
            }
            if (grade.mapel?.nama) {
                const nilai = grade.nilaiAkhir !== null && grade.nilaiAkhir !== undefined ? parseFloat(String(grade.nilaiAkhir)) : null;
                studentsDataMap.get(grade.siswa.id)!.grades[grade.mapel.nama] = isNaN(nilai as number) ? null : nilai;
            }
        }
    });

    const students = Array.from(studentsDataMap.values()).map(student => {
        const gradeValues = Object.values(student.grades).filter(g => g !== null) as number[];
        const average = gradeValues.length > 0 
            ? gradeValues.reduce((sum, g) => sum + g, 0) / gradeValues.length 
            : 0;
        return { ...student, average: parseFloat(average.toFixed(2)) };
    }).sort((a, b) => b.average - a.average);

    return NextResponse.json({ students, subjects });

  } catch (error: any) {
    console.error("Error fetching class detail report:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", details: error.message }, { status: 500 });
  }
}
