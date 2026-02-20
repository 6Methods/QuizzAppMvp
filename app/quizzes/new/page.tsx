"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/src/ui/components/Button";
import { Input } from "@/src/ui/components/Input";
import { Card } from "@/src/ui/components/Card";

export default function NewQuizPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error);
        return;
      }

      router.push(`/quizzes/${data.data.id}/edit`);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="flex justify-between items-center px-8 py-6 max-w-[1200px] mx-auto w-full">
        <div className="font-bold text-2xl text-ink flex items-center gap-2">
          <span className="text-primary-500">●</span> QuizFlow
        </div>
      </header>

      <main className="px-8 pb-12 max-w-[700px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-ink">Create New Quiz</h1>
          <Link href="/quizzes">
            <Button variant="ghost">Cancel</Button>
          </Link>
        </div>

        <Card variant="elevated">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="title"
              label="Quiz Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter quiz title"
              required
              maxLength={200}
            />

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-ink mb-1"
              >
                Description (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter quiz description"
                maxLength={1000}
                rows={4}
                className="w-full px-4 py-2.5 border-2 border-ink/10 rounded-2xl shadow-sm transition-colors focus:outline-none focus:ring-0 focus:border-primary-500"
              />
            </div>

            {error && (
              <p className="text-error text-sm text-center">{error}</p>
            )}

            <Button type="submit" isLoading={isLoading} className="w-full">
              Create Quiz
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
