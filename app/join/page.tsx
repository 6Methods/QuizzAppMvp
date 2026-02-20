"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/src/ui/components/Button";
import { Card } from "@/src/ui/components/Card";

export default function JoinPage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/sessions/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode: roomCode.toUpperCase() }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error);
        return;
      }

      router.push(`/play/${data.data.sessionId}`);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);
    setRoomCode(value);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card variant="elevated" className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-2 text-ink">Join Quiz</h1>
        <p className="text-ink-light mb-8">Enter the room code to join</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={roomCode}
              onChange={handleInputChange}
              placeholder="ABCD12"
              className="w-full text-center text-4xl font-mono font-bold tracking-widest px-4 py-4 border-2 border-ink/10 rounded-2xl focus:outline-none focus:border-primary-500 uppercase transition-colors"
              maxLength={6}
              autoFocus
            />
            <p className="text-sm text-ink-light mt-2">6-character room code</p>
          </div>

          {error && <p className="text-error text-sm">{error}</p>}

          <Button
            type="submit"
            isLoading={isLoading}
            disabled={roomCode.length !== 6}
            size="lg"
            className="w-full"
          >
            Join Game
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-ink/5">
          <Link href="/dashboard" className="text-primary-500 font-medium hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </Card>
    </div>
  );
}
