"use client";

import { useEffect, useState } from "react";
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
  params: { sessionId: string };
}) {
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
  } = useSession(params.sessionId);

  useEffect(() => {
    fetchSession();
  }, [params.sessionId]);

  useEffect(() => {
    if (isConnected && sessionData?.roomCode && !joined) {
      joinSession(sessionData.roomCode);
    }
  }, [isConnected, sessionData?.roomCode, joined, joinSession]);

  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/sessions/${params.sessionId}`);
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
        <p className="text-ink-light">Loading session...</p>
      </div>
    );
  }

  if (loadError || !sessionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card variant="elevated" className="text-center p-8">
          <p className="text-error mb-4">
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
    <div className="min-h-screen">
      <header className="flex justify-between items-center px-8 py-6 max-w-[1200px] mx-auto w-full">
        <div>
          <h1 className="text-2xl font-bold text-ink">{sessionData.quiz.title}</h1>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-lg font-mono bg-primary-50 text-primary-700 px-4 py-1 rounded-full font-semibold">
              Room: {sessionData.roomCode}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                isConnected
                  ? "bg-success-soft text-green-700"
                  : "bg-error-soft text-error"
              }`}
            >
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
        <Button variant="ghost" onClick={() => router.push("/dashboard")}>
          Exit
        </Button>
      </header>

      <main className="px-8 pb-12 max-w-[1200px] mx-auto">
        {error && (
          <div className="mb-4 p-4 bg-error-soft border border-error/20 text-error rounded-2xl">
            {error}
            <button onClick={clearError} className="ml-2 underline">
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {(!sessionState || sessionState.status === "LOBBY") && (
              <Card variant="elevated" className="text-center py-12 pattern-stripes">
                <h2 className="text-2xl font-bold mb-4 text-ink">Waiting for Players</h2>
                <p className="text-ink-light mb-2">
                  Share the room code with participants:
                </p>
                <p className="text-5xl font-mono font-bold text-primary-500 mb-6">
                  {sessionData.roomCode}
                </p>
                <p className="text-ink-light mb-6">
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
                  <p className="text-error text-sm mt-2">
                    Quiz has no questions!
                  </p>
                )}
              </Card>
            )}

            {sessionState?.status === "QUESTION" && currentQuestion && (
              <Card variant="elevated">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-xs font-bold text-ink-light uppercase tracking-wider">
                      Question {currentQuestion.order} of {totalQuestions}
                    </div>
                  </div>
                  <Timer
                    endsAt={currentQuestion.endsAt}
                    onTimeUp={revealAnswer}
                  />
                </div>

                <div className="w-full h-1.5 bg-page rounded-full overflow-hidden mb-6">
                  <div
                    className="h-full bg-primary-500 rounded-full relative progress-stripes"
                    style={{
                      width: `${(currentQuestion.order / totalQuestions) * 100}%`,
                    }}
                  />
                </div>

                <h2 className="text-2xl font-bold mb-6 text-ink text-center">
                  {currentQuestion.prompt}
                </h2>

                {currentQuestion.imageUrl && (
                  <img
                    src={currentQuestion.imageUrl}
                    alt="Question"
                    className="max-h-64 mx-auto rounded-2xl mb-6"
                  />
                )}

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {currentQuestion.options.map((option) => (
                    <div
                      key={option.id}
                      className="p-4 bg-page rounded-2xl font-medium text-ink"
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
                <div className="flex items-center justify-between mb-6">
                  <div className="text-xs font-bold text-ink-light uppercase tracking-wider">
                    Question {sessionState.currentQuestionOrder} — Results
                  </div>
                </div>

                <h2 className="text-2xl font-bold mb-6 text-ink text-center">
                  {currentQuestionData.prompt}
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {currentQuestionData.options.map((option) => (
                    <div
                      key={option.id}
                      className={`p-4 rounded-2xl font-medium border-2 ${
                        option.isCorrect
                          ? "bg-success-soft border-success text-green-800"
                          : "bg-page border-transparent text-ink-light"
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
                <h2 className="text-3xl font-bold mb-4 text-ink">Quiz Finished!</h2>
                <p className="text-ink-light mb-6">
                  Thank you for hosting this quiz session.
                </p>
                <div className="flex justify-center gap-3">
                  <Button
                    onClick={() =>
                      router.push(`/results/${params.sessionId}`)
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
              <h3 className="font-semibold mb-3 text-ink">
                Participants ({participants.length})
              </h3>
              <ul className="space-y-2 max-h-48 overflow-y-auto">
                {participants.length === 0 ? (
                  <li className="text-ink-light text-sm">
                    Waiting for participants...
                  </li>
                ) : (
                  participants.map((p) => (
                    <li
                      key={p.id}
                      className="text-sm bg-page px-4 py-2.5 rounded-xl font-medium"
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
      </main>
    </div>
  );
}
