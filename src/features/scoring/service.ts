import { prisma } from "@/src/lib/prisma";

export async function getLeaderboard(sessionId: string) {
  const scores = await prisma.score.findMany({
    where: { sessionId },
    include: { user: { select: { id: true, email: true } } },
    orderBy: { points: "desc" },
  });

  return scores.map((score, index) => ({
    rank: index + 1,
    userId: score.userId,
    email: score.user.email,
    points: score.points,
  }));
}

export async function getUserScore(sessionId: string, userId: string) {
  return prisma.score.findUnique({
    where: { sessionId_userId: { sessionId, userId } },
  });
}

export async function getUserAnswers(sessionId: string, userId: string) {
  return prisma.answer.findMany({
    where: { sessionId, userId },
    include: {
      question: {
        select: { prompt: true, points: true, order: true },
      },
    },
    orderBy: { question: { order: "asc" } },
  });
}

export async function getQuestionStats(sessionId: string, questionId: string) {
  const answers = await prisma.answer.findMany({
    where: { sessionId, questionId },
  });

  const total = answers.length;
  const correct = answers.filter((a) => a.isCorrect).length;

  return {
    totalAnswers: total,
    correctAnswers: correct,
    accuracy: total > 0 ? (correct / total) * 100 : 0,
  };
}

export async function getSessionStats(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      participants: true,
      answers: true,
      quiz: {
        include: { questions: true },
      },
    },
  });

  if (!session) {
    return null;
  }

  const totalQuestions = session.quiz.questions.length;
  const totalParticipants = session.participants.length;
  const totalAnswers = session.answers.length;
  const correctAnswers = session.answers.filter((a) => a.isCorrect).length;
  const totalPointsAwarded = session.answers.reduce(
    (sum, a) => sum + a.awardedPoints,
    0
  );

  return {
    totalQuestions,
    totalParticipants,
    totalAnswers,
    correctAnswers,
    averageAccuracy:
      totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0,
    totalPointsAwarded,
    averagePointsPerParticipant:
      totalParticipants > 0 ? totalPointsAwarded / totalParticipants : 0,
  };
}
