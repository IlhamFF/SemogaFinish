# Kumpulan Snippet Kode dari Aplikasi EduCentral

Dokumen ini berisi contoh implementasi aktual dari beberapa fitur yang ada di dalam aplikasi EduCentral, seperti ekspor data dan visualisasi. Kode ini diambil langsung dari codebase untuk menjadi referensi yang akurat.

---

## 1. Ekspor Data ke Excel (CSV) dengan `papaparse`

Fitur ini digunakan pada beberapa modul, seperti rekap absensi guru dan laporan nilai. Logika dasarnya adalah mengubah data (array of objects) menjadi string CSV lalu memicu unduhan di browser.

**Keterangan:** Kode ini diambil dari komponen `GuruAbsensiPage` (`src/app/(authenticated)/guru/absensi/page.tsx`).

**Komponen React (`.tsx`):**
```tsx
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";

// Asumsikan Anda memiliki state ini di dalam komponen Anda:
// const [rekapData, setRekapData] = useState<RekapSiswa[]>([]);
// const [selectedRekapKelas, setSelectedRekapKelas] = useState<string>("X IPA 1");
// const [selectedRekapBulan, setSelectedRekapBulan] = useState<string>("7"); // Juli
// const [selectedRekapTahun, setSelectedRekapTahun] = useState<string>("2024");
// const { toast } = useToast();

// Contoh data rekap absensi
const rekapDataContoh = [
  { id: "uuid-siswa-1", nama: "Budi Santoso", nis: "12345", hadir: 18, izin: 1, sakit: 1, alpha: 0 },
  { id: "uuid-siswa-2", nama: "Siti Aminah", nis: "12346", hadir: 20, izin: 0, sakit: 0, alpha: 0 },
];

export function ExportRekapAbsensiButton() {
  const handleExportRekap = () => {
    // Di aplikasi asli, state akan digunakan, bukan data contoh
    if (rekapDataContoh.length === 0) {
      // toast({ title: "Tidak Ada Data", description: "Tidak ada data rekap untuk diekspor." });
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    const bulanMap = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const kelasTerpilih = "X IPA 1"; // Contoh
    const bulanTerpilih = bulanMap[6]; // Contoh: Juli
    const tahunTerpilih = "2024"; // Contoh

    const fileName = `rekap_absensi_${kelasTerpilih.replace(/ /g, '_')}_${bulanTerpilih}_${tahunTerpilih}.csv`;

    const dataToExport = rekapDataContoh.map(item => ({
      "Nama Siswa": item.nama,
      "NIS": item.nis || "N/A",
      "Hadir": item.hadir,
      "Sakit": item.sakit,
      "Izin": item.izin,
      "Alpha": item.alpha
    }));

    const csvData = Papa.unparse(dataToExport, { header: true });
    
    // Memberi awalan BOM (Byte Order Mark) agar karakter UTF-8 (seperti nama) tampil benar di Excel
    const blob = new Blob([`\uFEFF${csvData}`], { type: 'text/csv;charset=utf-8;' }); 
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Button onClick={handleExportRekap}>
      <Download className="mr-2 h-4 w-4" />
      Export ke CSV
    </Button>
  );
}
```

---

## 2. Ekspor Halaman ke PDF via `window.print()`

Cara paling efisien untuk membuat PDF adalah dengan memanfaatkan fungsi cetak browser yang bisa menyimpan sebagai PDF. Kuncinya adalah menggunakan CSS khusus media cetak (`@media print`) untuk menata ulang halaman agar terlihat seperti dokumen.

**Keterangan:** Logika ini digunakan pada halaman Laporan Pimpinan (`src/app/(printable)/pimpinan/laporan/cetak/page.tsx`).

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
    .print-block {
        display: block !important;
    }
    .A4-container {
        width: 100%;
        min-height: auto;
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
        margin: 0 !important;
    }
    /* Menghindari halaman terpotong di tengah tabel/section */
    .break-inside-avoid {
        break-inside: avoid;
    }
}
```

**Langkah 2: Komponen React dengan Tombol Cetak**
Ini adalah versi sederhana dari halaman Laporan Pimpinan.
```tsx
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from 'next/image';

