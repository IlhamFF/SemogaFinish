
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Clock, AlertTriangle, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Test as TestType, TestSubmission, Soal } from "@/types";
import { format, parseISO, differenceInSeconds, intervalToDuration } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';


type Answers = Record<string, string>;

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

  // State for test taking UI
  const [questions, setQuestions] = useState<Soal[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const fetchTestDetailsAndStart = useCallback(async () => {
    if (!testId || !user) return;
    setIsLoading(true);
    setError(null);
    try {
      const testRes = await fetch(`/api/test/${testId}`);
      if (!testRes.ok) throw new Error((await testRes.json()).message || "Gagal mengambil detail test.");
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
      if (!startRes.ok) throw new Error((await startRes.json()).message || "Gagal memulai test.");
      const submissionData: TestSubmission = await startRes.json();
      setSubmission(submissionData);

      if (testData.durasi && submissionData.waktuMulai) {
        const endTime = new Date(parseISO(submissionData.waktuMulai)).getTime() + testData.durasi * 60 * 1000;
        const now = new Date().getTime();
        setTimeLeft(Math.max(0, Math.floor((endTime - now) / 1000)));
      }

      // Fetch questions for the test
      const soalRes = await fetch(`/api/test/${testId}/soal`);
      if(!soalRes.ok) throw new Error("Gagal memuat soal ujian.");
      const soalData: Soal[] = await soalRes.json();
      setQuestions(soalData);
      if (soalData.length === 0) {
        setError("Test ini belum memiliki soal. Hubungi guru Anda.");
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
        body: JSON.stringify({ jawabanSiswa: answers }), 
      });
      if (!response.ok) throw new Error((await response.json()).message || "Gagal menyelesaikan test.");
      toast({ title: "Test Selesai", description: autoSubmit ? "Waktu habis! Test telah diselesaikan secara otomatis." : "Test telah berhasil diselesaikan." });
      setIsTestFinished(true);
    } catch (err: any) {
      toast({ title: "Error Menyelesaikan Test", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }, [submission, isTestFinished, toast, answers]);

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

  const handleAnswerChange = (questionId: string, answerValue: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerValue }));
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /> <p className="ml-3">Memuat Test...</p></div>;
  }

  if (error && !isTestFinished) {
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
  
  if (!testDetails || !submission || questions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <Card className="w-full max-w-md shadow-lg">
              <CardHeader><CardTitle className="text-2xl text-destructive flex items-center justify-center"><AlertTriangle className="mr-2"/> Terjadi Kesalahan</CardTitle></CardHeader>
              <CardContent>
                  <p className="text-muted-foreground mb-4">{error || "Test tidak dapat dimuat atau tidak memiliki soal."}</p>
                  <Button onClick={() => router.push('/siswa/test')}>Kembali ke Daftar Test</Button>
              </CardContent>
          </Card>
      </div>
      );
  }
  
  const isTimeUp = timeLeft !== null && timeLeft <= 0;
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 max-w-4xl">
      <Card className="shadow-xl">
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start">
            <div>
              <CardTitle className="text-2xl md:text-3xl font-headline text-primary">{testDetails.judul}</CardTitle>
              <CardDescription className="mt-1">
                Mapel: {testDetails.mapel} | Tipe: {testDetails.tipe} | Soal: {questions.length}
              </CardDescription>
            </div>
            <div className={`text-lg font-semibold p-2 rounded-md mt-2 sm:mt-0 ${isTimeUp && !isTestFinished ? 'text-red-500 bg-red-100 animate-pulse' : 'text-primary bg-primary/10'}`}>
              <Clock className="inline-block mr-2 h-5 w-5" /> Sisa Waktu: {formatTime(timeLeft)}
            </div>
          </div>
        </CardHeader>

        <CardContent className="py-6 min-h-[350px] flex flex-col">
          {isTestFinished ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center py-10">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Test Telah Selesai</h2>
              <p className="text-muted-foreground mb-6">
                {submission?.status === "Dinilai" ? `Nilai Anda: ${submission.nilai}/100.` : "Jawaban Anda telah dikirim. Mohon tunggu hasilnya."}
              </p>
              <Button onClick={() => router.push('/siswa/test')}>Kembali ke Daftar Test</Button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <Progress value={(currentQuestionIndex + 1) / questions.length * 100} className="w-full" />
                <p className="text-sm text-center text-muted-foreground mt-2">Soal {currentQuestionIndex + 1} dari {questions.length}</p>
              </div>
              <div className="flex-grow">
                <p className="font-medium mb-4 leading-relaxed text-lg">{currentQuestion.pertanyaan}</p>
                
                {currentQuestion.tipeSoal === 'Pilihan Ganda' && (
                    <RadioGroup 
                        value={answers[currentQuestion.id] || ""}
                        onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                        className="space-y-3"
                    >
                    {(currentQuestion.pilihanJawaban || []).map((option) => (
                        <Label key={option.id} className="flex items-center space-x-3 p-3 border rounded-md has-[:checked]:bg-primary/10 has-[:checked]:border-primary cursor-pointer">
                        <RadioGroupItem value={option.id} id={`${currentQuestion.id}-${option.id}`} />
                        <span>{option.text}</span>
                        </Label>
                    ))}
                    </RadioGroup>
                )}

                {currentQuestion.tipeSoal === 'Esai' && (
                    <Textarea 
                        rows={8}
                        placeholder="Tulis jawaban Anda di sini..."
                        value={answers[currentQuestion.id] || ""}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    />
                )}
              </div>
            </>
          )}
        </CardContent>

        {!isTestFinished && (
          <CardFooter className="border-t pt-4 flex justify-between items-center">
            <Button variant="outline" onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))} disabled={currentQuestionIndex === 0}>
                <ArrowLeft className="mr-2 h-4 w-4"/> Sebelumnya
            </Button>
            
            {currentQuestionIndex < questions.length - 1 ? (
                <Button onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}>
                    Berikutnya <ArrowRight className="ml-2 h-4 w-4"/>
                </Button>
            ) : (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button 
                            className="bg-green-600 hover:bg-green-700" 
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4"/>}
                            Selesaikan Test
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Konfirmasi Selesaikan Test</AlertDialogTitle>
                            <AlertDialogDescription>
                                Apakah Anda yakin ingin menyelesaikan test ini? Anda tidak akan dapat mengubah jawaban Anda lagi.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleFinishTest(false)} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Ya, Selesaikan
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
