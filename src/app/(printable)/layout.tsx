
import React from 'react';
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { APP_NAME } from '@/lib/constants';

// This is a minimal layout for printable pages, without sidebars or headers.
export default function PrintableLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
       <head>
        <title>Cetak Laporan - {APP_NAME}</title>
        <style>
          {`
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          `}
        </style>
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="light" // Default to light theme for printing
          enableSystem={false}
        >
          <CustomAuthProvider>
            {children}
            <Toaster />
          </CustomAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

// A separate auth provider might be needed if you want to avoid layout flashes
// but for this purpose, a simple one that just provides context is fine.
function CustomAuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
