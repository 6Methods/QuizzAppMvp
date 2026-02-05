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
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Welcome, {user.email} ({user.role})
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
        <h2 className="text-xl font-semibold mb-4">Recent Quizzes</h2>
        {quizzes.length === 0 ? (
          <p className="text-gray-500">
            No quizzes yet. Create your first quiz!
          </p>
        ) : (
          <ul className="space-y-3">
            {quizzes.slice(0, 5).map((quiz) => (
              <li
                key={quiz.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{quiz.title}</p>
                  <p className="text-sm text-gray-500">
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
        <h2 className="text-xl font-semibold mb-4">Recent Sessions</h2>
        {sessions.length === 0 ? (
          <p className="text-gray-500">No sessions yet. Start hosting!</p>
        ) : (
          <ul className="space-y-3">
            {sessions.slice(0, 5).map((session) => (
              <li
                key={session.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{session.quiz.title}</p>
                  <p className="text-sm text-gray-500">
                    Code: {session.roomCode} | {session._count.participants}{" "}
                    participants
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      session.status === "FINISHED"
                        ? "bg-gray-200"
                        : session.status === "LOBBY"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
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
        <h2 className="text-2xl font-bold mb-4">Ready to Play?</h2>
        <p className="text-gray-600 mb-6">
          Enter a room code to join a live quiz session
        </p>
        <Link href="/join">
          <Button size="lg">Join a Quiz</Button>
        </Link>
      </Card>

      <Card variant="bordered">
        <h2 className="text-xl font-semibold mb-4">Your Quiz History</h2>
        {participations.length === 0 ? (
          <p className="text-gray-500">
            No quiz history yet. Join a quiz to get started!
          </p>
        ) : (
          <ul className="space-y-3">
            {participations.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{p.session.quiz.title}</p>
                  <p className="text-sm text-gray-500">
                    Hosted by {p.session.host.email} |{" "}
                    {new Date(p.joinedAt).toLocaleDateString()}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      p.session.status === "FINISHED"
                        ? "bg-gray-200"
                        : "bg-green-100 text-green-800"
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
