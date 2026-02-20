"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/src/ui/components/Button";
import { Input } from "@/src/ui/components/Input";
import { Card } from "@/src/ui/components/Card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
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
          <h1 className="text-2xl font-bold text-ink">Welcome back</h1>
          <p className="text-ink-light text-sm mt-1">Sign in to your account</p>
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
            autoComplete="current-password"
          />

          {error && <p className="text-error text-sm text-center">{error}</p>}

          <Button type="submit" isLoading={isLoading} className="w-full">
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-light">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/register"
            className="text-primary-500 font-medium hover:underline"
          >
            Register
          </Link>
        </p>

        <div className="mt-6 p-4 bg-page rounded-2xl">
          <p className="text-xs text-ink-light text-center mb-2 font-medium">
            Test accounts
          </p>
          <p className="text-xs text-ink-light text-center">
            Organizer: organizer@test.com / 123456
          </p>
          <p className="text-xs text-ink-light text-center">
            Participant: participant@test.com / 123456
          </p>
        </div>
      </Card>
    </div>
  );
}
