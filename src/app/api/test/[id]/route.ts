
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { TestEntity, type TestTipe, type TestStatus } from "@/entities/test.entity";
import * as z from "zod";
import { formatISO } from 'date-fns';
import { getAuthenticatedUser } from "@/lib/auth-utils";

const testUpdateSchema = z.object({
  judul: z.string().min(5, { message: "Judul test minimal 5 karakter." }).optional(),
  mapel: z.string().optional(),
  kelas: z.string().optional(),
  tanggal: z.date().optional(),
  durasi: z.coerce.number().min(5, { message: "Durasi minimal 5 menit." }).optional(),
  tipe: z.enum(["Kuis", "Ulangan Harian", "UTS", "UAS", "Lainnya"]).optional(),
  status: z.enum(["Draf", "Terjadwal", "Berlangsung", "Selesai", "Dinilai"]).optional(),
  jumlahSoal: z.coerce.number().min(1, { message: "Jumlah soal minimal 1."}).optional().nullable(),
  deskripsi: z.string().optional().nullable(),
}).refine(data => Object.keys(data).length > 0, {
  message: "Minimal satu field harus diisi untuk melakukan pembaruan.",
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const authenticatedUser = getAuthenticatedUser(request);
    if (!authenticatedUser) {
        return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
        return NextResponse.json({ message: "ID test tidak valid." }, { status: 400 });
    }

    try {
        const dataSource = await getInitializedDataSource();
        const testRepo = dataSource.getRepository(TestEntity);
        const test = await testRepo.findOne({ where: { id }, relations: ["uploader"] });

        if (!test) {
            return NextResponse.json({ message: "Test tidak ditemukan." }, { status: 404 });
        }
        
        if (authenticatedUser.role === 'guru' && test.uploaderId !== authenticatedUser.id && !['admin', 'superadmin'].includes(authenticatedUser.role)) {
            return NextResponse.json({ message: "Akses ditolak untuk test ini." }, { status: 403 });
        }
        if (authenticatedUser.role === 'siswa' && test.kelas !== (authenticatedUser as any).kelasId) { // Assuming kelasId is in token payload
            return NextResponse.json({ message: "Akses ditolak untuk test kelas ini." }, { status: 403 });
        }
        
        return NextResponse.json({
            ...test,
            tanggal: formatISO(new Date(test.tanggal)),
            uploader: test.uploader ? { id: test.uploader.id, name: test.uploader.name, fullName: test.uploader.fullName } : undefined
        });
    } catch (error) {
        console.error("Error fetching test:", error);
        return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: "ID test tidak valid." }, { status: 400 });
  }

  try {
    const body = await request.json();
    if (body.tanggal) {
        body.tanggal = new Date(body.tanggal);
    }
    const validation = testUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Input tidak valid.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const updatePayload = validation.data;
    
    const dataSource = await getInitializedDataSource();
    const testRepo = dataSource.getRepository(TestEntity);
    const existingTest = await testRepo.findOneBy({ id });

    if (!existingTest) {
      return NextResponse.json({ message: "Test tidak ditemukan." }, { status: 404 });
    }
    
    if (!['admin', 'superadmin'].includes(authenticatedUser.role) && existingTest.uploaderId !== authenticatedUser.id) {
        return NextResponse.json({ message: "Akses ditolak. Anda bukan pemilik test ini." }, { status: 403 });
    }
    
    const updateData: Partial<TestEntity> = { ...updatePayload };
    if (updatePayload.tipe) updateData.tipe = updatePayload.tipe as TestTipe;
    if (updatePayload.status) updateData.status = updatePayload.status as TestStatus;
    if (updatePayload.tanggal) updateData.tanggal = updatePayload.tanggal;


    const updateResult = await testRepo.update(id, updateData);

    if (updateResult.affected === 0) {
      return NextResponse.json({ message: "Gagal memperbarui test." }, { status: 404 });
    }

    const updatedTest = await testRepo.findOne({ where: { id }, relations: ["uploader"] });
    return NextResponse.json({
        ...updatedTest,
        tanggal: updatedTest ? formatISO(new Date(updatedTest.tanggal)) : null,
        uploader: updatedTest?.uploader ? { id: updatedTest.uploader.id, name: updatedTest.uploader.name, fullName: updatedTest.uploader.fullName } : undefined
    });

  } catch (error) {
    console.error("Error updating test:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: "ID test tidak valid." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const testRepo = dataSource.getRepository(TestEntity);
    const testToDelete = await testRepo.findOneBy({ id });

    if (!testToDelete) {
      return NextResponse.json({ message: "Test tidak ditemukan." }, { status: 404 });
    }
    
    if (!['admin', 'superadmin'].includes(authenticatedUser.role) && testToDelete.uploaderId !== authenticatedUser.id) {
        return NextResponse.json({ message: "Akses ditolak. Anda bukan pemilik test ini." }, { status: 403 });
    }

    const deleteResult = await testRepo.delete(id);

    if (deleteResult.affected === 0) {
      return NextResponse.json({ message: "Gagal menghapus test." }, { status: 404 });
    }
    return NextResponse.json({ message: "Test berhasil dihapus." });
  } catch (error) {
    console.error("Error deleting test:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
