import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "bg-primary text-primary-foreground shadow hover:bg-primary/90 bg-blue-600 hover:bg-blue-500 text-white",
      secondary: "bg-slate-800 text-slate-100 shadow-sm hover:bg-slate-700/80 border border-slate-700/50",
      destructive: "bg-rose-600 text-white shadow-sm hover:bg-rose-500",
      outline: "border border-slate-800 bg-transparent shadow-sm hover:bg-slate-900 hover:text-slate-100 text-slate-300",
      ghost: "hover:bg-slate-800/60 hover:text-slate-100 text-slate-400",
      link: "text-blue-400 underline-offset-4 hover:underline",
    };

    const sizes = {
      default: "h-9 px-4 py-2 text-xs",
      sm: "h-8 rounded-md px-3 text-[11px]",
      lg: "h-10 rounded-md px-6 text-sm",
      icon: "h-8 w-8",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 select-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";