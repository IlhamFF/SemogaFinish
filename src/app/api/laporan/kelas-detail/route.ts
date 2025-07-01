
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { NilaiSemesterSiswaEntity } from "@/entities/nilai-semester-siswa.entity";
import { UserEntity } from "@/entities/user.entity";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";
import { Like, FindOptionsWhere } from "typeorm";

export interface ReportStudent {
  id: string;
  name: string;
  nis: string | null;
  kelas: string | null;
  grades: Record<string, number | null>;
  average: number;
}

export interface ClassReport {
    className: string;
    students: ReportStudent[];
    classAverage: number;
}

export interface ReportData {
  classReports: ClassReport[];
  subjects: string[];
}


export async function GET(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser || !['pimpinan', 'superadmin', 'admin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }
  
  const { searchParams } = new URL(request.url);
  const tingkat = searchParams.get("tingkat");
  const kelas = searchParams.get("kelas");

  if (!tingkat) {
    return NextResponse.json({ message: "Parameter 'tingkat' wajib diisi." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const nilaiRepo = dataSource.getRepository(NilaiSemesterSiswaEntity);
    const userRepo = dataSource.getRepository(UserEntity);

    const studentWhereClause: FindOptionsWhere<UserEntity> = { role: 'siswa' };
    if (kelas && kelas !== "semua") {
      studentWhereClause.kelasId = kelas;
    } else {
      studentWhereClause.kelasId = Like(`${tingkat}%`);
    }

    const studentsInGrade = await userRepo.find({
        where: studentWhereClause,
        select: ['id', 'fullName', 'name', 'nis', 'kelasId']
    });

    if (studentsInGrade.length === 0) {
        return NextResponse.json({ classReports: [], subjects: [] });
    }

    const studentIds = studentsInGrade.map(s => s.id);
    
    // Using QueryBuilder to avoid potential issues with 'In' operator import
    const allGradesForStudents = await nilaiRepo.createQueryBuilder("nilai")
        .leftJoinAndSelect("nilai.mapel", "mapel")
        .where("nilai.siswaId IN (:...studentIds)", { studentIds })
        .getMany();
    
    const subjectsSet = new Set<string>();
    allGradesForStudents.forEach(grade => {
        if (grade.mapel?.nama) {
            subjectsSet.add(grade.mapel.nama);
        }
    });
    const subjects = Array.from(subjectsSet).sort();

    const gradesByStudentId = new Map<string, NilaiSemesterSiswaEntity[]>();
    allGradesForStudents.forEach(grade => {
        if (!gradesByStudentId.has(grade.siswaId)) {
            gradesByStudentId.set(grade.siswaId, []);
        }
        gradesByStudentId.get(grade.siswaId)!.push(grade);
    });

    const studentsByClass = studentsInGrade.reduce((acc, student) => {
        const className = student.kelasId || "Tanpa Kelas";
        if (!acc[className]) {
            acc[className] = [];
        }
        acc[className].push(student);
        return acc;
    }, {} as Record<string, UserEntity[]>);


    const classReports: ClassReport[] = Object.entries(studentsByClass).map(([className, students]) => {
        const processedStudents: ReportStudent[] = students.map(student => {
            const studentGrades = gradesByStudentId.get(student.id) || [];
            const grades: Record<string, number | null> = {};
            
            subjects.forEach(subjectName => {
                const gradeForSubject = studentGrades.find(g => g.mapel?.nama === subjectName);
                const nilai = gradeForSubject?.nilaiAkhir !== null && gradeForSubject?.nilaiAkhir !== undefined ? parseFloat(String(gradeForSubject.nilaiAkhir)) : null;
                grades[subjectName] = isNaN(nilai as number) ? null : nilai;
            });
            
            const gradeValues = Object.values(grades).filter(g => g !== null) as number[];
            const average = gradeValues.length > 0 
                ? gradeValues.reduce((sum, g) => sum + g, 0) / gradeValues.length 
                : 0;

            return {
                id: student.id,
                name: student.fullName || student.name || "Nama Tidak Ada",
                nis: student.nis || null,
                kelas: student.kelasId || null,
                grades,
                average: parseFloat(average.toFixed(2))
            };
        }).sort((a, b) => b.average - a.average);

        const classTotalAverage = processedStudents.reduce((sum, s) => sum + s.average, 0);
        const classAverage = processedStudents.length > 0 ? parseFloat((classTotalAverage / processedStudents.length).toFixed(2)) : 0;
        
        return {
            className,
            students: processedStudents,
            classAverage,
        };
    }).sort((a, b) => b.classAverage - a.classAverage);

    return NextResponse.json({ classReports, subjects });

  } catch (error: any) {
    console.error("Error fetching class detail report:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", details: error.message }, { status: 500 });
  }
}
