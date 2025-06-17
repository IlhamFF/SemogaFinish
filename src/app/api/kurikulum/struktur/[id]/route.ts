
import "reflect-metadata"; // Ensure this is the very first import
import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth/next"; // REMOVED
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // REMOVED
import { getInitializedDataSource } from "@/lib/data-source";
import { StrukturKurikulumEntity } from "@/entities/struktur-kurikulum.entity";
import * as z from "zod";

// GET /api/kurikulum/struktur/[id] - (Not typically needed as structures are usually fetched by tingkat/jurusan)
// export async function GET(...) {}

// PUT /api/kurikulum/struktur/[id] - (Not typically needed for individual item updates this way)
// export async function PUT(...) {}

// DELETE /api/kurikulum/struktur/[id] - Menghapus satu item struktur kurikulum
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // TODO: Implement server-side Firebase token verification for admin/superadmin
  // const session = await getServerSession(authOptions); // REMOVED
  // if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) { // REMOVED
  //   return NextResponse.json({ message: "Akses ditolak." }, { status: 403 }); // REMOVED
  // } // REMOVED

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
