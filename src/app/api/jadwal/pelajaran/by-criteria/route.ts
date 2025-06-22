
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { JadwalPelajaranEntity } from "@/entities/jadwal-pelajaran.entity";
import { FindOptionsWhere } from "typeorm";
import { getAuthenticatedUser } from "@/lib/auth-utils";

export async function DELETE(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }
  if (!['admin', 'superadmin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak. Hanya admin yang dapat menghapus jadwal." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const criteria: FindOptionsWhere<JadwalPelajaranEntity> = {};

  if (searchParams.get("kelas")) criteria.kelas = searchParams.get("kelas")!;
  if (searchParams.get("hari")) criteria.hari = searchParams.get("hari")!;
  if (searchParams.get("guruId")) criteria.guruId = searchParams.get("guruId")!;

  if (Object.keys(criteria).length === 0) {
    return NextResponse.json({ message: "Minimal satu kriteria filter harus diberikan untuk penghapusan." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const jadwalRepo = dataSource.getRepository(JadwalPelajaranEntity);
    
    const deleteResult = await jadwalRepo.delete(criteria);

    if (deleteResult.affected === 0) {
      return NextResponse.json({ message: "Tidak ada jadwal pelajaran yang cocok dengan kriteria untuk dihapus." }, { status: 404 });
    }
    return NextResponse.json({ message: `${deleteResult.affected} entri jadwal pelajaran berhasil dihapus.` });
  } catch (error) {
    console.error("Error deleting jadwal pelajaran by criteria:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
