"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/src/ui/components/Button";
import { Input } from "@/src/ui/components/Input";
import { Card } from "@/src/ui/components/Card";

interface Option {
  id?: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id?: string;
  order: number;
  type: "TEXT" | "IMAGE";
  prompt: string;
  imageUrl?: string | null;
  isMulti: boolean;
  timeLimitSec: number;
  points: number;
  options: Option[];
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export default function EditQuizPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchQuiz();
  }, [params.id]);

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`/api/quizzes/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setQuiz(data.data);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to load quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuizDetails = async () => {
    if (!quiz) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/quizzes/${quiz.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: quiz.title,
          description: quiz.description,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error);
      }
    } catch {
      setError("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const addQuestion = () => {
    if (!quiz) return;
    const newOrder = quiz.questions.length + 1;
    setQuiz({
      ...quiz,
      questions: [
        ...quiz.questions,
        {
          order: newOrder,
          type: "TEXT",
          prompt: "",
          isMulti: false,
          timeLimitSec: 30,
          points: 100,
          options: [
            { text: "", isCorrect: true },
            { text: "", isCorrect: false },
          ],
        },
      ],
    });
  };

  const saveQuestion = async (question: Question, index: number) => {
    if (!quiz) return;
    setIsSaving(true);
    try {
      if (question.id) {
        const res = await fetch(`/api/questions/${question.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(question),
        });
        const data = await res.json();
        if (!data.success) {
          setError(data.error);
          return;
        }
        const newQuestions = [...quiz.questions];
        newQuestions[index] = data.data;
        setQuiz({ ...quiz, questions: newQuestions });
      } else {
        const res = await fetch(`/api/quizzes/${quiz.id}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(question),
        });
        const data = await res.json();
        if (!data.success) {
          setError(data.error);
          return;
        }
        const newQuestions = [...quiz.questions];
        newQuestions[index] = data.data;
        setQuiz({ ...quiz, questions: newQuestions });
      }
    } catch {
      setError("Failed to save question");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteQuestion = async (question: Question, index: number) => {
    if (!quiz) return;
    if (!confirm("Delete this question?")) return;

    if (question.id) {
      try {
        await fetch(`/api/questions/${question.id}`, { method: "DELETE" });
      } catch {
        setError("Failed to delete");
        return;
      }
    }

    const newQuestions = quiz.questions.filter((_, i) => i !== index);
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    if (!quiz) return;
    const newQuestions = [...quiz.questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const updateOption = (
    qIndex: number,
    oIndex: number,
    updates: Partial<Option>
  ) => {
    if (!quiz) return;
    const newQuestions = [...quiz.questions];
    const newOptions = [...newQuestions[qIndex].options];
    newOptions[oIndex] = { ...newOptions[oIndex], ...updates };
    newQuestions[qIndex] = { ...newQuestions[qIndex], options: newOptions };
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const addOption = (qIndex: number) => {
    if (!quiz) return;
    const newQuestions = [...quiz.questions];
    newQuestions[qIndex].options.push({ text: "", isCorrect: false });
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    if (!quiz || quiz.questions[qIndex].options.length <= 2) return;
    const newQuestions = [...quiz.questions];
    newQuestions[qIndex].options = newQuestions[qIndex].options.filter(
      (_, i) => i !== oIndex
    );
    setQuiz({ ...quiz, questions: newQuestions });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink-light">Loading...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-error">{error || "Quiz not found"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="flex justify-between items-center px-8 py-6 max-w-[1200px] mx-auto w-full">
        <div className="font-bold text-2xl text-ink flex items-center gap-2">
          <span className="text-primary-500">●</span> QuizFlow
        </div>
        <div className="flex gap-3">
          <Link href="/quizzes">
            <Button variant="ghost">Back</Button>
          </Link>
          <StartSessionButton quizId={quiz.id} />
        </div>
      </header>

      <main className="px-8 pb-12 max-w-[1000px] mx-auto">
        <h1 className="text-3xl font-bold text-ink mb-8">Edit Quiz</h1>

        {error && (
          <div className="mb-4 p-4 bg-error-soft border border-error/20 text-error rounded-2xl">
            {error}
            <button onClick={() => setError("")} className="ml-2 underline">
              Dismiss
            </button>
          </div>
        )}

        <Card variant="bordered" className="mb-6">
          <h2 className="text-lg font-semibold mb-4 text-ink">Quiz Details</h2>
          <div className="space-y-4">
            <Input
              label="Title"
              value={quiz.title}
              onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
              onBlur={updateQuizDetails}
            />
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Description
              </label>
              <textarea
                value={quiz.description || ""}
                onChange={(e) =>
                  setQuiz({ ...quiz, description: e.target.value })
                }
                onBlur={updateQuizDetails}
                rows={2}
                className="w-full px-4 py-2.5 border-2 border-ink/10 rounded-2xl transition-colors focus:outline-none focus:ring-0 focus:border-primary-500"
              />
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">
              Questions ({quiz.questions.length})
            </h2>
            <Button onClick={addQuestion} variant="secondary">
              Add Question
            </Button>
          </div>

          {quiz.questions.map((question, qIndex) => (
            <Card key={question.id || qIndex} variant="bordered">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">Question {qIndex + 1}</span>
                  <div className="flex gap-2">
                    <select
                      value={question.type}
                      onChange={(e) =>
                        updateQuestion(qIndex, {
                          type: e.target.value as "TEXT" | "IMAGE",
                        })
                      }
                      className="px-3 py-1.5 border-2 border-ink/10 rounded-full text-sm font-medium focus:outline-none focus:border-primary-500"
                    >
                      <option value="TEXT">Text</option>
                      <option value="IMAGE">Image</option>
                    </select>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteQuestion(question, qIndex)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <Input
                  label="Question"
                  value={question.prompt}
                  onChange={(e) =>
                    updateQuestion(qIndex, { prompt: e.target.value })
                  }
                  placeholder="Enter your question"
                />

                {question.type === "IMAGE" && (
                  <Input
                    label="Image URL"
                    value={question.imageUrl || ""}
                    onChange={(e) =>
                      updateQuestion(qIndex, { imageUrl: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">
                      Time Limit (sec)
                    </label>
                    <input
                      type="number"
                      value={question.timeLimitSec}
                      onChange={(e) =>
                        updateQuestion(qIndex, {
                          timeLimitSec: parseInt(e.target.value) || 30,
                        })
                      }
                      min={5}
                      max={300}
                      className="w-full px-4 py-2.5 border-2 border-ink/10 rounded-2xl focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">
                      Points
                    </label>
                    <input
                      type="number"
                      value={question.points}
                      onChange={(e) =>
                        updateQuestion(qIndex, {
                          points: parseInt(e.target.value) || 100,
                        })
                      }
                      min={1}
                      max={1000}
                      className="w-full px-4 py-2.5 border-2 border-ink/10 rounded-2xl focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">
                      Selection
                    </label>
                    <select
                      value={question.isMulti ? "multi" : "single"}
                      onChange={(e) =>
                        updateQuestion(qIndex, {
                          isMulti: e.target.value === "multi",
                        })
                      }
                      className="w-full px-4 py-2.5 border-2 border-ink/10 rounded-2xl focus:outline-none focus:border-primary-500"
                    >
                      <option value="single">Single choice</option>
                      <option value="multi">Multiple choice</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-ink">
                      Options
                    </label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => addOption(qIndex)}
                    >
                      + Add Option
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <input
                          type={question.isMulti ? "checkbox" : "radio"}
                          name={`correct-${qIndex}`}
                          checked={option.isCorrect}
                          onChange={() => {
                            if (question.isMulti) {
                              updateOption(qIndex, oIndex, {
                                isCorrect: !option.isCorrect,
                              });
                            } else {
                              const newOptions = question.options.map(
                                (o, i) => ({
                                  ...o,
                                  isCorrect: i === oIndex,
                                })
                              );
                              updateQuestion(qIndex, { options: newOptions });
                            }
                          }}
                          className="h-4 w-4 accent-primary-500"
                        />
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) =>
                            updateOption(qIndex, oIndex, {
                              text: e.target.value,
                            })
                          }
                          placeholder={`Option ${oIndex + 1}`}
                          className="flex-1 px-4 py-2.5 border-2 border-ink/10 rounded-2xl focus:outline-none focus:border-primary-500"
                        />
                        {question.options.length > 2 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(qIndex, oIndex)}
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => saveQuestion(question, qIndex)}
                  isLoading={isSaving}
                  className="w-full"
                >
                  {question.id ? "Save Changes" : "Create Question"}
                </Button>
              </div>
            </Card>
          ))}

          {quiz.questions.length === 0 && (
            <Card variant="elevated" className="text-center py-8 pattern-stripes">
              <p className="text-ink-light mb-4">No questions yet</p>
              <Button onClick={addQuestion}>Add Your First Question</Button>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

function StartSessionButton({ quizId }: { quizId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/host/${data.data.id}`);
      }
    } catch {
      console.error("Failed to start session");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleStart} isLoading={isLoading}>
      Start Session
    </Button>
  );
}
