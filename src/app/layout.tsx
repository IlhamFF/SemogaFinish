
"use client"; 

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider as CustomAuthProvider } from "@/hooks/use-auth"; 
// SessionProvider is no longer needed for custom token auth
// import { SessionProvider } from "next-auth/react"; 
import { APP_NAME } from '@/lib/constants';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning={true}>
      <head>
        <title>{APP_NAME}</title>
        <meta name="description" content="Sistem Manajemen Pendidikan Komprehensif untuk SMA Az-Bail" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {/* SessionProvider is removed */}
        <CustomAuthProvider> 
          {children}
          <Toaster />
        </CustomAuthProvider>
      </body>
    </html>
  );
}
