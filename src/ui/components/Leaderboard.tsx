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
      className={cn(
        "bg-white rounded-q-md shadow-card overflow-hidden",
        className
      )}
    >
      <div className="bg-primary px-5 py-4">
        <h3 className="text-base font-semibold text-white">Leaderboard</h3>
      </div>
      <ul className="divide-y divide-primary-light">
        {entries.length === 0 ? (
          <li className="px-5 py-4 text-body-muted text-center text-sm">
            No scores yet
          </li>
        ) : (
          entries.map((entry) => (
            <li
              key={entry.email}
              className={cn(
                "px-5 py-3 flex items-center justify-between transition-all duration-300 ease-quiz",
                entry.email === currentUserEmail && "bg-primary-light"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl min-w-[2.5rem]">
                  {getRankBadge(entry.rank)}
                </span>
                <span
                  className={cn(
                    "font-medium text-sm text-body-text",
                    entry.email === currentUserEmail && "text-primary"
                  )}
                >
                  {entry.email}
                  {entry.email === currentUserEmail && " (You)"}
                </span>
              </div>
              <span className="font-bold text-base text-body-text">
                {entry.points}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
