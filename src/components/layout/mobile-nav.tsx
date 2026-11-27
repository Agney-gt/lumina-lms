"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarBrand, SidebarNav } from "@/components/layout/sidebar";
import { useNavigationStore } from "@/stores/navigation";

export function MobileNav({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const setDrawerOpen = useNavigationStore((s) => s.setDrawerOpen);

  return (
    <Sheet
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        setDrawerOpen(value);
      }}
    >
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open navigation menu"
          className="text-white hover:bg-sidebar-accent lg:hidden"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="bg-sidebar w-64 border-sidebar-border p-0 [&>button]:text-white [&>button]:top-5 [&>button]:right-4"
      >
        <SheetHeader className="p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Move between Lumina modules
          </SheetDescription>
          <SidebarBrand />
        </SheetHeader>
        <SidebarNav pathname={pathname} onNavigate={() => setOpen(false)} />
        <p className="mt-auto border-t border-sidebar-border px-4 py-3 text-[11px] text-sidebar-foreground/60">
          Grade 8 · Ganita Prakash
        </p>
      </SheetContent>
    </Sheet>
  );
}
