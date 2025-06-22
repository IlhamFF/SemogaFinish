
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { TugasSubmissionEntity } from "@/entities/tugas-submission.entity";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";
import { FindOptionsWhere } from "typeorm";

export async function GET(request: NextRequest) {
    const authenticatedUser = getAuthenticatedUser(request);
    if (!authenticatedUser) {
        return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
    }
    if (authenticatedUser.role !== 'siswa' && authenticatedUser.role !== 'superadmin') {
        return NextResponse.json({ message: "Akses ditolak. Hanya siswa yang dapat melihat submissions mereka." }, { status: 403 });
    }
    
    try {
        const dataSource = await getInitializedDataSource();
        const submissionRepo = dataSource.getRepository(TugasSubmissionEntity);
        const submissions = await submissionRepo.find({
            where: { siswaId: authenticatedUser.id },
            relations: ["tugas", "siswa"], // Include task details
            order: { createdAt: "DESC" }
        });

        // Filter sensitive data before sending
        const safeSubmissions = submissions.map(sub => ({
            ...sub,
            siswa: undefined, // Don't need to send siswa data back to the siswa itself
            tugas: sub.tugas ? { id: sub.tugas.id, judul: sub.tugas.judul, mapel: sub.tugas.mapel } : undefined, // Send only necessary task info
        }));

        return NextResponse.json(safeSubmissions);
    } catch (error: any) {
        console.error("Error fetching user's submissions:", error);
        return NextResponse.json({ message: "Terjadi kesalahan internal server.", details: error.message }, { status: 500 });
    }
}
