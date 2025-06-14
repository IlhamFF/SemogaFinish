
"use client";

import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { NAV_LINKS_CONFIG, APP_NAME, ROUTES, ROLES } from "@/lib/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, LogOut } from "lucide-react";
import { Button } from "../ui/button";

export function AppSidebarContent() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const accessibleLinks = NAV_LINKS_CONFIG.filter(link => 
    link.roles.includes(user.role) || user.role === 'superadmin'
  );

  const uniqueLinks = accessibleLinks.reduce((acc, current) => {
    const x = acc.find(item => item.label === current.label && item.roles.some(r => current.roles.includes(r)));
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, [] as typeof NAV_LINKS_CONFIG);
  
  const finalLinks = user.role === 'superadmin' 
    ? NAV_LINKS_CONFIG.filter(link => link.roles.includes('superadmin') || link.roles.includes('admin')) 
    : uniqueLinks;
  
  const displayLinks = [...new Map(finalLinks.map(item => [item.href, item])).values()];

  return (
    <>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 p-2">
          <BookOpenText className="h-8 w-8 text-primary" />
          <h2 className="text-xl font-bold font-headline text-primary group-data-[collapsible=icon]:hidden">
            {APP_NAME}
          </h2>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {displayLinks.map((link) => (
            <SidebarMenuItem key={link.href} tooltipContent={link.label}>
              <Link href={link.href} asChild legacyBehavior={false}>
                <SidebarMenuButton
                  isActive={pathname === link.href || pathname.startsWith(`${link.href}/`)}
                  className="justify-start"
                >
                  <link.icon className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">{link.label}</span>
                </SidebarMenuButton>
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
