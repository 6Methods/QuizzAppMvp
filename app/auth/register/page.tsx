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
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="w-2.5 h-2.5 bg-primary rounded-full inline-block" />
          <span className="text-xl font-bold text-primary">QuizFlow</span>
        </div>
        <h1 className="text-2xl font-bold text-center text-body-text mb-6">
          Create Account
        </h1>

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
            <label className="block text-sm font-medium text-body-text mb-2">
              I want to
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("PARTICIPANT")}
                className={`p-4 border-2 rounded-q-md text-center transition-all duration-300 ease-quiz ${
                  role === "PARTICIPANT"
                    ? "border-primary bg-primary-light text-primary"
                    : "border-primary-light bg-white hover:border-primary text-body-muted"
                }`}
              >
                <div className="text-2xl mb-1">🎮</div>
                <div className="font-semibold text-sm">Play Quizzes</div>
                <div className="text-xs text-body-muted mt-0.5">Participant</div>
              </button>
              <button
                type="button"
                onClick={() => setRole("ORGANIZER")}
                className={`p-4 border-2 rounded-q-md text-center transition-all duration-300 ease-quiz ${
                  role === "ORGANIZER"
                    ? "border-primary bg-primary-light text-primary"
                    : "border-primary-light bg-white hover:border-primary text-body-muted"
                }`}
              >
                <div className="text-2xl mb-1">📋</div>
                <div className="font-semibold text-sm">Create Quizzes</div>
                <div className="text-xs text-body-muted mt-0.5">Organizer</div>
              </button>
            </div>
          </div>

          {error && (
            <p className="text-coral-bold text-sm text-center">{error}</p>
          )}

          <Button type="submit" isLoading={isLoading} className="w-full">
            Create Account
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-body-muted">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-primary font-semibold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </Card>
    </div>
  );
}
