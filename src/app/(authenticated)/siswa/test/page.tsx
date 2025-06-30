
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { FileText, PlayCircle, ListChecks, CheckCircle, AlertCircle, Clock, Loader2, Award } from "lucide-react";
import { format, parseISO } from "date-fns";
import { id as localeID } from 'date-fns/locale';
import type { Test as TestType, TestStatus, TestSubmission } from "@/types"; 
import { useToast } from "@/hooks/use-toast";

interface TestDisplay extends TestType {
  submission?: TestSubmission;
}

export default function SiswaTestPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"mendatang" | "riwayat">("mendatang");
  const [testList, setTestList] = useState<TestDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTestsAndSubmissions = useCallback(async () => {
    if (!user || !user.isVerified || !user.kelasId) {
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    try {
        const [testsRes, subsRes] = await Promise.all([
            fetch('/api/test'),
            fetch('/api/test/submissions/me')
        ]);
        if (!testsRes.ok) throw new Error("Gagal mengambil daftar test.");
        if (!subsRes.ok) throw new Error("Gagal mengambil data pengerjaan test.");
        
        const testsData: TestType[] = await testsRes.json();
        const subsData: TestSubmission[] = await subsRes.json();
        const subsMap = new Map(subsData.map(sub => [sub.testId, sub]));

        const displayList: TestDisplay[] = testsData.map(test => ({
            ...test,
            submission: subsMap.get(test.id),
        }));

        setTestList(displayList);
    } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        setTestList([]);
    } finally {
        setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user && user.isVerified) {
        fetchTestsAndSubmissions();
    } else if (user && !user.isVerified) {
        setIsLoading(false);
    }
  }, [user, fetchTestsAndSubmissions]);


  if (!user || (user.role !== 'siswa' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Siswa untuk melihat halaman ini.</p>;
  }
  if (user && !user.isVerified) {
    return <p>Silakan verifikasi email Anda untuk mengakses fitur ini.</p>;
  }

  const handlePlaceholderAction = (action: string, testId?: string) => {
    toast({title:"Fitur Belum Tersedia", description:`Fungsi "${action}" ${testId ? `untuk test ${testId} ` : ''}belum diimplementasikan.`});
  };

  const testMendatang = useMemo(() => testList.filter(t => (t.status === "Terjadwal" || t.status === "Berlangsung") && t.submission?.status !== "Selesai" && t.submission?.status !== "Dinilai"), [testList]);
  const testRiwayat = useMemo(() => testList.filter(t => t.status === "Selesai" || t.status === "Dinilai" || t.submission?.status === "Selesai" || t.submission?.status === "Dinilai"), [testList]);

  const getStatusBadgeVariant = (status: TestStatus, submissionStatus?: TestSubmission["status"]): "default" | "secondary" | "destructive" | "outline" => {
    if (submissionStatus === "Dinilai") return "default";
    if (submissionStatus === "Selesai") return "secondary";
    if (status === "Berlangsung") return "secondary";
    if (status === "Terjadwal") return "outline";
    return "outline";
  };

  const getStatusText = (status: TestStatus, submissionStatus?: TestSubmission["status"]): string => {
    if (submissionStatus === "Dinilai") return "Sudah Dinilai";
    if (submissionStatus === "Selesai") return "Telah Dikerjakan";
    return status;
  };

  const getStatusIcon = (status: TestStatus, submissionStatus?: TestSubmission["status"]) => {
    if (submissionStatus === "Dinilai") return <Award className="h-4 w-4 text-primary" />;
    if (submissionStatus === "Selesai") return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === "Berlangsung") return <PlayCircle className="h-4 w-4 text-blue-500 animate-pulse" />;
    if (status === "Terjadwal") return <Clock className="h-4 w-4 text-gray-500" />;
    return <ListChecks className="h-4 w-4" />;
  };

  const renderTestList = (listTests: TestDisplay[]) => (
    isLoading ? (
        <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    ) : listTests.length > 0 ? (
      <ul className="space-y-4">
        {listTests.map(test => {
          const now = new Date();
          const startTime = parseISO(test.tanggal);
          const endTime = new Date(startTime.getTime() + test.durasi * 60 * 1000);
          const isTakable = (test.status === "Berlangsung" || test.status === "Terjadwal") && now >= startTime && now <= endTime && !test.submission;

          const currentStatus = getStatusText(test.status, test.submission?.status);

          return (
          <li key={test.id}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <CardTitle className="text-lg text-primary">{test.judul} <span className="text-sm font-normal text-muted-foreground">({test.tipe})</span></CardTitle>
                        <CardDescription>{test.mapel} - oleh {test.uploader?.fullName || test.uploader?.name || "Guru"}</CardDescription>
                    </div>
                     <Badge variant={getStatusBadgeVariant(test.status, test.submission?.status)} className="mt-2 sm:mt-0 flex items-center gap-1">
                        {getStatusIcon(test.status, test.submission?.status)} {currentStatus}
                    </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                    <div>
                        <p className="font-semibold">Tanggal:</p>
                        <p className="text-muted-foreground">{format(parseISO(test.tanggal), "dd MMM yyyy, HH:mm", { locale: localeID })}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Durasi:</p>
                        <p className="text-muted-foreground">{test.durasi} Menit</p>
                    </div>
                    <div>
                        <p className="font-semibold">Jumlah Soal:</p>
                        <p className="text-muted-foreground">{test.soalCount ?? '-'}</p>
                    </div>
                     {test.submission?.status === "Dinilai" && (
                        <div>
                            <p className="font-semibold">Nilai Anda:</p>
                            <p className="text-primary font-bold">{test.submission.nilai}/100</p>
                        </div>
                    )}
                </div>
                
                {isTakable ? (
                  <Button asChild className="w-full sm:w-auto">
                    <Link href={`/siswa/test/${test.id}/take`}>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      {test.status === "Berlangsung" ? "Lanjutkan Test" : "Mulai Test"}
                    </Link>
                  </Button>
                ) : test.status === "Terjadwal" && now < startTime && !test.submission ? (
                  <p className="text-sm text-muted-foreground">Test akan tersedia pada waktunya.</p>
                ) : test.submission?.status === "Dinilai" ? (
                  <p className="text-sm text-green-600 font-semibold">Lihat detail nilai di halaman Nilai & Rapor.</p>
                ) : test.submission?.status === "Selesai" ? (
                   <p className="text-sm text-yellow-600">Hasil sedang diproses atau menunggu penilaian.</p>
                ) : test.status !== "Draf" && now > endTime && !test.submission ? (
                  <p className="text-sm text-destructive">Waktu test telah berakhir.</p>
                ) : null}
              </CardContent>
            </Card>
          </li>
        )})}
      </ul>
    ) : (
      <div className="text-center py-10 text-muted-foreground">
        <FileText className="mx-auto h-12 w-12" />
        <p className="mt-2">Tidak ada test/ujian dalam kategori ini.</p>
      </div>
    )
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold flex items-center">
        <FileText className="mr-3 h-8 w-8 text-primary" />
        Test & Ujian Saya
      </h1>
      <p className="text-muted-foreground">Lihat jadwal test/ujian, kerjakan, dan lihat hasilnya. Kelas: {user?.kelasId || "Tidak ada"}</p>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "mendatang" | "riwayat")}>
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="mendatang">Test Mendatang ({testMendatang.length})</TabsTrigger>
          <TabsTrigger value="riwayat">Riwayat Test ({testRiwayat.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="mendatang">
          <Card className="shadow-lg mt-4">
            <CardHeader>
              <CardTitle>Jadwal Test & Ujian</CardTitle>
              <CardDescription>Daftar test/ujian yang akan datang atau sedang berlangsung.</CardDescription>
            </CardHeader>
            <CardContent>
              {renderTestList(testMendatang)}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="riwayat">
          <Card className="shadow-lg mt-4">
            <CardHeader>
              <CardTitle>Riwayat Test & Ujian</CardTitle>
              <CardDescription>Daftar test/ujian yang telah selesai atau dinilai.</CardDescription>
            </CardHeader>
            <CardContent>
              {renderTestList(testRiwayat)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
