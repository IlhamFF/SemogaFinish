
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth"; 
import { APP_NAME, ROLES, ROUTES } from "@/lib/constants"; // ROUTES from constants
import { USER_NAV_ITEMS } from "@/lib/navigation"; // USER_NAV_ITEMS from navigation
import { ChevronDown, LogOut, UserCircle, Settings } from "lucide-react";
import Link from "next/link";

export function AppHeader() {
  const { user, logout } = useAuth(); 
  const { isMobile } = useSidebar();

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length > 1 && parts[0] && parts[parts.length-1]) {
        return `${parts[0][0]}${parts[parts.length-1][0]}`.toUpperCase();
      }
      return name.substring(0,2).toUpperCase();
    }
    if (email) {
      return email.substring(0,2).toUpperCase();
    }
    return '??';
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 shadow-sm">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="text-foreground" />
        {!isMobile && <h1 className="text-lg font-semibold font-headline text-primary">{APP_NAME}</h1>}
      </div>
      
      <div className="ml-auto flex items-center gap-4">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative flex items-center gap-2 p-2 h-auto rounded-full focus-visible:ring-primary">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl || `https://placehold.co/40x40.png?text=${getInitials(user.fullName || user.name, user.email)}`} alt={user.fullName || user.name || user.email || "User"} data-ai-hint="user avatar" />
                  <AvatarFallback>{getInitials(user.fullName || user.name, user.email)}</AvatarFallback>
                </Avatar>
                {!isMobile && (
                  <>
                    <div className="text-left">
                      <p className="text-sm font-medium">{user.fullName || user.name || user.email}</p>
                      <p className="text-xs text-muted-foreground">{ROLES[user.role]}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.fullName || user.name || user.email}</p>
                  {user.email && <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href={ROUTES.SETTINGS} className="flex items-center w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    Pengaturan Profil
                  </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
