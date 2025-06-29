
"use client";

import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth"; 
import { APP_NAME } from "@/lib/constants"; // APP_NAME from constants
import { NAV_LINKS_CONFIG } from "@/lib/navigation"; // NAV_LINKS_CONFIG from navigation
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { sidebarMenuButtonVariants } from "@/components/ui/sidebar"; 
import Image from "next/image";


export function AppSidebarContent() {
  const { user, logout } = useAuth(); 
  const pathname = usePathname();

  if (!user) return null; 

  const accessibleLinks = NAV_LINKS_CONFIG.filter(link => 
    link.roles.includes(user.role) || user.role === 'superadmin'
  );

  const uniqueLinksByHref = [...new Map(accessibleLinks.map(item => [item.href, item])).values()];
  
  const displayLinks = user.role === 'superadmin' 
    ? [...new Map(NAV_LINKS_CONFIG.filter(link => link.roles.includes('superadmin') || link.roles.includes('admin')).map(item => [item.href, item])).values()]
    : uniqueLinksByHref;

  return (
    <>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 p-2 justify-center">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/logo.png" 
              alt={`${APP_NAME} Logo`}
              width={40}
              height={40}
              className="object-contain"
              data-ai-hint="logo"
            />
            <h2 className="text-xl font-bold font-headline text-primary group-data-[collapsible=icon]:hidden">
              {APP_NAME}
            </h2>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {displayLinks.map((link) => (
            <SidebarMenuItem key={link.href} tooltipContent={link.label}>
              <Link
                href={link.href}
                className={cn(
                  sidebarMenuButtonVariants({ variant: "default", size: "default" }),
                  "justify-start", 
                  (pathname === link.href || (link.href !== "/" && pathname.startsWith(`${link.href}/`))) && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                )}
                data-active={(pathname === link.href || (link.href !== "/" && pathname.startsWith(`${link.href}/`)))}
              >
                <link.icon className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">{link.label}</span>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="mt-auto border-t p-2">
        <Button variant="ghost" onClick={logout} className="w-full justify-start group-data-[collapsible=icon]:justify-center">
          <LogOut className="mr-2 h-5 w-5 group-data-[collapsible=icon]:mr-0" />
           <span className="group-data-[collapsible=icon]:hidden">Keluar</span>
        </Button>
      </SidebarFooter>
    </>
  );
}
