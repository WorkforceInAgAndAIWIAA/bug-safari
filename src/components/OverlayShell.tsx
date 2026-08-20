import { X } from "lucide-react";
import type { ReactNode } from "react";

export function OverlayShell({
  title,
  subtitle,
  onClose,
  children,
  toolbar,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  toolbar?: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background">
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {toolbar}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              <X className="h-4 w-4" /> Close
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
      </div>
    </div>
  );
}