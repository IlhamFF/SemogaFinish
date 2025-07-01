
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { NilaiSemesterSiswaEntity } from "@/entities/nilai-semester-siswa.entity";
import { UserEntity } from "@/entities/user.entity";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";
import { Like } from "typeorm";

export async function GET(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser || !['pimpinan', 'superadmin', 'admin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }
  
  const { searchParams } = new URL(request.url);
  const tingkat = searchParams.get("tingkat");

  if (!tingkat) {
    return NextResponse.json({ message: "Parameter 'tingkat' wajib diisi." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const nilaiRepo = dataSource.getRepository(NilaiSemesterSiswaEntity);
    const userRepo = dataSource.getRepository(UserEntity);

    // Get all students in the specified grade level
    const studentsInGrade = await userRepo.find({
        where: { kelasId: Like(`${tingkat}%`), role: 'siswa' },
        select: ['id', 'fullName', 'name', 'nis', 'kelasId']
    });

    if (studentsInGrade.length === 0) {
        return NextResponse.json({ students: [], subjects: [] });
    }

    const studentIds = studentsInGrade.map(s => s.id);

    // Get all grades for these students
    const allGradesForStudents = await nilaiRepo.find({
        where: { siswaId: In(studentIds) },
        relations: ["mapel"],
    });

    // Get all unique subjects from the grades data
    const subjectsSet = new Set<string>();
    allGradesForStudents.forEach(grade => {
        if (grade.mapel?.nama) {
            subjectsSet.add(grade.mapel.nama);
        }
    });
    const subjects = Array.from(subjectsSet).sort();

    // Group grades by student
    const studentsDataMap = new Map<string, { id: string; name: string; nis: string | null; kelas: string | null; grades: Record<string, number | null> }>();
    
    // Initialize map with all students from the grade
    studentsInGrade.forEach(student => {
        studentsDataMap.set(student.id, {
            id: student.id,
            name: student.fullName || student.name || "Nama Tidak Ada",
            nis: student.nis || null,
            kelas: student.kelasId || null,
            grades: {},
        });
    });

    allGradesForStudents.forEach(grade => {
        const studentEntry = studentsDataMap.get(grade.siswaId);
        if (studentEntry && grade.mapel?.nama) {
            const nilai = grade.nilaiAkhir !== null && grade.nilaiAkhir !== undefined ? parseFloat(String(grade.nilaiAkhir)) : null;
            studentEntry.grades[grade.mapel.nama] = isNaN(nilai as number) ? null : nilai;
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
