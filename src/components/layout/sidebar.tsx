"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ChartColumn,
  FileText,
  GraduationCap,
  Home,
  LibraryBig,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Lessons", href: "/lessons", icon: BookOpen },
  { label: "Quizzes", href: "/quizzes", icon: LibraryBig },
  { label: "Progress", href: "/progress", icon: ChartColumn },
  { label: "Chapter PDF", href: "/chapter-pdf", icon: FileText },
  { label: "Subjects", href: "/subjects", icon: GraduationCap },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/home") return pathname === "/home";
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface NavListProps {
  pathname: string;
  onNavigate?: () => void;
}

export function SidebarNav({ pathname, onNavigate }: NavListProps) {
  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
      <span
        aria-disabled="true"
        title="Copilot is coming in a future release"
        className="mt-1 flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/50"
      >
        <Sparkles className="size-4 shrink-0" />
        Copilot
        <span className="ml-auto rounded-sm border border-sidebar-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-sidebar-foreground/60">
          Soon
        </span>
      </span>
    </nav>
  );
}

export function SidebarBrand() {
  return (
    <Link
      href="/home"
      className="flex items-center gap-2.5 px-6 py-5 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring rounded-lg"
    >
      <span className="bg-sidebar-primary text-sidebar-primary-foreground flex size-8 items-center justify-center rounded-lg">
        <GraduationCap className="size-5" />
      </span>
      <span className="text-lg font-semibold tracking-tight text-white">
        Lumina
      </span>
    </Link>
  );
}

export function DesktopSidebar() {
  const pathname = usePathname();
  return (
    <aside className="bg-sidebar fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-sidebar-border lg:flex">
      <SidebarBrand />
      <div className="flex-1 overflow-y-auto py-2">
        <SidebarNav pathname={pathname} />
      </div>
      <div className="border-t border-sidebar-border px-4 py-3">
        <p className="text-[11px] leading-snug text-sidebar-foreground/60">
          Grade 8 · Ganita Prakash
        </p>
      </div>
    </aside>
  );
}
