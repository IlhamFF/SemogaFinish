
// Tidak perlu AuthProvider lagi di sini karena sudah ada di RootLayout
import { AppLayout } from "@/components/layout/app-layout";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout>
      {children}
    </AppLayout>
  );
}
