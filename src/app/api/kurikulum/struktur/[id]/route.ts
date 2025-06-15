
import "reflect-metadata"; // Ensure this is the very first import
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getInitializedDataSource } from "@/lib/data-source";
import { StrukturKurikulumEntity } from "@/entities/struktur-kurikulum.entity";
import * as z from "zod";

// TODO: Implement GET and PUT for individual struktur item if needed later

// DELETE /api/kurikulum/struktur/[id] - Menghapus satu item struktur kurikulum
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
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
