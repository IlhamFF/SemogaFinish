
"use client";

import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
  SidebarRail,
} from "@/components/ui/sidebar";
import { AppHeader } from "./app-header";
import { AppSidebarContent } from "./app-sidebar-content";
import { useAuth } from "@/hooks/use-auth"; // useAuth is now a wrapper for useSession
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ROUTES } from "@/lib/constants";
import { Loader2 } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth(); // user and isLoading are now from useSession via useAuth
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      // Not loading and no user, redirect to login
      router.replace(ROUTES.LOGIN);
    } else if (!isLoading && user && user.role === 'siswa' && !user.isVerified) {
      // User is siswa and not verified, redirect to verify email page
      router.replace(ROUTES.VERIFY_EMAIL);
    }
    // If user is authenticated and verified (or not a siswa needing verification), they can access the layout
  }, [user, isLoading, router]);

  // Show loader while session is loading or if conditions for access are not met yet (and redirecting)
  if (isLoading || !user || (user.role === 'siswa' && !user.isVerified)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  // User is authenticated and meets criteria, render the layout
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
