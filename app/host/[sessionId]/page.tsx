"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/src/ui/hooks/useSession";
import { Button } from "@/src/ui/components/Button";
import { Card } from "@/src/ui/components/Card";
import { Timer } from "@/src/ui/components/Timer";
import { Leaderboard } from "@/src/ui/components/Leaderboard";

interface SessionData {
  id: string;
  roomCode: string;
  status: string;
  quiz: {
    title: string;
    questions: Array<{
      id: string;
      order: number;
      prompt: string;
      type: string;
      imageUrl?: string;
      timeLimitSec: number;
      points: number;
      options: Array<{ id: string; text: string; isCorrect: boolean }>;
    }>;
  };
}

export default function HostPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const {
    isConnected,
    joined,
    participants,
    sessionState,
    currentQuestion,
    leaderboard,
    error,
    clearError,
    joinSession,
    startSession,
    nextQuestion,
    revealAnswer,
    finishSession,
  } = useSession(resolvedParams.sessionId);

  useEffect(() => {
    fetchSession();
  }, [resolvedParams.sessionId]);

  useEffect(() => {
    if (isConnected && sessionData?.roomCode && !joined) {
      joinSession(sessionData.roomCode);
    }
  }, [isConnected, sessionData?.roomCode, joined, joinSession]);

  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/sessions/${resolvedParams.sessionId}`);
      const data = await res.json();

      if (data.success) {
        setSessionData(data.data);
      } else {
        setLoadError(data.error || "Failed to load session");
      }
    } catch (err) {
      setLoadError("Failed to load session");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading session...</p>
      </div>
    );
  }

  if (loadError || !sessionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card variant="elevated" className="text-center p-8">
          <p className="text-red-500 mb-4">
            {loadError || "Session not found"}
          </p>
          <Button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const currentQuestionData = sessionData.quiz.questions.find(
    (q) => q.order === sessionState?.currentQuestionOrder
  );
  const totalQuestions = sessionData.quiz.questions.length;

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{sessionData.quiz.title}</h1>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-lg font-mono bg-primary-100 text-primary-800 px-3 py-1 rounded">
                Room: {sessionData.roomCode}
              </span>
              <span
                className={`px-2 py-1 rounded text-sm ${
                  isConnected
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              Exit
            </Button>
          </div>
        </header>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
            <button onClick={clearError} className="ml-2 underline">
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {(!sessionState || sessionState.status === "LOBBY") && (
              <Card variant="elevated" className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Waiting for Players</h2>
                <p className="text-gray-600 mb-2">
                  Share the room code with participants:
                </p>
                <p className="text-5xl font-mono font-bold text-primary-600 mb-6">
                  {sessionData.roomCode}
                </p>
                <p className="text-gray-500 mb-6">
                  {participants.length} participant
                  {participants.length !== 1 ? "s" : ""} joined
                </p>
                <Button
                  size="lg"
                  onClick={startSession}
                  disabled={participants.length === 0 || totalQuestions === 0}
                >
                  Start Quiz
                </Button>
                {totalQuestions === 0 && (
                  <p className="text-red-500 text-sm mt-2">
                    Quiz has no questions!
                  </p>
                )}
              </Card>
            )}

            {sessionState?.status === "QUESTION" && currentQuestion && (
              <Card variant="elevated">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">
                    Question {currentQuestion.order} of {totalQuestions}
                  </span>
                  <Timer
                    endsAt={currentQuestion.endsAt}
                    onTimeUp={revealAnswer}
                  />
                </div>

                <h2 className="text-2xl font-bold mb-4">
                  {currentQuestion.prompt}
                </h2>

                {currentQuestion.imageUrl && (
                  <img
                    src={currentQuestion.imageUrl}
                    alt="Question"
                    className="max-h-64 mx-auto rounded-lg mb-4"
                  />
                )}

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {currentQuestion.options.map((option) => (
                    <div
                      key={option.id}
                      className="p-4 bg-gray-100 rounded-lg font-medium"
                    >
                      {option.text}
                    </div>
                  ))}
                </div>

                <Button
                  onClick={revealAnswer}
                  variant="secondary"
                  className="w-full"
                >
                  Reveal Answer Early
                </Button>
              </Card>
            )}

            {sessionState?.status === "REVEAL" && currentQuestionData && (
              <Card variant="elevated">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">
                    Question {sessionState.currentQuestionOrder} - Results
                  </span>
                </div>

                <h2 className="text-2xl font-bold mb-4">
                  {currentQuestionData.prompt}
                </h2>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {currentQuestionData.options.map((option) => (
                    <div
                      key={option.id}
                      className={`p-4 rounded-lg font-medium border-2 ${
                        option.isCorrect
                          ? "bg-green-100 border-green-500 text-green-800"
                          : "bg-gray-100 border-gray-200"
                      }`}
                    >
                      {option.text}
                      {option.isCorrect && " ✓"}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  {sessionState.currentQuestionOrder &&
                  sessionState.currentQuestionOrder < totalQuestions ? (
                    <Button onClick={nextQuestion} className="flex-1">
                      Next Question
                    </Button>
                  ) : (
                    <Button onClick={finishSession} className="flex-1">
                      Finish Quiz
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {sessionState?.status === "FINISHED" && (
              <Card variant="elevated" className="text-center py-12">
                <h2 className="text-3xl font-bold mb-4">Quiz Finished!</h2>
                <p className="text-gray-600 mb-6">
                  Thank you for hosting this quiz session.
                </p>
                <div className="flex justify-center gap-3">
                  <Button
                    onClick={() =>
                      router.push(`/results/${resolvedParams.sessionId}`)
                    }
                  >
                    View Results
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => router.push("/dashboard")}
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card variant="bordered">
              <h3 className="font-semibold mb-3">
                Participants ({participants.length})
              </h3>
              <ul className="space-y-2 max-h-48 overflow-y-auto">
                {participants.length === 0 ? (
                  <li className="text-gray-500 text-sm">
                    Waiting for participants...
                  </li>
                ) : (
                  participants.map((p) => (
                    <li
                      key={p.id}
                      className="text-sm bg-gray-50 px-3 py-2 rounded"
                    >
                      {p.email}
                    </li>
                  ))
                )}
              </ul>
            </Card>

            {leaderboard.length > 0 && <Leaderboard entries={leaderboard} />}
          </div>
        </div>
      </div>
    </div>
  );
}
