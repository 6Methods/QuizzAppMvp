import { Server, Socket } from "socket.io";
import { PrismaClient, SessionStatus } from "@prisma/client";

interface ActiveQuestion {
  sessionId: string;
  questionId: string;
  questionOrder: number;
  startedAt: Date;
  endsAt: Date;
  timerId: NodeJS.Timeout;
}

export class SessionManager {
  private prisma: PrismaClient;
  private io: Server;
  private activeQuestions: Map<string, ActiveQuestion> = new Map();
  private socketToSession: Map<string, string> = new Map();

  constructor(prisma: PrismaClient, io: Server) {
    this.prisma = prisma;
    this.io = io;
  }

  getRoomName(sessionId: string): string {
    return `session:${sessionId}`;
  }

  async joinSession(
    socket: Socket,
    roomCode: string
  ): Promise<{ sessionId: string } | { error: string }> {
    const session = await this.prisma.session.findUnique({
      where: { roomCode },
      include: {
        quiz: { select: { title: true } },
        participants: {
          include: { user: { select: { id: true, email: true } } },
        },
      },
    });

    if (!session) {
      return { error: "Session not found" };
    }

    if (session.status === SessionStatus.FINISHED) {
      return { error: "Session has ended" };
    }

    const userId = socket.data.userId;
    const isHost = session.hostId === userId;

    if (!isHost) {
      const existingParticipant =
        await this.prisma.sessionParticipant.findUnique({
          where: { sessionId_userId: { sessionId: session.id, userId } },
        });

      if (!existingParticipant) {
        await this.prisma.sessionParticipant.create({
          data: { sessionId: session.id, userId },
        });

        await this.prisma.score.upsert({
          where: { sessionId_userId: { sessionId: session.id, userId } },
          update: {},
          create: { sessionId: session.id, userId, points: 0 },
        });
      }
    }

    const roomName = this.getRoomName(session.id);
    socket.join(roomName);
    this.socketToSession.set(socket.id, session.id);

    await this.broadcastLobbyUpdate(session.id);
    await this.sendSessionState(socket, session.id);

    return { sessionId: session.id };
  }

  async broadcastLobbyUpdate(sessionId: string): Promise<void> {
    const participants = await this.prisma.sessionParticipant.findMany({
      where: { sessionId },
      include: { user: { select: { id: true, email: true } } },
    });

    const roomName = this.getRoomName(sessionId);
    this.io.to(roomName).emit("session:lobbyUpdate", {
      participants: participants.map((p: { user: { id: string, email: string }, joinedAt: Date }) => ({
        id: p.user.id,
        email: p.user.email,
        joinedAt: p.joinedAt,
      })),
    });
  }

