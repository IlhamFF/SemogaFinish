
"use client";

import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
  SidebarRail,
} from "@/components/ui/sidebar";
import { AppHeader } from "./app-header";
import { AppSidebarContent } from "./app-sidebar-content";
import { useAuth } from "@/hooks/use-auth"; 
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ROUTES } from "@/lib/constants";
import { Loader2 } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth(); 
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(ROUTES.LOGIN);
    } else if (!isLoading && user && user.role === 'siswa' && !user.isVerified) {
      router.replace(ROUTES.VERIFY_EMAIL);
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || (user.role === 'siswa' && !user.isVerified)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="sidebar" side="left">
        <AppSidebarContent />
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

    