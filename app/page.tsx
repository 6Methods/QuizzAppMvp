import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex justify-between items-center px-8 py-6 max-w-[1200px] mx-auto w-full">
        <div className="font-bold text-2xl text-ink flex items-center gap-2">
          <span className="text-primary-500">●</span> QuizFlow
        </div>
        <div className="flex gap-4 items-center">
          <Link
            href="/auth/login"
            className="text-ink-light font-medium hover:text-primary-500 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="px-6 py-2.5 bg-primary-500 text-white font-semibold rounded-full shadow-float hover:shadow-float-lg hover:-translate-y-0.5 transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-[800px]">
          <section className="bg-white rounded-3xl p-12 shadow-card text-center relative overflow-hidden border border-white/50 pattern-stripes">
            <h1 className="text-5xl font-bold text-ink mb-4 tracking-tight">
              Play. Learn. Improve.
            </h1>
            <p className="text-lg text-ink-light mb-8 max-w-[500px] mx-auto">
              Master your skills with interactive quizzes designed to boost your
              professional knowledge.
            </p>
            <div className="flex gap-6 justify-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-primary-500 text-white font-semibold rounded-full shadow-float hover:shadow-float-lg hover:-translate-y-0.5 transition-all"
              >
                Start Quiz
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-transparent text-ink font-semibold rounded-full border-2 border-ink/10 hover:border-primary-500 hover:text-primary-500 hover:bg-white transition-all"
              >
                Create Own
              </Link>
            </div>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
            <div className="bg-white p-6 rounded-2xl shadow-soft text-center hover:-translate-y-0.5 transition-transform">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold text-lg mb-2 text-ink">Create Quizzes</h3>
              <p className="text-ink-light text-sm">
                Build engaging quizzes with text and image questions, multiple
                choice options, and customizable time limits.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-soft text-center hover:-translate-y-0.5 transition-transform">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold text-lg mb-2 text-ink">Real-time Play</h3>
              <p className="text-ink-light text-sm">
                Host live sessions where participants answer questions in
                real-time with synchronized timers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-soft text-center hover:-translate-y-0.5 transition-transform">
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="font-semibold text-lg mb-2 text-ink">Live Leaderboard</h3>
              <p className="text-ink-light text-sm">
                Track scores and rankings that update instantly after each
                question.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
