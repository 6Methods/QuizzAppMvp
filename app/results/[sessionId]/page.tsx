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

  const userRank = leaderboard.findIndex((e: any) => e.email === user.email) + 1;
  const correctCount = userAnswers.filter((a: any) => a.isCorrect).length;
  const accuracy = userAnswers.length > 0
    ? Math.round((correctCount / userAnswers.length) * 100)
    : 0;

  return (
    <div className="min-h-screen">
      <header className="flex justify-between items-center px-8 py-6 max-w-[1200px] mx-auto w-full">
        <div className="font-bold text-2xl text-ink flex items-center gap-2">
          <span className="text-primary-500">●</span> QuizFlow
        </div>
        <Link href="/dashboard">
          <Button variant="ghost">Back to Dashboard</Button>
        </Link>
      </header>

      <main className="px-8 pb-12 max-w-[1000px] mx-auto">
        <section className="bg-white rounded-3xl shadow-card p-8 flex flex-col md:flex-row items-center gap-8 border border-black/5 mb-8">
          <div className="w-[120px] h-[120px] rounded-full border-[8px] border-primary-500 flex flex-col items-center justify-center shrink-0">
            <span className="text-[32px] font-extrabold text-ink leading-none">
              {accuracy}%
            </span>
            <span className="text-xs text-ink-light uppercase mt-1">Score</span>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold text-ink mb-2">
              {session.quiz.title}
            </h3>
            <p className="text-ink-light mb-4">
              You scored {userScore?.points || 0} XP and answered {correctCount} of{" "}
              {userAnswers.length} questions correctly.
            </p>
            <div className="flex gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 bg-page rounded-xl flex items-center justify-center text-coral text-lg">
                ⚡
              </div>
              <div className="w-10 h-10 bg-page rounded-xl flex items-center justify-center text-coral text-lg">
                🎯
              </div>
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white text-lg">
                🏆
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <Link href="/dashboard">
              <Button size="sm">Play Again</Button>
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl shadow-soft text-center hover:-translate-y-0.5 transition-transform">
            <div className="text-2xl font-bold text-ink mb-1">
              {userRank > 0 ? `#${userRank}` : "N/A"}
            </div>
            <div className="text-sm text-ink-light">Rank</div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-soft text-center hover:-translate-y-0.5 transition-transform">
            <div className="text-2xl font-bold text-ink mb-1">{accuracy}%</div>
            <div className="text-sm text-ink-light">Accuracy</div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-soft text-center hover:-translate-y-0.5 transition-transform">
            <div className="text-2xl font-bold text-ink mb-1">
              {userScore?.points || 0}
            </div>
            <div className="text-sm text-ink-light">Points</div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-soft text-center hover:-translate-y-0.5 transition-transform">
            <div className="text-2xl font-bold text-ink mb-1">
              {correctCount}/{userAnswers.length}
            </div>
            <div className="text-sm text-ink-light">Correct</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Leaderboard entries={leaderboard} currentUserEmail={user.email} />

          <Card variant="bordered">
            <h2 className="text-xl font-semibold mb-4 text-ink">
              Session Statistics
            </h2>
            {stats && (
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-ink-light">Total Participants</dt>
                  <dd className="font-semibold text-ink">{stats.totalParticipants}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-light">Total Questions</dt>
                  <dd className="font-semibold text-ink">{stats.totalQuestions}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-light">Total Answers</dt>
                  <dd className="font-semibold text-ink">{stats.totalAnswers}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-light">Average Accuracy</dt>
                  <dd className="font-semibold text-ink">
                    {stats.averageAccuracy.toFixed(1)}%
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-light">Total Points Awarded</dt>
                  <dd className="font-semibold text-ink">{stats.totalPointsAwarded}</dd>
                </div>
              </dl>
            )}
          </Card>
        </div>

        {userAnswers.length > 0 && (
          <Card variant="bordered" className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-ink">Your Answers</h2>
            <div className="space-y-3">
              {userAnswers.map((answer: any) => (
                <div
                  key={answer.id}
                  className={`p-4 rounded-2xl border-2 ${
                    answer.isCorrect
                      ? "border-success/30 bg-success-soft"
                      : "border-error/30 bg-error-soft"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-ink">
                      Q{answer.question.order}:{" "}
                      {answer.question.prompt.slice(0, 50)}
                      {answer.question.prompt.length > 50 ? "..." : ""}
                    </span>
                    <span
                      className={`font-semibold ${
                        answer.isCorrect ? "text-green-700" : "text-error"
                      }`}
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
      </main>
    </div>
  );
}
