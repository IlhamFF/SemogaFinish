
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
import { APP_NAME, USER_NAV_ITEMS, ROLES } from "@/lib/constants";
import { ChevronDown, LogOut, UserCircle } from "lucide-react";
import Link from "next/link";

export function AppHeader() {
  const { user, logout } = useAuth();
  const { isMobile } = useSidebar();

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
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
                  <AvatarImage src={user.avatarUrl || `https://placehold.co/40x40.png?text=${getInitials(user.name, user.email)}`} alt={user.name || user.email} data-ai-hint="user avatar" />
                  <AvatarFallback>{getInitials(user.name, user.email)}</AvatarFallback>
                </Avatar>
                {!isMobile && (
                  <>
                    <div className="text-left">
                      <p className="text-sm font-medium">{user.name || user.email}</p>
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
                  <p className="text-sm font-medium leading-none">{user.name || user.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {USER_NAV_ITEMS.map((item) => (
                <DropdownMenuItem key={item.label} asChild className="cursor-pointer">
                  {item.action === 'logout' ? (
                    <button onClick={logout} className="flex w-full items-center">
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </button>
                  ) : (
                    <Link href={item.href} className="flex items-center">
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Link>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
