"use client";

import { cn } from "@/src/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-body-text mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full px-4 py-2.5 border-2 rounded-q-sm bg-white text-body-text placeholder:text-body-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 ease-quiz",
            error
              ? "border-coral-bold focus:border-coral-bold"
              : "border-primary-light focus:border-primary",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-coral-bold">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
