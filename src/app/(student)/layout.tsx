import { Flame } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DesktopSidebar } from "@/components/layout/sidebar";
import { MobileTopBar } from "@/components/layout/mobile-top-bar";
import { getLearnerData } from "@/lib/server/store";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, streak } = getLearnerData();

  return (
    <div className="min-h-screen">
      <DesktopSidebar />
      <MobileTopBar initials={profile.initials} />
      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 hidden h-16 items-center justify-end gap-4 border-b border-border bg-background/95 px-8 backdrop-blur lg:flex">
          <span
            className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-sm font-medium"
            aria-label={`Learning streak: ${streak.current} days`}
          >
            <Flame className="size-4 text-primary" aria-hidden="true" />
            {streak.current}-day streak
          </span>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-medium leading-tight">{profile.name}</p>
              <p className="text-xs text-muted-foreground">Grade {profile.grade}</p>
            </div>
            <Avatar>
              <AvatarFallback>{profile.initials}</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 lg:px-8 lg:py-7">
          {children}
        </main>
      </div>
    </div>
  );
}
