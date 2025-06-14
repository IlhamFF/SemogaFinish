
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { BookOpenCheck } from "lucide-react";

export default function AdminKurikulumPage() {
  const { user } = useAuth();

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi admin untuk melihat halaman ini.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-semibold">Manajemen Kurikulum</h1>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpenCheck className="mr-2 h-6 w-6 text-primary" />
            Pengembangan Kurikulum
          </CardTitle>
          <CardDescription>
            Area ini akan digunakan untuk membuat, melihat, dan mengelola kurikulum sekolah.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center text-muted-foreground bg-muted/30 rounded-md">
            <p className="mb-2">Fitur manajemen kurikulum sedang dalam pengembangan.</p>
            <p>Di sini Anda akan dapat:</p>
            <ul className="list-disc list-inside text-left max-w-md mx-auto mt-2">
              <li>Menentukan mata pelajaran</li>
              <li>Mengatur standar kompetensi</li>
              <li>Menyusun silabus</li>
              <li>Dan lainnya terkait struktur pembelajaran</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
