import { SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "w-full appearance-none rounded-[var(--radius-control)] border border-border-strong bg-surface px-3 py-2.5 text-sm text-ink",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            "pr-9",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
      </div>
    );
  }
);
Select.displayName = "Select";
