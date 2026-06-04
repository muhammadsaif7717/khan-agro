import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "emerald";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-xl text-xs font-bold uppercase tracking-wider transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]",
          {
            // Default (surface-hover / primary dark)
            "bg-surface-hover text-text-primary hover:opacity-90 shadow border border-border/80":
              variant === "default",
            // Destructive (red)
            "bg-red-500 text-white hover:bg-red-600 shadow shadow-red-950/20":
              variant === "destructive",
            // Outline
            "border border-border/80 hover:bg-surface-hover/50 hover:text-text-primary":
              variant === "outline",
            // Secondary
            "bg-surface text-text-secondary border border-border/80 hover:bg-surface-hover/50":
              variant === "secondary",
            // Ghost
            "hover:bg-surface-hover/30 hover:text-text-primary text-text-muted":
              variant === "ghost",
            // Link
            "underline-offset-4 hover:underline text-emerald-400":
              variant === "link",
            // Emerald (brand primary)
            "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 hover:shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)] shadow":
              variant === "emerald",
          },
          {
            "h-10 px-5 py-2": size === "default",
            "h-8 rounded-lg px-3 text-[10px]": size === "sm",
            "h-12 rounded-2xl px-8": size === "lg",
            "h-9 w-9 p-0 rounded-xl": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
