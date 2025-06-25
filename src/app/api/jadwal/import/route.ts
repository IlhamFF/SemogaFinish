import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";

// Note: This is a simulation. It does not parse the CSV or interact with the database.
export async function POST(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser || !['admin', 'superadmin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak. Hanya admin yang dapat melakukan impor." }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ message: "Tidak ada file yang diunggah." }, { status: 400 });
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    const simulatedEntries = Math.floor(Math.random() * 50) + 20; // Simulate 20-70 entries

    return NextResponse.json({
      message: `${simulatedEntries} entri jadwal berhasil diimpor (simulasi). Data jadwal belum diperbarui secara nyata.`,
      count: simulatedEntries
    }, { status: 200 });

  } catch (error: any) {
    console.error("Schedule import simulation error:", error);
    return NextResponse.json({ message: "Gagal memproses file impor.", error: error.message }, { status: 500 });
  }
}
