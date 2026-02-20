"use client";

import { cn } from "@/src/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";

    const variants = {
      primary:
        "bg-primary-500 text-white shadow-float hover:shadow-float-lg hover:-translate-y-0.5 focus:ring-primary-400",
      secondary:
        "bg-transparent text-ink border-2 border-ink/10 hover:border-primary-500 hover:text-primary-500 hover:bg-white focus:ring-primary-400",
      danger:
        "bg-error text-white hover:bg-red-600 hover:-translate-y-0.5 focus:ring-red-400",
      ghost:
        "bg-transparent text-ink-light hover:bg-primary-50 hover:text-primary-500 focus:ring-primary-400",
    };

    const sizes = {
      sm: "px-4 py-1.5 text-sm gap-1.5",
      md: "px-6 py-2.5 text-base gap-2",
      lg: "px-8 py-3.5 text-lg gap-2",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
