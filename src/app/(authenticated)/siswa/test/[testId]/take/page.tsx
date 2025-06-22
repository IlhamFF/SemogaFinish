
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Clock, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Test as TestType, TestSubmission } from "@/types";
import { format, parseISO, differenceInSeconds, intervalToDuration } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function SiswaTakeTestPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const testId = params.testId as string;

  const [testDetails, setTestDetails] = useState<TestType | null>(null);
  const [submission, setSubmission] = useState<TestSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTestFinished, setIsTestFinished] = useState(false);

  const fetchTestDetailsAndStart = useCallback(async () => {
    if (!testId || !user) return;
    setIsLoading(true);
    setError(null);
    try {
      const testRes = await fetch(`/api/test/${testId}`);
      if (!testRes.ok) {
        const errorData = await testRes.json();
        throw new Error(errorData.message || "Gagal mengambil detail test.");
      }
      const testData: TestType = await testRes.json();
      setTestDetails(testData);

      const submissionsRes = await fetch(`/api/test/submissions/me?testId=${testId}`);
      if (submissionsRes.ok) {
          const pastSubmissions: TestSubmission[] = await submissionsRes.json();
          const existingSubmission = pastSubmissions.find(s => s.testId === testId && (s.status === "Selesai" || s.status === "Dinilai"));
          if (existingSubmission) {
              setIsTestFinished(true);
              setSubmission(existingSubmission);
              setError("Anda sudah menyelesaikan test ini.");
              setIsLoading(false);
              return;
          }
      }

      const startRes = await fetch(`/api/test/${testId}/start`, { method: 'POST' });
      if (!startRes.ok) {
        const errorData = await startRes.json();
        throw new Error(errorData.message || "Gagal memulai test.");
      }
      const submissionData: TestSubmission = await startRes.json();
      setSubmission(submissionData);

      if (testData.durasi && submissionData.waktuMulai) {
        const endTime = new Date(parseISO(submissionData.waktuMulai)).getTime() + testData.durasi * 60 * 1000;
        const now = new Date().getTime();
        setTimeLeft(Math.max(0, Math.floor((endTime - now) / 1000)));
      }

    } catch (err: any) {
      setError(err.message);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [testId, user, toast]);

  useEffect(() => {
    fetchTestDetailsAndStart();
  }, [fetchTestDetailsAndStart]);

  const handleFinishTest = useCallback(async (autoSubmit = false) => {
    if (!submission || !submission.id || isTestFinished) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/test/submissions/${submission.id}/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jawabanSiswa: {} }), // Kirim objek jawaban kosong
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menyelesaikan test.");
      }
      toast({ title: "Test Selesai", description: autoSubmit ? "Waktu habis! Test telah diselesaikan secara otomatis." : "Test telah berhasil diselesaikan." });
      setIsTestFinished(true);
    } catch (err: any) {
      toast({ title: "Error Menyelesaikan Test", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }, [submission, isTestFinished, toast]);

  useEffect(() => {
    if (timeLeft === 0 && !isTestFinished && submission) {
        handleFinishTest(true);
    }
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime !== null && prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isTestFinished, submission, handleFinishTest]);


  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return "00:00:00";
    const duration = intervalToDuration({ start: 0, end: seconds * 1000 });
    return `${String(duration.hours || 0).padStart(2, '0')}:${String(duration.minutes || 0).padStart(2, '0')}:${String(duration.seconds || 0).padStart(2, '0')}`;
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /> <p className="ml-3">Memuat Test...</p></div>;
  }

  if (error && !testDetails) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <Card className="w-full max-w-md shadow-lg">
              <CardHeader><CardTitle className="text-2xl text-destructive flex items-center justify-center"><AlertTriangle className="mr-2"/> Terjadi Kesalahan</CardTitle></CardHeader>
              <CardContent>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button onClick={() => router.push('/siswa/test')}>Kembali ke Daftar Test</Button>
              </CardContent>
          </Card>
      </div>
    );
  }
  
  if (!testDetails || !submission) {
      return <div className="flex h-full items-center justify-center"><p className="text-muted-foreground">Test tidak ditemukan atau gagal memulai sesi.</p></div>;
  }
  
  const isTimeUp = timeLeft !== null && timeLeft <= 0;

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 max-w-4xl">
      <Card className="shadow-xl">
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start">
            <div>
              <CardTitle className="text-2xl md:text-3xl font-headline text-primary">{testDetails.judul}</CardTitle>
              <CardDescription className="mt-1">
                Mapel: {testDetails.mapel} | Tipe: {testDetails.tipe} | Durasi: {testDetails.durasi} Menit
              </CardDescription>
            </div>
            <div className={`text-lg font-semibold p-2 rounded-md mt-2 sm:mt-0 ${isTimeUp && !isTestFinished ? 'text-red-500 bg-red-100 animate-pulse' : 'text-primary bg-primary/10'}`}>
              <Clock className="inline-block mr-2 h-5 w-5" /> Sisa Waktu: {formatTime(timeLeft)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="py-6 min-h-[300px] flex flex-col justify-center">
          {isTestFinished ? (
            <div className="text-center py-10">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Test Telah Selesai</h2>
              <p className="text-muted-foreground mb-6">
                {submission?.status === "Dinilai" ? `Nilai Anda: ${submission.nilai}/100.` : "Jawaban Anda telah dikirim. Mohon tunggu hasilnya."}
              </p>
              <Button onClick={() => router.push('/siswa/test')}>Kembali ke Daftar Test</Button>
            </div>
          ) : error ? (
             <div className="text-center py-10">
                <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
                <h2 className="text-2xl font-semibold mb-2 text-destructive">Test Tidak Dapat Dilanjutkan</h2>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Button onClick={() => router.push('/siswa/test')}>Kembali ke Daftar Test</Button>
            </div>
          ) : (
            <div className="text-center p-6 bg-muted/50 rounded-lg">
                <Info className="mx-auto h-12 w-12 text-blue-500 mb-4"/>
                <h2 className="text-xl font-semibold mb-2">Pengerjaan Soal Belum Diimplementasikan</h2>
                <p className="text-muted-foreground mb-4">
                    Fitur untuk menampilkan dan menjawab soal sedang dalam pengembangan.
                    Saat ini, Anda hanya dapat memulai dan menyelesaikan sesi test untuk mencatat waktu pengerjaan Anda.
                </p>
                <p className="text-sm">Silakan klik tombol di bawah ini jika Anda sudah siap menyelesaikan sesi ini.</p>
            </div>
          )}
        </CardContent>
        {!isTestFinished && !error && (
          <CardFooter className="border-t pt-6">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button 
                        className="w-full md:w-auto ml-auto" 
                        disabled={isSubmitting || isTestFinished || (isTimeUp && !submission) }
                    >
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isTimeUp ? "Waktu Habis - Kirim Jawaban" : "Selesaikan Test & Kirim Jawaban"}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Konfirmasi Selesaikan Test</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin menyelesaikan test ini? Jawaban kosong akan dikirimkan.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleFinishTest(false)} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Ya, Selesaikan
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

    