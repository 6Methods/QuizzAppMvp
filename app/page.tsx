import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="w-3 h-3 bg-primary rounded-full inline-block" />
          <h1 className="text-5xl font-bold text-primary tracking-tight">
            QuizFlow
          </h1>
        </div>
        <p className="text-xl text-body-muted mb-10 font-medium">
          Create and host interactive quizzes in real-time. Engage your audience
          with live questions, instant feedback, and competitive leaderboards.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center px-10 py-4 bg-primary text-white font-semibold rounded-pill shadow-btn-primary hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-btn-primary-hover transition-all duration-300 ease-quiz"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center px-10 py-4 bg-white text-primary font-semibold rounded-pill border-2 border-primary shadow-card hover:-translate-y-0.5 hover:shadow-soft transition-all duration-300 ease-quiz"
          >
            Create Account
          </Link>
        </div>

        
      </div>
    </div>
  );
}
