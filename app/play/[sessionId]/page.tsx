"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/src/ui/hooks/useSession";
import { Card } from "@/src/ui/components/Card";
import { Timer } from "@/src/ui/components/Timer";
import { QuestionCard } from "@/src/ui/components/QuestionCard";
import { Leaderboard } from "@/src/ui/components/Leaderboard";
import { cn } from "@/src/lib/utils";

interface SessionInfo {
  roomCode: string;
  quizTitle: string;
}

export default function PlayPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    isConnected,
    joined,
    participants,
    sessionState,
    currentQuestion,
    leaderboard,
    revealData,
    answerSubmitted,
    error,
    clearError,
    joinSession,
    submitAnswer,
  } = useSession(params.sessionId);

  useEffect(() => {
    fetchData();
  }, [params.sessionId]);

  useEffect(() => {
    if (isConnected && sessionInfo?.roomCode && !joined) {
      joinSession(sessionInfo.roomCode);
    }
  }, [isConnected, sessionInfo?.roomCode, joined, joinSession]);

  const fetchData = async () => {
    try {
      const [userRes, sessionRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch(`/api/sessions/${params.sessionId}`),
      ]);

      const userData = await userRes.json();
      if (userData.success) {
        setUserEmail(userData.data.email);
      }

      const sessionData = await sessionRes.json();
      if (sessionData.success) {
        setSessionInfo({
          roomCode: sessionData.data.roomCode,
          quizTitle: sessionData.data.quiz.title,
        });
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = (selectedOptionIds: string[]) => {
    if (currentQuestion) {
      submitAnswer(currentQuestion.id, selectedOptionIds);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-body-muted font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-body-text">
              {sessionInfo?.quizTitle || "Quiz"}
            </h1>
            <span
              className={cn(
                "px-3 py-0.5 rounded-pill text-xs font-semibold",
                isConnected
                  ? "bg-green-soft text-green-bold"
                  : "bg-coral-soft text-coral-bold"
              )}
            >
              {isConnected ? "Connected" : "Connecting..."}
            </span>
          </div>
          {sessionState && (
            <span className="text-sm text-body-muted font-medium">
              {sessionState.status}
            </span>
          )}
        </header>

        {error && (
          <div className="mb-4 p-4 bg-coral-soft border border-coral-bold/30 text-coral-bold rounded-q-sm text-sm">
            {error}
            <button onClick={clearError} className="ml-2 underline hover:no-underline">
              Dismiss
            </button>
          </div>
        )}

        {(!sessionState || sessionState.status === "LOBBY") && (
          <Card variant="elevated" className="text-center py-12">
            <div className="text-5xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-body-text mb-2">
              Waiting for Host
            </h2>
            <p className="text-body-muted mb-6">
              The quiz will start soon. Get ready!
            </p>
            <div className="bg-primary-light rounded-q-sm p-4">
              <p className="text-sm text-body-muted mb-2 font-medium">
                Players in lobby:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {participants.map((p) => (
                  <span
                    key={p.id}
                    className={cn(
                      "px-3 py-1 rounded-pill text-sm font-medium",
                      p.email === userEmail
                        ? "bg-primary text-white"
                        : "bg-white text-body-muted"
                    )}
                  >
                    {p.email}
                    {p.email === userEmail && " (You)"}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        )}

        {sessionState?.status === "QUESTION" && currentQuestion && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-body-text">
                Question {currentQuestion.order}
              </span>
              <Timer endsAt={currentQuestion.endsAt} />
            </div>

            {answerSubmitted ? (
              <Card variant="elevated" className="text-center py-12">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-body-text mb-2">
                  Answer Submitted!
                </h2>
                <p className="text-body-muted">Waiting for the results...</p>
              </Card>
            ) : (
              <QuestionCard
                prompt={currentQuestion.prompt}
                imageUrl={currentQuestion.imageUrl}
                options={currentQuestion.options}
                isMulti={currentQuestion.isMulti}
                onSubmit={handleSubmitAnswer}
              />
            )}
          </div>
        )}

        {sessionState?.status === "REVEAL" && currentQuestion && (
          <div className="space-y-6">
            <QuestionCard
              prompt={currentQuestion.prompt}
              imageUrl={currentQuestion.imageUrl}
              options={currentQuestion.options}
              isMulti={currentQuestion.isMulti}
              onSubmit={() => {}}
              disabled
              revealedCorrectIds={revealData?.correctOptionIds}
            />

            {leaderboard.length > 0 && (
              <Leaderboard entries={leaderboard} currentUserEmail={userEmail} />
            )}
          </div>
        )}

        {sessionState?.status === "FINISHED" && (
          <Card variant="elevated" className="text-center py-12">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-body-text mb-4">
              Quiz Complete!
            </h2>

            {leaderboard.length > 0 && (
              <div className="mb-6">
                <Leaderboard
                  entries={leaderboard}
                  currentUserEmail={userEmail}
                />
              </div>
            )}

            <button
              onClick={() => router.push(`/results/${params.sessionId}`)}
              className="text-primary font-semibold hover:underline"
            >
              View Detailed Results
            </button>
          </Card>
        )}
      </div>
    </div>
  );
}
