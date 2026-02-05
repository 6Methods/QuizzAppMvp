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
      className={cn("bg-white rounded-xl shadow-md overflow-hidden", className)}
    >
      <div className="bg-primary-600 px-4 py-3">
        <h3 className="text-lg font-semibold text-white">Leaderboard</h3>
      </div>
      <ul className="divide-y divide-gray-200">
        {entries.length === 0 ? (
          <li className="px-4 py-3 text-gray-500 text-center">No scores yet</li>
        ) : (
          entries.map((entry) => (
            <li
              key={entry.email}
              className={cn(
                "px-4 py-3 flex items-center justify-between transition-colors",
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
