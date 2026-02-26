import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/src/lib/auth";
import { getQuizzesByOwner } from "@/src/features/quiz/service";

type QuizListItem = Awaited<ReturnType<typeof getQuizzesByOwner>>[number];
import {
  getSessionsByHost,
  getSessionsByParticipant,
} from "@/src/features/session/service";

type SessionListItem = Awaited<ReturnType<typeof getSessionsByHost>>[number];
type ParticipationItem = Awaited<ReturnType<typeof getSessionsByParticipant>>[number];
import { Card } from "@/src/ui/components/Card";
import { Button } from "@/src/ui/components/Button";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const isOrganizer = user.role === "ORGANIZER";

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 bg-primary rounded-full inline-block" />
              <span className="text-lg font-bold text-primary">QuizFlow</span>
            </div>
            <h1 className="text-3xl font-bold text-body-text">Dashboard</h1>
            <p className="text-body-muted">
              Welcome, {user.email}{" "}
              <span className="inline-block px-2 py-0.5 bg-primary-light text-primary text-xs font-semibold rounded-pill">
                {user.role}
              </span>
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
            <form action="/api/auth/logout" method="POST">
              <Button type="submit" variant="ghost">
                Sign Out
              </Button>
            </form>
          </div>
        </header>

        {isOrganizer ? (
          <OrganizerDashboard userId={user.id} />
        ) : (
          <ParticipantDashboard userId={user.id} />
        )}
      </div>
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
        <h2 className="text-xl font-semibold text-body-text mb-4">
          Recent Quizzes
        </h2>
        {quizzes.length === 0 ? (
          <p className="text-body-muted">
            No quizzes yet. Create your first quiz!
          </p>
        ) : (
          <ul className="space-y-3">
            {quizzes.slice(0, 5).map((quiz: QuizListItem) => (
              <li
                key={quiz.id}
                className="flex items-center justify-between p-3 bg-primary-light rounded-q-sm"
              >
                <div>
                  <p className="font-medium text-body-text">{quiz.title}</p>
                  <p className="text-sm text-body-muted">
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
        <h2 className="text-xl font-semibold text-body-text mb-4">
          Recent Sessions
        </h2>
        {sessions.length === 0 ? (
          <p className="text-body-muted">No sessions yet. Start hosting!</p>
        ) : (
          <ul className="space-y-3">
            {sessions.slice(0, 5).map((session: SessionListItem) => (
              <li
                key={session.id}
                className="flex items-center justify-between p-3 bg-primary-light rounded-q-sm"
              >
                <div>
                  <p className="font-medium text-body-text">
                    {session.quiz.title}
                  </p>
                  <p className="text-sm text-body-muted">
                    Code: {session.roomCode} | {session._count.participants}{" "}
                    participants
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-pill font-medium ${
                      session.status === "FINISHED"
                        ? "bg-app-bg text-body-muted"
                        : session.status === "LOBBY"
                        ? "bg-yellow-soft text-yellow-bold"
                        : "bg-green-soft text-green-bold"
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
      <Card variant="elevated" className="text-center py-12">
        <h2 className="text-2xl font-bold text-body-text mb-4">
          Ready to Play?
        </h2>
        <p className="text-body-muted mb-6">
          Enter a room code to join a live quiz session
        </p>
        <Link href="/join">
          <Button size="lg">Join a Quiz</Button>
        </Link>
      </Card>

      <Card variant="bordered">
        <h2 className="text-xl font-semibold text-body-text mb-4">
          Your Quiz History
        </h2>
        {participations.length === 0 ? (
          <p className="text-body-muted">
            No quiz history yet. Join a quiz to get started!
          </p>
        ) : (
          <ul className="space-y-3">
            {participations.map((p: ParticipationItem) => (
              <li
                key={p.id}
                className="flex items-center justify-between p-3 bg-primary-light rounded-q-sm"
              >
                <div>
                  <p className="font-medium text-body-text">
                    {p.session.quiz.title}
                  </p>
                  <p className="text-sm text-body-muted">
                    Hosted by {p.session.host.email} |{" "}
                    {new Date(p.joinedAt).toLocaleDateString()}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-pill font-medium ${
                      p.session.status === "FINISHED"
                        ? "bg-app-bg text-body-muted"
                        : "bg-green-soft text-green-bold"
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
