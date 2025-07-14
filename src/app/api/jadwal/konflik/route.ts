
import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { getInitializedDataSource } from "@/lib/data-source";
import { JadwalPelajaranEntity } from "@/entities/jadwal-pelajaran.entity";
import { getAuthenticatedUser } from "@/lib/auth-utils-node";

export async function GET(request: NextRequest) {
  const authenticatedUser = getAuthenticatedUser(request);
  if (!authenticatedUser || !['admin', 'superadmin'].includes(authenticatedUser.role)) {
    return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  }

  try {
    const dataSource = await getInitializedDataSource();
    const jadwalRepo = dataSource.getRepository(JadwalPelajaranEntity);

    const semuaJadwal = await jadwalRepo.find({
        relations: ["guru", "ruangan", "slotWaktu", "mapel"],
        order: { hari: "ASC", "slotWaktu.waktuMulai": "ASC" }
    });

    const conflicts: { guru: string[], ruangan: string[] } = {
        guru: [],
        ruangan: [],
    };
    
    // Key: "hari-slotWaktuId", Value: JadwalPelajaranEntity[]
    const jadwalBySlot = new Map<string, JadwalPelajaranEntity[]>();

    semuaJadwal.forEach(jadwal => {
        const key = `${jadwal.hari}-${jadwal.slotWaktuId}`;
        if (!jadwalBySlot.has(key)) {
            jadwalBySlot.set(key, []);
        }
        jadwalBySlot.get(key)!.push(jadwal);
    });

    for (const [key, jadwalGroup] of jadwalBySlot.entries()) {
        if (jadwalGroup.length < 2) continue; // No possible conflict if only one entry

        // Cek konflik guru
        const guruMap = new Map<string, JadwalPelajaranEntity[]>();
        jadwalGroup.forEach(j => {
            if (!guruMap.has(j.guruId)) guruMap.set(j.guruId, []);
            guruMap.get(j.guruId)!.push(j);
        });
        
        for (const [guruId, guruJadwals] of guruMap.entries()) {
            if (guruJadwals.length > 1) {
                const guruNama = guruJadwals[0].guru.fullName || guruJadwals[0].guru.name;
                const hari = guruJadwals[0].hari;
                const slot = guruJadwals[0].slotWaktu.namaSlot;
                const kelasTerlibat = guruJadwals.map(j => j.kelas).join(', ');
                conflicts.guru.push(`Guru ${guruNama} memiliki jadwal bentrok pada hari ${hari}, ${slot}, di kelas: ${kelasTerlibat}.`);
            }
        }
        
        // Cek konflik ruangan
        const ruanganMap = new Map<string, JadwalPelajaranEntity[]>();
        jadwalGroup.forEach(j => {
            if (!ruanganMap.has(j.ruanganId)) ruanganMap.set(j.ruanganId, []);
            ruanganMap.get(j.ruanganId)!.push(j);
        });
        
        for (const [ruanganId, ruanganJadwals] of ruanganMap.entries()) {
            if (ruanganJadwals.length > 1) {
                const ruanganNama = ruanganJadwals[0].ruangan.nama;
                const hari = ruanganJadwals[0].hari;
                const slot = ruanganJadwals[0].slotWaktu.namaSlot;
                const kelasTerlibat = ruanganJadwals.map(j => j.kelas).join(', ');
                conflicts.ruangan.push(`Ruangan ${ruanganNama} digunakan bersamaan pada hari ${hari}, ${slot}, oleh kelas: ${kelasTerlibat}.`);
            }
        }
    }

    return NextResponse.json(conflicts);

  } catch (error: any) {
    console.error("Error detecting schedule conflicts:", error);
    return NextResponse.json({ message: "Terjadi kesalahan saat memeriksa konflik.", error: error.message }, { status: 500 });
  }
}
