"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-ink hover:opacity-90 shadow-sm shadow-accent/20",
  secondary:
    "bg-surface-sunken text-ink hover:bg-border-subtle border border-border-subtle",
  ghost: "bg-transparent text-ink-muted hover:bg-surface-sunken hover:text-ink",
  outline: "bg-transparent border border-border-strong text-ink hover:bg-surface-sunken",
  destructive: "bg-incorrect text-white hover:opacity-90",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-xs rounded-[calc(var(--radius-control)-2px)]",
  md: "h-10 px-4 text-sm rounded-[var(--radius-control)]",
  lg: "h-12 px-6 text-[15px] rounded-[var(--radius-control)]",
  icon: "h-9 w-9 rounded-[var(--radius-control)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading, disabled, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading && (
          <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
