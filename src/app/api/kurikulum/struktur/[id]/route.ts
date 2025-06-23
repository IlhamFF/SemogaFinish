
import "reflect-metadata"; 
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { StrukturKurikulumEntity } from "@/entities/struktur-kurikulum.entity";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }
  if (!['admin', 'superadmin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak. Hanya admin yang dapat menghapus item struktur." }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: "ID item struktur kurikulum tidak valid." }, { status: 400 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const strukturRepo = dataSource.getRepository(StrukturKurikulumEntity);
    const deleteResult = await strukturRepo.delete(id);

    if (deleteResult.affected === 0) {
      return NextResponse.json({ message: "Item struktur kurikulum tidak ditemukan untuk dihapus." }, { status: 404 });
    }
    return NextResponse.json({ message: "Item struktur kurikulum berhasil dihapus." });
  } catch (error) {
    console.error("Error deleting struktur kurikulum item:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
