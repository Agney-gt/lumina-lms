import { AppBreadcrumb } from "@/components/navigation/app-breadcrumb";
import { cn } from "@/lib/utils";
import type { Crumb } from "@/lib/breadcrumbs";

interface PageHeaderProps {
  crumbs: Crumb[];
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  crumbs,
  title,
  description,
  actions,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-5 flex flex-col gap-3", className)}>
      <div className="flex items-start justify-between gap-4">
        <AppBreadcrumb items={crumbs} />
        {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
      </div>
      {children}
      {title ? (
        <div>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