export function PrintableReportPage() {
  
  // Di aplikasi asli, data diambil menggunakan useEffect dan fetch
  const pimpinanStats = [
      { title: "Total Siswa", value: "350" },
      { title: "Total Guru", value: "35" },
      { title: "Jumlah Kelas", value: "12" },
      { title: "Total Mata Pelajaran", value: "15" },
  ];
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-gray-100 p-4 print:bg-white">
      {/* Tombol ini akan disembunyikan saat mencetak berkat class 'print:hidden' */}
      <div className="max-w-4xl mx-auto flex justify-end mb-4 print:hidden">
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Cetak Laporan
        </Button>
      </div>

      {/* Konten yang akan dicetak diletakkan di dalam div ini */}
      <div className="A4-container bg-white mx-auto p-8 shadow-lg print:shadow-none">
        <header className="flex justify-between items-center border-b-4 border-gray-900 pb-4">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="Logo Sekolah" width={60} height={60} />
            <div>
              <h1 className="text-2xl font-bold">EduCentral SMA Az-Bail</h1>
              <p className="text-sm">Laporan Kinerja Akademik</p>
            </div>
          </div>
        </header>

        <section className="my-8 break-inside-avoid">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Ringkasan Statistik</h2>
          <div className="grid grid-cols-2 gap-4">
            {pimpinanStats.map(stat => (
              <div key={stat.title} className="bg-gray-50 p-4 rounded-lg border">
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ... section lainnya seperti tabel ... */}
        
        <footer className="mt-12 pt-8 text-xs text-center text-gray-500 border-t">
          <p>*** Laporan Internal - Dihasilkan oleh Sistem EduCentral ***</p>
        </footer>
      </div>
    </div>
  );
}
```

---

## 3. Visualisasi: Diagram Garis (Line Chart) dengan `recharts`

Diagram garis ideal untuk menunjukkan tren data dari waktu ke waktu. Kita menggunakan komponen `ChartContainer` dari ShadCN yang membungkus `recharts` untuk styling yang konsisten.

**Keterangan:** Kode ini diambil dari Dasbor Pimpinan (`src/app/(authenticated)/pimpinan/dashboard/page.tsx`) untuk menampilkan tren kehadiran.

**Komponen React (`.tsx`):**
```tsx
"use client"

import React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { ChartContainer, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Data kehadiran bulanan (contoh)
const chartData = [
  { name: "Jan", Kehadiran: 88.5 },
  { name: "Feb", Kehadiran: 91.2 },
  { name: "Mar", Kehadiran: 90.1 },
  { name: "Apr", Kehadiran: 92.4 },
  { name: "Mei", Kehadiran: 89.9 },
  { name: "Jun", Kehadiran: 93.1 },
];

// Konfigurasi untuk ChartContainer
const chartConfig = {
  Kehadiran: {
    label: "Kehadiran (%)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function LineChartComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tren Kehadiran Siswa</CardTitle>
        <CardDescription>Persentase kehadiran selama 6 bulan terakhir.</CardDescription>
      </CardHeader>
      <CardContent className="h-[250px] -ml-4">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <AreaChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[80, 100]} tickFormatter={(value) => `${value}%`} />
            <Tooltip content={<ChartTooltipContent indicator="dot" />} />
            <defs>
              <linearGradient id="fillKehadiran" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-Kehadiran)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-Kehadiran)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="Kehadiran"
              stroke="var(--color-Kehadiran)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#fillKehadiran)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
```

---

## 4. Visualisasi: Diagram Batang (Bar Chart) dengan `recharts`

Diagram batang bagus untuk membandingkan nilai antar kategori. Contoh ini akan menunjukkan perbandingan nilai rata-rata per kelas.

**Keterangan:** Fitur ini tidak ada secara eksplisit, jadi kode ini adalah adaptasi dari data yang ada di Laporan Kelas Pimpinan, dibuat agar konsisten dengan komponen lain.

**Komponen React (`.tsx`):**
```tsx
"use client";

import React from 'react';
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Contoh data dari laporan rata-rata kelas
const chartData = [
  { kelas: "XII IPA 1", rataRata: 90.2 },
  { kelas: "XI IPS 1", rataRata: 88.0 },
  { kelas: "XI IPS 2", rataRata: 86.4 },
  { kelas: "X IPA 1", rataRata: 85.5 },
  { kelas: "X IPA 2", rataRata: 82.1 },
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
          {/* layout="vertical" membuat diagram batang horizontal */}
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

Diagram ini sempurna untuk menunjukkan proporsi. Kita akan mengambil contoh dari dasbor pimpinan yang menampilkan sebaran siswa per jurusan.

**Keterangan:** Kode ini diambil dari Dasbor Pimpinan (`src/app/(authenticated)/pimpinan/dashboard/page.tsx`).

**Komponen React (`.tsx`):**
```tsx
"use client";

import React from 'react';
import { Pie, PieChart, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Contoh data sebaran siswa
const chartData = [
  { name: "IPA", value: 180 },
  { name: "IPS", value: 120 },
];

// Warna ini harus didefinisikan di globals.css atau di style ChartContainer
const ROLE_COLORS: Record<string, string> = {
    IPA: "hsl(var(--chart-1))",
    IPS: "hsl(var(--chart-2))",
};

// Konfigurasi untuk legenda dan tooltip
const sebaranSiswaConfig = {
  IPA: { label: "IPA", color: ROLE_COLORS["IPA"] },
  IPS: { label: "IPS", color: ROLE_COLORS["IPS"] },
};

export function DonutChartComponent() {
  const totalSiswa = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Sebaran Siswa per Jurusan</CardTitle>
        <CardDescription>Total siswa: {totalSiswa}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={sebaranSiswaConfig} className="mx-auto aspect-square h-[250px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={ROLE_COLORS[entry.name]} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
```
