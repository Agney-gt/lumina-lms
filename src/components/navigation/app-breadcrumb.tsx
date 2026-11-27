import * as React from "react";
import Link from "next/link";
import { House } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import type { Crumb } from "@/lib/breadcrumbs";

interface AppBreadcrumbProps {
  items: Crumb[];
  className?: string;
  collapseOnMobile?: boolean;
}

export function AppBreadcrumb({
  items,
  className,
  collapseOnMobile = true,
}: AppBreadcrumbProps) {
  const showRoot = items.length > 0;
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <React.Fragment>
          {showRoot && (
            <>
              <BreadcrumbItem
                className={cn(collapseOnMobile && items.length > 1 && "hidden sm:flex")}
              >
                <BreadcrumbLink asChild>
                  <Link href="/home" aria-label="Home">
                    <House className="size-3.5" />
                    <span className="sr-only">Home</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator
                className={cn(collapseOnMobile && "hidden sm:flex")}
              />
            </>
          )}
        </React.Fragment>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isMiddle = collapseOnMobile && index > 0 && index < items.length - 1;
          return (
            <React.Fragment key={`${item.label}-${index}`}>
              <BreadcrumbItem className={cn(isMiddle && "hidden md:flex")}>
                {isLast || !item.href ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator className={cn(isMiddle && "hidden md:flex")} />
              )}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
