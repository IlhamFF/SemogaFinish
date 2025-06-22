// Tidak ada perubahan diperlukan di file ini, AppLayout sudah benar.
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
