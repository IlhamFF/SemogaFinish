
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { AbsensiSiswaEntity, type StatusKehadiran } from "@/entities/absensi-siswa.entity";
import { UserEntity } from "@/entities/user.entity";
import { JadwalPelajaranEntity } from "@/entities/jadwal-pelajaran.entity";
import * as z from "zod";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";
import { format, parseISO } from 'date-fns';

const getAbsensiQuerySchema = z.object({
  jadwalPelajaranId: z.string().uuid("ID Jadwal Pelajaran tidak valid."),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal YYYY-MM-DD."),
});

export async function GET(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
  }
  // Hanya guru yang mengajar sesi tersebut atau admin/superadmin yang bisa GET
  // Validasi lebih lanjut akan dilakukan setelah mengambil data jadwalPelajaran

  const { searchParams } = new URL(request.url);
  const queryValidation = getAbsensiQuerySchema.safeParse({
    jadwalPelajaranId: searchParams.get("jadwalPelajaranId"),
    tanggal: searchParams.get("tanggal"),
  });

  if (!queryValidation.success) {
    return NextResponse.json({ message: "Parameter query tidak valid.", errors: queryValidation.error.flatten().fieldErrors }, { status: 400 });
  }
  const { jadwalPelajaranId, tanggal } = queryValidation.data;

  try {
    const dataSource = await getInitializedDataSource();
    const jadwalPelajaranRepo = dataSource.getRepository(JadwalPelajaranEntity);
    const absensiRepo = dataSource.getRepository(AbsensiSiswaEntity);
    const userRepo = dataSource.getRepository(UserEntity);

    const jadwalPelajaran = await jadwalPelajaranRepo.findOneBy({ id: jadwalPelajaranId });
    if (!jadwalPelajaran) {
      return NextResponse.json({ message: "Jadwal pelajaran tidak ditemukan." }, { status: 404 });
    }

    if (authenticatedUser.role === 'guru' && jadwalPelajaran.guruId !== authenticatedUser.id) {
      return NextResponse.json({ message: "Akses ditolak. Anda tidak mengajar sesi ini." }, { status: 403 });
    }

    // Ambil semua siswa di kelas tersebut
    const siswaDiKelas = await userRepo.find({
      where: { kelasId: jadwalPelajaran.kelas, role: "siswa" },
      select: ["id", "fullName", "name", "nis"],
      order: { fullName: "ASC" }
    });

    // Ambil data absensi yang sudah ada untuk sesi dan tanggal ini
    const existingAbsensi = await absensiRepo.find({
      where: { jadwalPelajaranId, tanggalAbsensi: tanggal },
      relations: ["siswa"],
    });

    const absensiMap = new Map<string, AbsensiSiswaEntity>();
    existingAbsensi.forEach(absen => absensiMap.set(absen.siswaId, absen));

    const responseData = siswaDiKelas.map(siswa => {
      const absenSiswa = absensiMap.get(siswa.id);
      return {
        siswaId: siswa.id,
        fullName: siswa.fullName || siswa.name,
        nis: siswa.nis,
        statusKehadiran: absenSiswa?.statusKehadiran || null, // Default null if not recorded
        catatan: absenSiswa?.catatan || null,
        absensiId: absenSiswa?.id || null, // ID absensi jika sudah ada
      };
    });

    return NextResponse.json({
        jadwalPelajaran: {
            id: jadwalPelajaran.id,
            kelas: jadwalPelajaran.kelas,
            mapel: jadwalPelajaran.mapel?.nama,
            guru: jadwalPelajaran.guru?.fullName,
            hari: jadwalPelajaran.hari,
            slotWaktu: jadwalPelajaran.slotWaktu?.namaSlot
        },
        siswaDenganAbsensi: responseData
    });
  } catch (error) {
    console.error("Error fetching absensi data:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
