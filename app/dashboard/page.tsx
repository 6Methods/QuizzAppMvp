import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/src/lib/auth";
import { getQuizzesByOwner } from "@/src/features/quiz/service";
import {
  getSessionsByHost,
  getSessionsByParticipant,
} from "@/src/features/session/service";
import { Card } from "@/src/ui/components/Card";
import { Button } from "@/src/ui/components/Button";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const isOrganizer = user.role === "ORGANIZER";

  return (
    <div className="min-h-screen">
      <header className="flex justify-between items-center px-8 py-6 max-w-[1200px] mx-auto w-full">
        <div className="font-bold text-2xl text-ink flex items-center gap-2">
          <span className="text-primary-500">●</span> QuizFlow
        </div>
        <div className="flex gap-3 items-center">
          <div className="bg-ink text-white px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 shadow-md">
            <span className="text-coral text-xs">★</span> {user.email}
          </div>
          <form action="/api/auth/logout" method="POST">
            <Button type="submit" variant="ghost" size="sm">
              Sign Out
            </Button>
          </form>
        </div>
      </header>

      <main className="px-8 pb-12 max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-ink">Dashboard</h1>
            <p className="text-ink-light">
              Welcome back, {user.email}
            </p>
          </div>
          <div className="flex gap-3">
            {isOrganizer ? (
              <>
                <Link href="/quizzes">
                  <Button variant="secondary">My Quizzes</Button>
                </Link>
                <Link href="/quizzes/new">
                  <Button>Create Quiz</Button>
                </Link>
              </>
            ) : (
              <Link href="/join">
                <Button>Join Quiz</Button>
              </Link>
            )}
          </div>
        </div>

        {isOrganizer ? (
          <OrganizerDashboard userId={user.id} />
        ) : (
          <ParticipantDashboard userId={user.id} />
        )}
      </main>
    </div>
  );
}

async function OrganizerDashboard({ userId }: { userId: string }) {
  const [quizzes, sessions] = await Promise.all([
    getQuizzesByOwner(userId),
    getSessionsByHost(userId),
  ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card variant="bordered">
        <h2 className="text-xl font-semibold mb-4 text-ink">Recent Quizzes</h2>
        {quizzes.length === 0 ? (
          <p className="text-ink-light">
            No quizzes yet. Create your first quiz!
          </p>
        ) : (
          <ul className="space-y-3">
            {quizzes.slice(0, 5).map((quiz: any) => (
              <li
                key={quiz.id}
                className="flex items-center justify-between p-3 bg-page rounded-2xl"
              >
                <div>
                  <p className="font-medium text-ink">{quiz.title}</p>
                  <p className="text-sm text-ink-light">
                    {quiz._count.questions} questions | {quiz._count.sessions}{" "}
                    sessions
                  </p>
                </div>
                <Link href={`/quizzes/${quiz.id}/edit`}>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link href="/quizzes" className="block mt-4">
          <Button variant="secondary" className="w-full">
            View All Quizzes
          </Button>
        </Link>
      </Card>

      <Card variant="bordered">
        <h2 className="text-xl font-semibold mb-4 text-ink">Recent Sessions</h2>
        {sessions.length === 0 ? (
          <p className="text-ink-light">No sessions yet. Start hosting!</p>
        ) : (
          <ul className="space-y-3">
            {sessions.slice(0, 5).map((session: any) => (
              <li
                key={session.id}
                className="flex items-center justify-between p-3 bg-page rounded-2xl"
              >
                <div>
                  <p className="font-medium text-ink">{session.quiz.title}</p>
                  <p className="text-sm text-ink-light">
                    Code: {session.roomCode} | {session._count.participants}{" "}
                    participants
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      session.status === "FINISHED"
                        ? "bg-ink/10 text-ink-light"
                        : session.status === "LOBBY"
                        ? "bg-coral/20 text-coral"
                        : "bg-success-soft text-green-700"
                    }`}
                  >
                    {session.status}
                  </span>
                </div>
                <Link
                  href={
                    session.status === "FINISHED"
                      ? `/results/${session.id}`
                      : `/host/${session.id}`
                  }
                >
                  <Button variant="ghost" size="sm">
                    {session.status === "FINISHED" ? "Results" : "Manage"}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

async function ParticipantDashboard({ userId }: { userId: string }) {
  const participations = await getSessionsByParticipant(userId);

  return (
    <div className="grid grid-cols-1 gap-8">
      <Card variant="elevated" className="text-center py-12 pattern-stripes">
        <h2 className="text-2xl font-bold mb-4 text-ink">Ready to Play?</h2>
        <p className="text-ink-light mb-6">
          Enter a room code to join a live quiz session
        </p>
        <Link href="/join">
          <Button size="lg">Join a Quiz</Button>
        </Link>
      </Card>

      <Card variant="bordered">
        <h2 className="text-xl font-semibold mb-4 text-ink">Your Quiz History</h2>
        {participations.length === 0 ? (
          <p className="text-ink-light">
            No quiz history yet. Join a quiz to get started!
          </p>
        ) : (
          <ul className="space-y-3">
            {participations.map((p: any) => (
              <li
                key={p.id}
                className="flex items-center justify-between p-3 bg-page rounded-2xl"
              >
                <div>
                  <p className="font-medium text-ink">{p.session.quiz.title}</p>
                  <p className="text-sm text-ink-light">
                    Hosted by {p.session.host.email} |{" "}
                    {new Date(p.joinedAt).toLocaleDateString()}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.session.status === "FINISHED"
                        ? "bg-ink/10 text-ink-light"
                        : "bg-success-soft text-green-700"
                    }`}
                  >
                    {p.session.status}
                  </span>
                </div>
                <Link
                  href={
                    p.session.status === "FINISHED"
                      ? `/results/${p.session.id}`
                      : `/play/${p.session.id}`
                  }
                >
                  <Button variant="ghost" size="sm">
                    {p.session.status === "FINISHED" ? "Results" : "Rejoin"}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
