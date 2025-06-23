import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { AbsensiSiswaEntity } from "@/entities/absensi-siswa.entity";
import { UserEntity } from "@/entities/user.entity";
import * as z from "zod";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";
import { FindOptionsWhere, In, Between, Raw } from "typeorm";
import { startOfMonth, endOfMonth, format } from 'date-fns';

const rekapQuerySchema = z.object({
  kelasId: z.string().min(1, "ID Kelas wajib diisi."),
  bulan: z.coerce.number().min(1).max(12),
  tahun: z.coerce.number().min(2000).max(new Date().getFullYear() + 5),
});

export async function GET(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser || !['guru', 'admin', 'superadmin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const queryValidation = rekapQuerySchema.safeParse({
    kelasId: searchParams.get("kelasId"),
    bulan: searchParams.get("bulan"),
    tahun: searchParams.get("tahun"),
  });

  if (!queryValidation.success) {
    return NextResponse.json({ message: "Parameter query tidak valid.", errors: queryValidation.error.flatten().fieldErrors }, { status: 400 });
  }
  const { kelasId, bulan, tahun } = queryValidation.data;

  try {
    const dataSource = await getInitializedDataSource();
    const userRepo = dataSource.getRepository(UserEntity);
    const absensiRepo = dataSource.getRepository(AbsensiSiswaEntity);
    
    const siswaDiKelas = await userRepo.find({
        where: { kelasId, role: 'siswa' },
        select: ['id', 'fullName', 'name', 'nis'],
    });

    if (siswaDiKelas.length === 0) {
        return NextResponse.json([]);
    }

    const startDate = format(startOfMonth(new Date(tahun, bulan - 1)), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(new Date(tahun, bulan - 1)), 'yyyy-MM-dd');

    const rekapData = await absensiRepo
      .createQueryBuilder("absensi")
      .select("absensi.siswaId", "siswaId")
      .addSelect("user.fullName", "nama")
      .addSelect("user.nis", "nis")
      .addSelect("COUNT(CASE WHEN absensi.statusKehadiran = 'Hadir' THEN 1 END)", "hadir")
      .addSelect("COUNT(CASE WHEN absensi.statusKehadiran = 'Izin' THEN 1 END)", "izin")
      .addSelect("COUNT(CASE WHEN absensi.statusKehadiran = 'Sakit' THEN 1 END)", "sakit")
      .addSelect("COUNT(CASE WHEN absensi.statusKehadiran = 'Alpha' THEN 1 END)", "alpha")
      .leftJoin(UserEntity, "user", "user.id = absensi.siswaId")
      .where("user.kelasId = :kelasId", { kelasId })
      .andWhere("absensi.tanggalAbsensi BETWEEN :startDate AND :endDate", { startDate, endDate })
      .groupBy("absensi.siswaId, user.fullName, user.nis")
      .getRawMany();

    const rekapMap = new Map(rekapData.map(item => [item.siswaId, item]));

    const fullRekap = siswaDiKelas.map(siswa => {
      const data = rekapMap.get(siswa.id);
      return {
        id: siswa.id,
        nama: siswa.fullName || siswa.name,
        nis: siswa.nis,
        hadir: data ? parseInt(data.hadir, 10) : 0,
        izin: data ? parseInt(data.izin, 10) : 0,
        sakit: data ? parseInt(data.sakit, 10) : 0,
        alpha: data ? parseInt(data.alpha, 10) : 0,
      };
    });

    return NextResponse.json(fullRekap);
  } catch (error: any) {
    console.error("Error fetching rekap absensi:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal server.", details: error.message }, { status: 500 });
  }
}
