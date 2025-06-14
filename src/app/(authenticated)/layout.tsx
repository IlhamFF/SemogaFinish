
import { AuthProvider } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout/app-layout";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AppLayout>
        {children}
      </AppLayout>
    </AuthProvider>
  );
}
