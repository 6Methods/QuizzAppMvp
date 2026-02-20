"use client";

import { cn } from "@/src/lib/utils";

interface LeaderboardEntry {
  rank: number;
  email: string;
  points: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserEmail?: string;
  className?: string;
}

export function Leaderboard({
  entries,
  currentUserEmail,
  className,
}: LeaderboardProps) {
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  return (
    <div
      className={cn("bg-white rounded-3xl shadow-card overflow-hidden", className)}
    >
      <div className="bg-ink px-5 py-3.5">
        <h3 className="text-lg font-semibold text-white">Leaderboard</h3>
      </div>
      <ul className="divide-y divide-ink/5">
        {entries.length === 0 ? (
          <li className="px-5 py-4 text-ink-light text-center">No scores yet</li>
        ) : (
          entries.map((entry) => (
            <li
              key={entry.email}
              className={cn(
                "px-5 py-3.5 flex items-center justify-between transition-colors",
                entry.email === currentUserEmail && "bg-primary-50"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl min-w-[2.5rem]">
                  {getRankBadge(entry.rank)}
                </span>
                <span
                  className={cn(
                    "font-medium",
                    entry.email === currentUserEmail && "text-primary-700"
                  )}
                >
                  {entry.email}
                  {entry.email === currentUserEmail && " (You)"}
                </span>
              </div>
              <span className="font-bold text-lg">{entry.points}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
