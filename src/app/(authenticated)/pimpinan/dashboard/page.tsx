
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, BookOpenCheck, BarChartHorizontalBig, Star, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { MOCK_SUBJECTS, SCHOOL_GRADE_LEVELS, SCHOOL_MAJORS, SCHOOL_CLASSES_PER_MAJOR_GRADE } from "@/lib/constants";
import React, { useMemo } from "react";

interface StudentMockGrade {
  studentId: string;
  studentName: string;
  studentClass: string;
  grades: { subject: string; score: number }[];
  average: number;
}

const generateMockStudentGrades = (allAppUsers: ReturnType<typeof useAuth>['users']): StudentMockGrade[] => {
  const siswaUsers = allAppUsers.filter(u => u.role === 'siswa' && u.isVerified && u.kelas);
  
  return siswaUsers.map(siswa => {
    const studentSubjects = MOCK_SUBJECTS.slice(0, Math.floor(Math.random() * 5) + 8); // 8 to 12 subjects
    const grades = studentSubjects.map(subject => ({
      subject,
      score: Math.floor(Math.random() * 41) + 60, // Score between 60 and 100
    }));
    const average = grades.reduce((sum, g) => sum + g.score, 0) / grades.length;
    return {
      studentId: siswa.id,
      studentName: siswa.fullName || siswa.name || siswa.email,
      studentClass: siswa.kelas!,
      grades,
      average: parseFloat(average.toFixed(2)),
    };
  });
};


