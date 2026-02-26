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
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="w-2.5 h-2.5 bg-primary rounded-full inline-block" />
          <span className="text-xl font-bold text-primary">QuizFlow</span>
        </div>
        <h1 className="text-3xl font-bold text-body-text mb-2">Join Quiz</h1>
        <p className="text-body-muted mb-8">Enter the room code to join</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={roomCode}
              onChange={handleInputChange}
              placeholder="ABCD12"
              className="w-full text-center text-4xl font-mono font-bold tracking-widest px-4 py-4 border-2 border-primary-light rounded-q-md bg-white text-body-text placeholder:text-body-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 ease-quiz uppercase"
              maxLength={6}
              autoFocus
            />
            <p className="text-sm text-body-muted mt-2">
              6-character room code
            </p>
          </div>

          {error && <p className="text-coral-bold text-sm">{error}</p>}

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

        <div className="mt-8 pt-6 border-t border-primary-light">
          <Link
            href="/dashboard"
            className="text-primary font-semibold hover:underline text-sm"
          >
            Back to Dashboard
          </Link>
        </div>
      </Card>
    </div>
  );
}
