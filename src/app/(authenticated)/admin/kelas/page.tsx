
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from "@/hooks/use-auth";
import type { User } from "@/types";
import { Loader2, BookCopy, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import { id as localeID } from 'date-fns/locale';

type GroupedStudents = Record<string, User[]>;

export default function AdminKelasPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [groupedStudents, setGroupedStudents] = useState<GroupedStudents>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchGroupedStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users/by-class');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengambil data kelas.");
      }
      const data: GroupedStudents = await response.json();
      setGroupedStudents(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      fetchGroupedStudents();
    }
  }, [user, fetchGroupedStudents]);

  const sortedClasses = useMemo(() => {
    return Object.keys(groupedStudents).sort();
  }, [groupedStudents]);

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return <p>Akses Ditolak. Anda harus menjadi admin untuk melihat halaman ini.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Manajemen Kelas</h1>
      <p className="text-muted-foreground">Lihat daftar kelas dan siswa yang terdaftar di dalamnya.</p>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><BookCopy className="mr-2 h-6 w-6 text-primary" />Daftar Kelas</CardTitle>
          <CardDescription>Buka setiap item untuk melihat daftar siswa. Total: {sortedClasses.length} kelas.</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedClasses.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {sortedClasses.map((kelas) => (
                <AccordionItem value={kelas} key={kelas}>
                  <AccordionTrigger className="text-lg font-medium hover:no-underline">
                    <div className="flex items-center gap-3">
                        <span className="text-primary">{kelas}</span>
                        <span className="flex items-center text-sm font-normal text-muted-foreground">
                            <Users className="mr-1.5 h-4 w-4" />
                            {groupedStudents[kelas].length} Siswa
                        </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama Lengkap</TableHead>
                          <TableHead>NIS</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Bergabung</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupedStudents[kelas].map((siswa) => (
                          <TableRow key={siswa.id}>
                            <TableCell className="font-medium">{siswa.fullName}</TableCell>
                            <TableCell>{siswa.nis || '-'}</TableCell>
                            <TableCell>{siswa.email}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {siswa.joinDate ? format(parseISO(siswa.joinDate), 'dd MMM yyyy', { locale: localeID }) : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-center text-muted-foreground py-8">Tidak ada data siswa atau kelas yang ditemukan.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