export default function PimpinanDashboardPage() {
  const { user, users: allAppUsers } = useAuth();

  const mockStudentGradesData: StudentMockGrade[] = useMemo(() => {
      if(allAppUsers.length > 0) {
          return generateMockStudentGrades(allAppUsers);
      }
      return [];
  }, [allAppUsers]);

  const classAverages = useMemo(() => {
    if (mockStudentGradesData.length === 0) return [];
    const classData: { [key: string]: { totalScore: number; count: number } } = {};
    mockStudentGradesData.forEach(student => {
      if (!classData[student.studentClass]) {
        classData[student.studentClass] = { totalScore: 0, count: 0 };
      }
      classData[student.studentClass].totalScore += student.average;
      classData[student.studentClass].count++;
    });
    return Object.entries(classData)
      .map(([className, data]) => ({
        name: className,
        rataRata: parseFloat((data.totalScore / data.count).toFixed(2)),
      }))
      .sort((a, b) => b.rataRata - a.rataRata); // Sort by average desc
  }, [mockStudentGradesData]);
  
  const chartConfigClassAvg = {
    rataRata: {
      label: "Rata-rata Nilai",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  const overallRankedStudents = useMemo(() => 
    [...mockStudentGradesData].sort((a, b) => b.average - a.average)
  , [mockStudentGradesData]);

  const getClassRankings = (className: string) => {
    return mockStudentGradesData
      .filter(s => s.studentClass === className)
      .sort((a, b) => b.average - a.average);
  };

  // Pick some example classes for detailed ranking display
  const exampleClassesForRanking = useMemo(() => {
    const allClasses = [...new Set(mockStudentGradesData.map(s => s.studentClass))];
    return allClasses.slice(0, 2); // Show rankings for first 2 classes
  }, [mockStudentGradesData]);


  const pimpinanStats = useMemo(() => {
    const totalSiswa = allAppUsers.filter(u => u.role === 'siswa').length;
    const totalGuru = allAppUsers.filter(u => u.role === 'guru').length;
    const totalKelas = new Set(allAppUsers.filter(u => u.role === 'siswa' && u.kelas).map(u => u.kelas)).size;
    
    return [
      { title: "Total Siswa", value: totalSiswa.toString(), icon: Users, color: "text-primary", change: `SMA Az-Bail` },
      { title: "Total Guru", value: totalGuru.toString(), icon: Users, color: "text-green-500", change: "Tenaga Pengajar" },
      { title: "Jumlah Kelas", value: totalKelas.toString(), icon: BookOpenCheck, color: "text-yellow-500", change: "IPA & IPS" },
      { title: "Tingkat Kelulusan (Simulasi)", value: "95%", icon: CheckCircle, color: "text-indigo-500", change: "Target: 90%" },
    ];
  }, [allAppUsers]);


  if (!user || (user.role !== 'pimpinan' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi Pimpinan untuk melihat halaman ini.</p>;
  }
  
  if (mockStudentGradesData.length === 0 && allAppUsers.length > 0) {
    // Still waiting for mockStudentGradesData to be populated if allAppUsers exists
    return <p>Memuat data siswa...</p>;
  }


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Dasbor Pimpinan SMA Az-Bail</h1>
      <p className="text-muted-foreground">Selamat datang, {user.fullName || user.name || user.email}! Gambaran umum kinerja institusi dan metrik utama.</p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {pimpinanStats.map((card) => (
          <Card key={card.title} className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChartHorizontalBig className="mr-2 h-5 w-5 text-primary" />
              Rata-rata Nilai per Kelas
            </CardTitle>
            <CardDescription>Visualisasi dan tabel rata-rata nilai akhir siswa per kelas.</CardDescription>
          </CardHeader>
          <CardContent>
            {classAverages.length > 0 ? (
              <>
                <div className="h-[300px] mb-6">
                  <ChartContainer config={chartConfigClassAvg} className="w-full h-full">
                    <BarChart data={classAverages} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                       <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--foreground))" fontSize={12} />
                      <YAxis dataKey="name" type="category" stroke="hsl(var(--foreground))" fontSize={10} width={80} interval={0} />
                      <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'hsl(var(--muted))' }}/>
                      <Legend />
                      <Bar dataKey="rataRata" fill="var(--color-rataRata)" radius={[0, 4, 4, 0]} barSize={15} />
                    </BarChart>
                  </ChartContainer>
                </div>
                <div className="max-h-[200px] overflow-y-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Kelas</TableHead>
                            <TableHead className="text-right">Rata-rata Nilai</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {classAverages.map((item) => (
                            <TableRow key={item.name}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-right font-semibold">{item.rataRata.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-4">Data rata-rata kelas belum tersedia.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="mr-2 h-5 w-5 text-yellow-500" />
              Peringkat Siswa Terbaik (Keseluruhan)
            </CardTitle>
            <CardDescription>10 siswa dengan rata-rata nilai tertinggi di seluruh sekolah.</CardDescription>
          </CardHeader>
          <CardContent>
            {overallRankedStudents.length > 0 ? (
              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Rank</TableHead>
                      <TableHead>Nama Siswa</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead className="text-right">Rata-rata</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overallRankedStudents.slice(0, 10).map((student, index) => (
                      <TableRow key={student.studentId}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{student.studentName}</TableCell>
                        <TableCell>{student.studentClass}</TableCell>
                        <TableCell className="text-right font-semibold">{student.average.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Data peringkat siswa belum tersedia.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {exampleClassesForRanking.map(className => (
        <Card key={className} className="shadow-lg">
          <CardHeader>
            <CardTitle>Peringkat Siswa Kelas: {className}</CardTitle>
            <CardDescription>Siswa dengan rata-rata nilai tertinggi di kelas {className}.</CardDescription>
          </CardHeader>
          <CardContent>
            {getClassRankings(className).length > 0 ? (
                 <div className="max-h-[300px] overflow-y-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">Rank</TableHead>
                            <TableHead>Nama Siswa</TableHead>
                            <TableHead className="text-right">Rata-rata</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {getClassRankings(className).slice(0, 10).map((student, index) => (
                            <TableRow key={student.studentId}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>{student.studentName}</TableCell>
                            <TableCell className="text-right font-semibold">{student.average.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Data peringkat untuk kelas {className} belum tersedia.</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

