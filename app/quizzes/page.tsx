import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/src/lib/auth";
import { getQuizzesByOwner } from "@/src/features/quiz/service";
import { Card } from "@/src/ui/components/Card";
import { Button } from "@/src/ui/components/Button";

export default async function QuizzesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "ORGANIZER") {
    redirect("/dashboard");
  }

  const quizzes = await getQuizzesByOwner(user.id);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-body-text">My Quizzes</h1>
            <p className="text-body-muted">Manage and create quizzes</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard">
              <Button variant="ghost">Back</Button>
            </Link>
            <Link href="/quizzes/new">
              <Button>Create Quiz</Button>
            </Link>
          </div>
        </header>

        {quizzes.length === 0 ? (
          <Card variant="bordered" className="text-center py-12">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-body-text mb-2">
              No quizzes yet
            </h2>
            <p className="text-body-muted mb-6">
              Create your first quiz to start hosting sessions
            </p>
            <Link href="/quizzes/new">
              <Button>Create Your First Quiz</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4">
            {quizzes.map((quiz) => (
              <Card
                key={quiz.id}
                variant="bordered"
                className="hover:shadow-soft transition-all duration-300 ease-quiz"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-body-text">
                      {quiz.title}
                    </h2>
                    {quiz.description && (
                      <p className="text-body-muted mt-1">{quiz.description}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-sm text-body-muted">
                      <span>{quiz._count.questions} questions</span>
                      <span>{quiz._count.sessions} sessions</span>
                      <span>
                        Updated {new Date(quiz.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/quizzes/${quiz.id}/edit`}>
                      <Button variant="secondary" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <StartSessionButton quizId={quiz.id} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StartSessionButton({ quizId }: { quizId: string }) {
  return (
    <form
      action={async () => {
        "use server";
        const { redirect } = await import("next/navigation");
        const { getCurrentUser } = await import("@/src/lib/auth");
        const { createSession } = await import(
          "@/src/features/session/service"
        );

        const user = await getCurrentUser();
        if (!user) return;

        const session = await createSession(quizId, user.id);
        redirect(`/host/${session.id}`);
      }}
    >
      <Button type="submit" size="sm">
        Start Session
      </Button>
    </form>
  );
}
