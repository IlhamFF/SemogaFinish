# Kumpulan Snippet Kode untuk Fitur Umum

Dokumen ini berisi contoh implementasi untuk beberapa fitur umum yang sering dibutuhkan dalam pengembangan aplikasi, seperti ekspor data dan visualisasi.

---

## 1. Ekspor Data ke Excel (CSV)

Fitur ini sangat berguna untuk memungkinkan pengguna mengunduh data dari tabel ke format CSV yang bisa dibuka di aplikasi spreadsheet seperti Microsoft Excel atau Google Sheets. Kita akan menggunakan library `papaparse`.

**Prasyarat:**
Pastikan `papaparse` sudah terinstal: `npm install papaparse` dan `npm install @types/papaparse -D`.

**Komponen React (`.tsx`):**
```tsx
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Papa from "papaparse";

// Contoh data yang akan diekspor
const dataToExport = [
  { id: 1, nama: "Budi Santoso", kelas: "X IPA 1", nilai: 85 },
  { id: 2, nama: "Siti Aminah", kelas: "X IPA 1", nilai: 92 },
  { id: 3, nama: "Ahmad Dahlan", kelas: "X IPA 2", nilai: 78 },
];

export function ExportToCsvButton() {
  const handleExport = () => {
    if (dataToExport.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    // Mengubah nama kolom agar lebih ramah pengguna
    const formattedData = dataToExport.map(item => ({
      "ID Siswa": item.id,
      "Nama Lengkap": item.nama,
      "Kelas": item.kelas,
      "Nilai Akhir": item.nilai
    }));

    // Mengubah data JSON ke format CSV
    const csv = Papa.unparse(formattedData, { header: true });

    // Membuat file dan memicu unduhan
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'laporan_nilai.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export ke CSV
    </Button>
  );
}
```

---

## 2. Ekspor Halaman ke PDF

Cara termudah untuk membuat file PDF dari konten halaman adalah dengan menggunakan fungsionalitas cetak bawaan browser. Kita bisa membuat CSS khusus yang hanya aktif saat mencetak untuk memastikan tampilannya rapi.

**Langkah 1: Tambahkan CSS untuk Media Cetak di `globals.css`**
```css
/* Tambahkan ini di dalam file src/app/globals.css */
@media print {
    body {
        background-color: white !important;
        color: black !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
    .print-hidden {
        display: none !important;
    }
    .printable-area {
        width: 100%;
        margin: 0;
        padding: 0;
        box-shadow: none !important;
        border: none !important;
    }
}
```

**Langkah 2: Komponen React dengan Tombol Cetak**
```tsx
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function PrintableReport() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Tombol ini akan disembunyikan saat mencetak berkat class 'print-hidden' */}
      <div className="print-hidden mb-4 flex justify-end">
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Cetak Laporan
        </Button>
      </div>

      {/* Konten yang akan dicetak diletakkan di dalam div ini */}
      <div className="printable-area">
        <Card>
          <CardHeader>
            <CardTitle>Laporan Bulanan</CardTitle>
            <CardDescription>Ini adalah contoh laporan yang akan dicetak.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Ini adalah konten laporan Anda. Anda bisa menaruh tabel, teks, dan elemen lainnya di sini.</p>
            {/* ... tabel atau konten lainnya ... */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

## 3. Visualisasi: Diagram Garis (Line Chart)

Diagram garis ideal untuk menunjukkan tren data dari waktu ke waktu. Kita akan menggunakan `recharts`.

**Prasyarat:**
Pastikan `recharts` sudah terinstal: `npm install recharts`.

**Komponen React (`.tsx`):**
```tsx
"use client"

import React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const chartData = [
  { month: "Januari", pengunjung: 186 },
  { month: "Februari", pengunjung: 305 },
  { month: "Maret", pengunjung: 237 },
  { month: "April", pengunjung: 273 },
  { month: "Mei", pengunjung: 209 },
  { month: "Juni", pengunjung: 319 },
];

const chartConfig = {
  pengunjung: {
    label: "Pengunjung",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function LineChartComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tren Pengunjung Bulanan</CardTitle>
        <CardDescription>Data pengunjung selama 6 bulan terakhir.</CardDescription>
      </CardHeader>
      <CardContent className="h-[250px] -ml-4">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <Tooltip content={<ChartTooltipContent indicator="dot" />} />
            <defs>
              <linearGradient id="fillPengunjung" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-pengunjung)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-pengunjung)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area
              dataKey="pengunjung"
              type="monotone"
              fill="url(#fillPengunjung)"
              stroke="var(--color-pengunjung)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
```

---

## 4. Visualisasi: Diagram Batang (Bar Chart)

Diagram batang bagus untuk membandingkan nilai antar kategori.

**Komponen React (`.tsx`):**
```tsx
"use client";

import React from 'react';
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const chartData = [
  { kelas: "X IPA 1", rataRata: 85.5 },
  { kelas: "X IPA 2", rataRata: 82.1 },
  { kelas: "XI IPS 1", rataRata: 88.0 },
  { kelas: "XI IPS 2", rataRata: 86.4 },
  { kelas: "XII IPA 1", rataRata: 90.2 },
];

const chartConfig = {
  rataRata: {
    label: "Nilai Rata-Rata",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function BarChartComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Perbandingan Nilai Rata-Rata Kelas</CardTitle>
        <CardDescription>Semester Genap 2023/2024</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] -ml-4">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
            <XAxis type="number" dataKey="rataRata" hide />
            <YAxis
              type="category"
              dataKey="kelas"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              width={100}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="rataRata" fill="var(--color-rataRata)" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
```

---

## 5. Visualisasi: Diagram Lingkaran/Donat (Pie/Donut Chart)

Diagram ini sempurna untuk menunjukkan proporsi atau persentase dari sebuah keseluruhan.

**Komponen React (`.tsx`):**
```tsx
"use client";

import React from 'react';
import { Pie, PieChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const chartData = [
  { jurusan: "IPA", jumlah: 150, fill: "var(--color-ipa)" },
  { jurusan: "IPS", jumlah: 120, fill: "var(--color-ips)" },
];

const chartConfig = {
  jumlah: {
    label: "Jumlah Siswa",
  },
  ipa: {
    label: "IPA",
    color: "hsl(var(--chart-1))",
  },
  ips: {
    label: "IPS",
    color: "hsl(var(--chart-2))",
  },
};

export function DonutChartComponent() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Sebaran Siswa per Jurusan</CardTitle>
        <CardDescription>Total siswa: {chartData.reduce((acc, curr) => acc + curr.jumlah, 0)}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="jumlah" nameKey="jurusan" innerRadius={60} strokeWidth={5} />
            <ChartLegend
              content={<ChartLegendContent nameKey="jurusan" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
```
