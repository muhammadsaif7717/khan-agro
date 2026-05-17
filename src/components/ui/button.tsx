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
          "inline-flex items-center justify-center rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98] active:duration-75",
          {
            // Default (slate / primary dark)
            "bg-[#172237] text-white hover:bg-slate-700/80 shadow border border-slate-800/80":
              variant === "default",
            // Destructive (red)
            "bg-red-500 text-white hover:bg-red-600 shadow shadow-red-950/20":
              variant === "destructive",
            // Outline
            "border border-slate-800/80 hover:bg-slate-800/50 hover:text-slate-100":
              variant === "outline",
            // Secondary
            "bg-[#0e1626] text-slate-300 border border-slate-800/80 hover:bg-slate-800/50":
              variant === "secondary",
            // Ghost
            "hover:bg-slate-800/30 hover:text-slate-200 text-slate-400":
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
