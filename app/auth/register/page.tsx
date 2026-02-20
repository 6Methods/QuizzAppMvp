"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/src/ui/components/Button";
import { Input } from "@/src/ui/components/Input";
import { Card } from "@/src/ui/components/Card";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ORGANIZER" | "PARTICIPANT">("PARTICIPANT");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card variant="elevated" className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-bold text-2xl text-ink mb-2">
            <span className="text-primary-500">●</span> QuizFlow
          </Link>
          <h1 className="text-2xl font-bold text-ink">Create Account</h1>
          <p className="text-ink-light text-sm mt-1">Join the quiz community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            id="password"
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />

          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              I want to
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("PARTICIPANT")}
                className={`p-4 border-2 rounded-2xl text-center transition-all ${
                  role === "PARTICIPANT"
                    ? "border-primary-500 bg-primary-50 text-primary-700 shadow-md"
                    : "border-ink/10 hover:border-primary-300"
                }`}
              >
                <div className="text-2xl mb-1">🎮</div>
                <div className="font-semibold">Play Quizzes</div>
                <div className="text-xs text-ink-light mt-0.5">Participant</div>
              </button>
              <button
                type="button"
                onClick={() => setRole("ORGANIZER")}
                className={`p-4 border-2 rounded-2xl text-center transition-all ${
                  role === "ORGANIZER"
                    ? "border-primary-500 bg-primary-50 text-primary-700 shadow-md"
                    : "border-ink/10 hover:border-primary-300"
                }`}
              >
                <div className="text-2xl mb-1">📋</div>
                <div className="font-semibold">Create Quizzes</div>
                <div className="text-xs text-ink-light mt-0.5">Organizer</div>
              </button>
            </div>
          </div>

          {error && <p className="text-error text-sm text-center">{error}</p>}

          <Button type="submit" isLoading={isLoading} className="w-full">
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-light">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary-500 font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </Card>
    </div>
  );
}
