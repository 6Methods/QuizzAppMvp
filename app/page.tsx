import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Realtime Quiz App
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Create and host interactive quizzes in real-time. Engage your audience
          with live questions, instant feedback, and competitive leaderboards.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition-colors"
          >
            Create Account
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold text-lg mb-2">Create Quizzes</h3>
            <p className="text-gray-600 text-sm">
              Build engaging quizzes with text and image questions, multiple
              choice options, and customizable time limits.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold text-lg mb-2">Real-time Play</h3>
            <p className="text-gray-600 text-sm">
              Host live sessions where participants answer questions in
              real-time with synchronized timers.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="font-semibold text-lg mb-2">Live Leaderboard</h3>
            <p className="text-gray-600 text-sm">
              Track scores and rankings that update instantly after each
              question.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
