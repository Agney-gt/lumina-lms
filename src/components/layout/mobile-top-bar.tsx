"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SidebarBrand } from "@/components/layout/sidebar";
import { usePathname } from "next/navigation";

export function MobileTopBar({ initials }: { initials: string }) {
  const pathname = usePathname();
  return (
    <header className="bg-sidebar sticky top-0 z-40 flex h-14 items-center gap-1 border-b border-sidebar-border px-2 lg:hidden">
      <MobileNav pathname={pathname} />
      <div className="[&_a]:pointer-events-none [&_a]:py-2">
        <SidebarBrand />
      </div>
      <div className="ml-auto pr-2">
        <Avatar aria-label="Learner profile">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
