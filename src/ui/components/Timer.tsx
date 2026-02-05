"use client";

import { useEffect, useState } from "react";
import { cn } from "@/src/lib/utils";

interface TimerProps {
  endsAt: string;
  onTimeUp?: () => void;
  className?: string;
}

export function Timer({ endsAt, onTimeUp, className }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = new Date(endsAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 1000));
  });

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp?.();
      return;
    }

    const interval = setInterval(() => {
      const diff = new Date(endsAt).getTime() - Date.now();
      const newTime = Math.max(0, Math.ceil(diff / 1000));
      setTimeLeft(newTime);

      if (newTime <= 0) {
        clearInterval(interval);
        onTimeUp?.();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [endsAt, onTimeUp, timeLeft]);

  const isLow = timeLeft <= 5;
  const isCritical = timeLeft <= 3;

  return (
    <div
      className={cn(
        "text-4xl font-bold tabular-nums transition-colors",
        isLow && !isCritical && "text-yellow-500",
        isCritical && "text-red-500 animate-pulse",
        !isLow && "text-gray-800",
        className
      )}
    >
      {timeLeft}s
    </div>
  );
}