  async sendSessionState(socket: Socket, sessionId: string): Promise<void> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) return;

    socket.emit("session:state", {
      status: session.status,
      currentQuestionOrder: session.currentQuestionOrder,
      questionStartedAt: session.questionStartedAt?.toISOString(),
      questionEndsAt: session.questionEndsAt?.toISOString(),
    });
  }

  async broadcastSessionState(sessionId: string): Promise<void> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) return;

    const roomName = this.getRoomName(sessionId);
    this.io.to(roomName).emit("session:state", {
      status: session.status,
      currentQuestionOrder: session.currentQuestionOrder,
      questionStartedAt: session.questionStartedAt?.toISOString(),
      questionEndsAt: session.questionEndsAt?.toISOString(),
    });
  }

  async startQuestion(
    sessionId: string,
    questionOrder: number
  ): Promise<{ error?: string }> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        quiz: {
          include: {
            questions: {
              where: { order: questionOrder },
              include: { options: true },
            },
          },
        },
      },
    });

    if (!session) {
      return { error: "Session not found" };
    }

    const question = session.quiz.questions[0];
    if (!question) {
      return { error: "Question not found" };
    }

    const startedAt = new Date();
    const endsAt = new Date(startedAt.getTime() + question.timeLimitSec * 1000);

    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.QUESTION,
        currentQuestionOrder: questionOrder,
        questionStartedAt: startedAt,
        questionEndsAt: endsAt,
      },
    });

    const roomName = this.getRoomName(sessionId);

    this.io.to(roomName).emit("question:show", {
      id: question.id,
      order: question.order,
      type: question.type,
      prompt: question.prompt,
      imageUrl: question.imageUrl,
      isMulti: question.isMulti,
      timeLimitSec: question.timeLimitSec,
      points: question.points,
      options: question.options.map((o: { id: string, text: string }) => ({
        id: o.id,
        text: o.text,
      })),
      endsAt: endsAt.toISOString(),
    });

    await this.broadcastSessionState(sessionId);

    const timerId = setTimeout(() => {
      this.endQuestion(sessionId);
    }, question.timeLimitSec * 1000);

    this.activeQuestions.set(sessionId, {
      sessionId,
      questionId: question.id,
      questionOrder,
      startedAt,
      endsAt,
      timerId,
    });

    return {};
  }

  async endQuestion(sessionId: string): Promise<void> {
    const activeQ = this.activeQuestions.get(sessionId);
    if (activeQ) {
      clearTimeout(activeQ.timerId);
      this.activeQuestions.delete(sessionId);
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { status: SessionStatus.REVEAL },
    });

    await this.broadcastSessionState(sessionId);
    await this.broadcastLeaderboard(sessionId);
  }

  async submitAnswer(
    socket: Socket,
    sessionId: string,
    questionId: string,
    selectedOptionIds: string[]
  ): Promise<{ error?: string }> {
    const activeQ = this.activeQuestions.get(sessionId);

    if (!activeQ || activeQ.questionId !== questionId) {
      return { error: "Question is not active" };
    }

    if (new Date() > activeQ.endsAt) {
      return { error: "Time expired" };
    }

    const userId = socket.data.userId;

    const existingAnswer = await this.prisma.answer.findUnique({
      where: { sessionId_questionId_userId: { sessionId, questionId, userId } },
    });

    if (existingAnswer) {
      return { error: "Already answered" };
    }

    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: { options: true },
    });

    if (!question) {
      return { error: "Question not found" };
    }

    const correctOptionIds = question.options
      .filter((o: { isCorrect: boolean }) => o.isCorrect)
      .map((o: { id: string }) => o.id);

    let isCorrect: boolean;
    if (question.isMulti) {
      const sortedSelected = [...selectedOptionIds].sort();
      const sortedCorrect = [...correctOptionIds].sort();
      isCorrect =
        sortedSelected.length === sortedCorrect.length &&
        sortedSelected.every((id, i) => id === sortedCorrect[i]);
    } else {
      isCorrect =
        selectedOptionIds.length === 1 &&
        correctOptionIds.includes(selectedOptionIds[0]);
    }

    const awardedPoints = isCorrect ? question.points : 0;

    await this.prisma.answer.create({
      data: {
        sessionId,
        questionId,
        userId,
        selectedOptionIds,
        isCorrect,
        awardedPoints,
      },
    });

    if (isCorrect) {
      await this.prisma.score.upsert({
        where: { sessionId_userId: { sessionId, userId } },
        update: { points: { increment: awardedPoints } },
        create: { sessionId, userId, points: awardedPoints },
      });
    }

    socket.emit("answer:ack", { received: true });

    return {};
  }

  async broadcastLeaderboard(sessionId: string): Promise<void> {
    const scores = await this.prisma.score.findMany({
      where: { sessionId },
      include: { user: { select: { email: true } } },
      orderBy: { points: "desc" },
    });

    const roomName = this.getRoomName(sessionId);
    this.io.to(roomName).emit("leaderboard:update", {
      leaderboard: scores.map((s: { user: { email: string }, points: number }, idx: number) => ({
        rank: idx + 1,
        email: s.user.email,
        points: s.points,
      })),
    });
  }

  async revealAnswer(sessionId: string): Promise<{ error?: string }> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      select: { currentQuestionOrder: true, quizId: true },
    });

    if (!session) {
      return { error: "Session not found" };
    }

    const question = await this.prisma.question.findFirst({
      where: {
        quizId: session.quizId,
        order: session.currentQuestionOrder ?? -1,
      },
      include: { options: true },
    });

    if (!question) {
      return { error: "Question not found" };
    }

    const roomName = this.getRoomName(sessionId);
    this.io.to(roomName).emit("answer:reveal", {
      questionId: question.id,
      correctOptionIds: question.options
        .filter((o: { isCorrect: boolean }) => o.isCorrect)
        .map((o: { id: string }) => o.id),
    });

    return {};
  }

  async nextQuestion(
    sessionId: string
  ): Promise<{ error?: string; finished?: boolean }> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        quiz: {
          include: {
            questions: { orderBy: { order: "asc" } },
          },
        },
      },
    });

    if (!session) {
      return { error: "Session not found" };
    }

    const currentOrder = session.currentQuestionOrder ?? 0;
    const nextQuestion = session.quiz.questions.find(
      (q) => q.order > currentOrder
    );

    if (!nextQuestion) {
      return { finished: true };
    }

    return this.startQuestion(sessionId, nextQuestion.order);
  }

  async finishSession(sessionId: string): Promise<void> {
    const activeQ = this.activeQuestions.get(sessionId);
    if (activeQ) {
      clearTimeout(activeQ.timerId);
      this.activeQuestions.delete(sessionId);
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.FINISHED,
        endedAt: new Date(),
      },
    });

    await this.broadcastSessionState(sessionId);
    await this.broadcastLeaderboard(sessionId);

    const roomName = this.getRoomName(sessionId);
    this.io.to(roomName).emit("session:finished", {});
  }

  handleDisconnect(socket: Socket): void {
    const sessionId = this.socketToSession.get(socket.id);
    if (sessionId) {
      this.socketToSession.delete(socket.id);
    }
  }

  isActiveQuestion(sessionId: string): boolean {
    return this.activeQuestions.has(sessionId);
  }
}
