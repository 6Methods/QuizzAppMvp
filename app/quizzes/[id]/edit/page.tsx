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

  const inputBase =
    "w-full px-4 py-2.5 border-2 border-primary-light rounded-q-sm bg-white text-body-text placeholder:text-body-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 ease-quiz";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-body-muted font-medium">Loading...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-coral-bold">{error || "Quiz not found"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-body-text">Edit Quiz</h1>
          <div className="flex gap-3">
            <Link href="/quizzes">
              <Button variant="ghost">Back</Button>
            </Link>
            <StartSessionButton quizId={quiz.id} />
          </div>
        </header>

        {error && (
          <div className="mb-4 p-4 bg-coral-soft border border-coral-bold/30 text-coral-bold rounded-q-sm text-sm">
            {error}
            <button onClick={() => setError("")} className="ml-2 underline hover:no-underline">
              Dismiss
            </button>
          </div>
        )}

        <Card variant="bordered" className="mb-6">
          <h2 className="text-lg font-semibold text-body-text mb-4">
            Quiz Details
          </h2>
          <div className="space-y-4">
            <Input
              label="Title"
              value={quiz.title}
              onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
              onBlur={updateQuizDetails}
            />
            <div>
              <label className="block text-sm font-medium text-body-text mb-1.5">
                Description
              </label>
              <textarea
                value={quiz.description || ""}
                onChange={(e) =>
                  setQuiz({ ...quiz, description: e.target.value })
                }
                onBlur={updateQuizDetails}
                rows={2}
                className={`${inputBase} resize-none`}
              />
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-body-text">
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
                  <span className="font-semibold text-body-text">
                    Question {qIndex + 1}
                  </span>
                  <div className="flex gap-2">
                    <select
                      value={question.type}
                      onChange={(e) =>
                        updateQuestion(qIndex, {
                          type: e.target.value as "TEXT" | "IMAGE",
                        })
                      }
                      className="px-3 py-1.5 border-2 border-primary-light rounded-q-sm bg-white text-body-text text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 ease-quiz"
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
                    <label className="block text-sm font-medium text-body-text mb-1.5">
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
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-body-text mb-1.5">
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
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-body-text mb-1.5">
                      Selection
                    </label>
                    <select
                      value={question.isMulti ? "multi" : "single"}
                      onChange={(e) =>
                        updateQuestion(qIndex, {
                          isMulti: e.target.value === "multi",
                        })
                      }
                      className={inputBase}
                    >
                      <option value="single">Single choice</option>
                      <option value="multi">Multiple choice</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-body-text">
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
                          className="h-4 w-4 accent-primary"
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
                          className={`flex-1 ${inputBase}`}
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
            <Card variant="bordered" className="text-center py-8">
              <p className="text-body-muted mb-4">No questions yet</p>
              <Button onClick={addQuestion}>Add Your First Question</Button>
            </Card>
          )}
        </div>
      </div>
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
