import { prisma } from "@/src/lib/prisma";
import { generateRoomCode } from "@/src/lib/utils";
import { SessionStatus } from "@prisma/client";

export async function createSession(quizId: string, hostId: string) {
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, ownerId: hostId },
    include: { questions: true },
  });

  if (!quiz) {
    throw new Error("Quiz not found or access denied");
  }

  if (quiz.questions.length === 0) {
    throw new Error("Quiz must have at least one question");
  }

  let roomCode: string;
  let attempts = 0;

  do {
    roomCode = generateRoomCode();
    const existing = await prisma.session.findUnique({ where: { roomCode } });
    if (!existing) break;
    attempts++;
  } while (attempts < 10);

  if (attempts >= 10) {
    throw new Error("Failed to generate unique room code");
  }

  return prisma.session.create({
    data: {
      quizId,
      hostId,
      roomCode,
      status: SessionStatus.LOBBY,
    },
    include: {
      quiz: { select: { title: true } },
    },
  });
}

export async function getSessionByRoomCode(roomCode: string) {
  return prisma.session.findUnique({
    where: { roomCode },
    include: {
      quiz: {
        select: { title: true, description: true },
      },
      host: { select: { email: true } },
      participants: {
        include: { user: { select: { id: true, email: true } } },
      },
    },
  });
}

export async function getSessionById(id: string) {
  return prisma.session.findUnique({
    where: { id },
    include: {
      quiz: {
        include: {
          questions: {
            include: { options: true },
            orderBy: { order: "asc" },
          },
        },
      },
      host: { select: { id: true, email: true } },
      participants: {
        include: { user: { select: { id: true, email: true } } },
      },
      scores: {
        include: { user: { select: { email: true } } },
        orderBy: { points: "desc" },
      },
    },
  });
}

export async function getSessionsByHost(hostId: string) {
  return prisma.session.findMany({
    where: { hostId },
    include: {
      quiz: { select: { title: true } },
      _count: { select: { participants: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSessionsByParticipant(userId: string) {
  return prisma.sessionParticipant.findMany({
    where: { userId },
    include: {
      session: {
        include: {
          quiz: { select: { title: true } },
          host: { select: { email: true } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });
}

export async function joinSession(roomCode: string, userId: string) {
  const session = await prisma.session.findUnique({
    where: { roomCode },
  });

  if (!session) {
    throw new Error("Session not found");
  }

  if (session.status === SessionStatus.FINISHED) {
    throw new Error("Session has ended");
  }

  const existingParticipant = await prisma.sessionParticipant.findUnique({
    where: { sessionId_userId: { sessionId: session.id, userId } },
  });

  if (!existingParticipant) {
    await prisma.sessionParticipant.create({
      data: { sessionId: session.id, userId },
    });

    await prisma.score.upsert({
      where: { sessionId_userId: { sessionId: session.id, userId } },
      update: {},
      create: { sessionId: session.id, userId, points: 0 },
    });
  }

  return session;
}

export async function getSessionResults(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      quiz: { select: { title: true } },
      scores: {
        include: { user: { select: { email: true } } },
        orderBy: { points: "desc" },
      },
      answers: {
        include: {
          user: { select: { email: true } },
          question: { select: { prompt: true, points: true } },
        },
      },
      _count: { select: { participants: true } },
    },
  });

  return session;
}
