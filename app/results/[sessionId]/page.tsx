import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/src/lib/auth";
import { getSessionResults } from "@/src/features/session/service";
import {
  getSessionStats,
  getUserAnswers,
  getUserScore,
} from "@/src/features/scoring/service";
import { Card } from "@/src/ui/components/Card";
import { Button } from "@/src/ui/components/Button";
import { Leaderboard } from "@/src/ui/components/Leaderboard";

export default async function ResultsPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [session, stats, userScore, userAnswers] = await Promise.all([
    getSessionResults(params.sessionId),
    getSessionStats(params.sessionId),
    getUserScore(params.sessionId, user.id),
    getUserAnswers(params.sessionId, user.id),
  ]);

  if (!session) {
    redirect("/dashboard");
  }

  const leaderboard = session.scores.map((s: any, idx: number) => ({
    rank: idx + 1,
    email: s.user.email,
    points: s.points,
  }));

  const userRank =
    leaderboard.findIndex((e: any) => e.email === user.email) + 1;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-body-text">Quiz Results</h1>
            <p className="text-body-muted">{session.quiz.title}</p>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost">Back to Dashboard</Button>
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card variant="elevated" className="text-center">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-body-muted text-sm">Your Rank</p>
            <p className="text-3xl font-bold text-body-text">
              {userRank > 0 ? `#${userRank}` : "N/A"}
            </p>
          </Card>

          <Card variant="elevated" className="text-center">
            <div className="text-4xl mb-2">⭐</div>
            <p className="text-body-muted text-sm">Your Score</p>
            <p className="text-3xl font-bold text-body-text">
              {userScore?.points || 0}
            </p>
          </Card>

          <Card variant="elevated" className="text-center">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-body-muted text-sm">Correct Answers</p>
            <p className="text-3xl font-bold text-body-text">
              {userAnswers.filter((a: any) => a.isCorrect).length} /{" "}
              {userAnswers.length}
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Leaderboard entries={leaderboard} currentUserEmail={user.email} />
          </div>

          <Card variant="bordered">
            <h2 className="text-xl font-semibold text-body-text mb-4">
              Session Statistics
            </h2>
            {stats && (
              <dl className="space-y-3">
                <div className="flex justify-between py-1 border-b border-primary-light">
                  <dt className="text-body-muted">Total Participants</dt>
                  <dd className="font-semibold text-body-text">
                    {stats.totalParticipants}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-primary-light">
                  <dt className="text-body-muted">Total Questions</dt>
                  <dd className="font-semibold text-body-text">
                    {stats.totalQuestions}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-primary-light">
                  <dt className="text-body-muted">Total Answers</dt>
                  <dd className="font-semibold text-body-text">
                    {stats.totalAnswers}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-primary-light">
                  <dt className="text-body-muted">Average Accuracy</dt>
                  <dd className="font-semibold text-body-text">
                    {stats.averageAccuracy.toFixed(1)}%
                  </dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-body-muted">Total Points Awarded</dt>
                  <dd className="font-semibold text-body-text">
                    {stats.totalPointsAwarded}
                  </dd>
                </div>
              </dl>
            )}
          </Card>
        </div>

        {userAnswers.length > 0 && (
          <Card variant="bordered" className="mt-8">
            <h2 className="text-xl font-semibold text-body-text mb-4">
              Your Answers
            </h2>
            <div className="space-y-3">
              {userAnswers.map((answer: any) => (
                <div
                  key={answer.id}
                  className={`p-4 rounded-q-sm border-2 ${
                    answer.isCorrect
                      ? "border-green-bold/30 bg-green-soft"
                      : "border-coral-bold/30 bg-coral-soft"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-body-text">
                      Q{answer.question.order}:{" "}
                      {answer.question.prompt.slice(0, 50)}
                      {answer.question.prompt.length > 50 ? "..." : ""}
                    </span>
                    <span
                      className={
                        answer.isCorrect
                          ? "text-green-bold font-semibold"
                          : "text-coral-bold font-semibold"
                      }
                    >
                      {answer.isCorrect
                        ? `+${answer.awardedPoints} pts`
                        : "0 pts"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
