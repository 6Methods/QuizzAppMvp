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
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-body-text">Create New Quiz</h1>
          <Link href="/quizzes">
            <Button variant="ghost">Cancel</Button>
          </Link>
        </header>

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
                className="block text-sm font-medium text-body-text mb-1.5"
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
                className="w-full px-4 py-2.5 border-2 border-primary-light rounded-q-sm bg-white text-body-text placeholder:text-body-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 ease-quiz resize-none"
              />
            </div>

            {error && (
              <p className="text-coral-bold text-sm text-center">{error}</p>
            )}

            <div className="flex gap-3">
              <Button type="submit" isLoading={isLoading} className="flex-1">
                Create Quiz
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
