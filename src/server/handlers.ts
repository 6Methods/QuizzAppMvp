import { Server, Socket } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { SessionManager } from "./sessionManager";

export function setupHandlers(
  socket: Socket,
  io: Server,
  prisma: PrismaClient,
  sessionManager: SessionManager
): void {
  socket.on("session:join", async (data: { roomCode: string }) => {
    try {
      const result = await sessionManager.joinSession(socket, data.roomCode);

      if ("error" in result) {
        socket.emit("session:error", { error: result.error });
      } else {
        socket.emit("session:joined", { sessionId: result.sessionId });
      }
    } catch (error) {
      console.error("Error joining session:", error);
      socket.emit("session:error", { error: "Failed to join session" });
    }
  });

  socket.on("session:start", async (data: { sessionId: string }) => {
    try {
      const session = await prisma.session.findUnique({
        where: { id: data.sessionId },
        include: {
          quiz: {
            include: { questions: { orderBy: { order: "asc" } } },
          },
        },
      });

      if (!session) {
        socket.emit("session:error", { error: "Session not found" });
        return;
      }

      if (session.hostId !== socket.data.userId) {
        socket.emit("session:error", { error: "Only host can start session" });
        return;
      }

      if (session.quiz.questions.length === 0) {
        socket.emit("session:error", { error: "Quiz has no questions" });
        return;
      }

      const firstQuestion = session.quiz.questions[0];
      const result = await sessionManager.startQuestion(
        data.sessionId,
        firstQuestion.order
      );

      if (result.error) {
        socket.emit("session:error", { error: result.error });
      }
    } catch (error) {
      console.error("Error starting session:", error);
      socket.emit("session:error", { error: "Failed to start session" });
    }
  });

  socket.on("session:nextQuestion", async (data: { sessionId: string }) => {
    try {
      const session = await prisma.session.findUnique({
        where: { id: data.sessionId },
      });

      if (!session) {
        socket.emit("session:error", { error: "Session not found" });
        return;
      }

      if (session.hostId !== socket.data.userId) {
        socket.emit("session:error", {
          error: "Only host can control session",
        });
        return;
      }

      const result = await sessionManager.nextQuestion(data.sessionId);

      if (result.error) {
        socket.emit("session:error", { error: result.error });
      } else if (result.finished) {
        await sessionManager.finishSession(data.sessionId);
      }
    } catch (error) {
      console.error("Error moving to next question:", error);
      socket.emit("session:error", {
        error: "Failed to move to next question",
      });
    }
  });

  socket.on("session:revealAnswer", async (data: { sessionId: string }) => {
    try {
      const session = await prisma.session.findUnique({
        where: { id: data.sessionId },
      });

      if (!session) {
        socket.emit("session:error", { error: "Session not found" });
        return;
      }

      if (session.hostId !== socket.data.userId) {
        socket.emit("session:error", { error: "Only host can reveal answer" });
        return;
      }

      if (sessionManager.isActiveQuestion(data.sessionId)) {
        await sessionManager.endQuestion(data.sessionId);
      }

      const result = await sessionManager.revealAnswer(data.sessionId);

      if (result.error) {
        socket.emit("session:error", { error: result.error });
      }
    } catch (error) {
      console.error("Error revealing answer:", error);
      socket.emit("session:error", { error: "Failed to reveal answer" });
    }
  });

  socket.on("session:finish", async (data: { sessionId: string }) => {
    try {
      const session = await prisma.session.findUnique({
        where: { id: data.sessionId },
      });

      if (!session) {
        socket.emit("session:error", { error: "Session not found" });
        return;
      }

      if (session.hostId !== socket.data.userId) {
        socket.emit("session:error", { error: "Only host can finish session" });
        return;
      }

      await sessionManager.finishSession(data.sessionId);
    } catch (error) {
      console.error("Error finishing session:", error);
      socket.emit("session:error", { error: "Failed to finish session" });
    }
  });

  socket.on(
    "answer:submit",
    async (data: {
      sessionId: string;
      questionId: string;
      selectedOptionIds: string[];
    }) => {
      try {
        const result = await sessionManager.submitAnswer(
          socket,
          data.sessionId,
          data.questionId,
          data.selectedOptionIds
        );

        if (result.error) {
          socket.emit("session:error", { error: result.error });
        }
      } catch (error) {
        console.error("Error submitting answer:", error);
        socket.emit("session:error", { error: "Failed to submit answer" });
      }
    }
  );

  socket.on("leaderboard:request", async (data: { sessionId: string }) => {
    try {
      await sessionManager.broadcastLeaderboard(data.sessionId);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      socket.emit("session:error", { error: "Failed to fetch leaderboard" });
    }
  });
}
