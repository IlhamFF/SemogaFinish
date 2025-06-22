
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { BarChart as BarChartIcon } from "lucide-react"; 

export default function DataVisualizationPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Pusat Laporan & Visualisasi</h1>
      <p className="text-muted-foreground">
        Halaman ini berfungsi sebagai pusat untuk laporan umum dan analitik tingkat lanjut. 
        Visualisasi data kunci yang relevan dengan peran Anda telah dipindahkan ke dasbor masing-masing untuk akses yang lebih cepat.
      </p>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><BarChartIcon className="mr-2 h-5 w-5 text-primary" />Laporan Lanjutan</CardTitle>
          <CardDescription>Area ini dicadangkan untuk laporan kustom dan analitik mendalam yang akan dikembangkan di masa mendatang.</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center bg-muted/50 rounded-md">
            <p className="text-muted-foreground">Laporan kustom akan tersedia di sini.</p>
        </CardContent>
      </Card>
    </div>
  );
}

    