"use client";

import { useEffect, useState, useCallback } from "react";
import { useSocket } from "./useSocket";

interface Participant {
  id: string;
  email: string;
  joinedAt: string;
}

interface SessionState {
  status: "LOBBY" | "QUESTION" | "REVEAL" | "FINISHED";
  currentQuestionOrder?: number;
  questionStartedAt?: string;
  questionEndsAt?: string;
}

interface QuestionData {
  id: string;
  order: number;
  type: "TEXT" | "IMAGE";
  prompt: string;
  imageUrl?: string;
  isMulti: boolean;
  timeLimitSec: number;
  points: number;
  options: { id: string; text: string }[];
  endsAt: string;
}

interface LeaderboardEntry {
  rank: number;
  email: string;
  points: number;
}

interface RevealData {
  questionId: string;
  correctOptionIds: string[];
}

export function useSession(sessionId: string | null) {
  const { isConnected, emit, on, error, clearError } = useSocket();
  const [joined, setJoined] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(
    null
  );
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [revealData, setRevealData] = useState<RevealData | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  useEffect(() => {
    if (!isConnected) return;

    const unsubJoined = on<{ sessionId: string }>("session:joined", () => {
      setJoined(true);
    });

    const unsubLobby = on<{ participants: Participant[] }>(
      "session:lobbyUpdate",
      (data) => {
        setParticipants(data.participants);
      }
    );

    const unsubState = on<SessionState>("session:state", (data) => {
      setSessionState(data);
      if (data.status === "LOBBY") {
        setCurrentQuestion(null);
        setRevealData(null);
        setAnswerSubmitted(false);
      }
    });

    const unsubQuestion = on<QuestionData>("question:show", (data) => {
      setCurrentQuestion(data);
      setRevealData(null);
      setAnswerSubmitted(false);
    });

    const unsubLeaderboard = on<{ leaderboard: LeaderboardEntry[] }>(
      "leaderboard:update",
      (data) => {
        setLeaderboard(data.leaderboard);
      }
    );

    const unsubReveal = on<RevealData>("answer:reveal", (data) => {
      setRevealData(data);
    });

    const unsubAck = on<{ received: boolean }>("answer:ack", () => {
      setAnswerSubmitted(true);
    });

    const unsubFinished = on<{}>("session:finished", () => {
      setSessionState((prev) =>
        prev ? { ...prev, status: "FINISHED" } : null
      );
    });

    return () => {
      unsubJoined();
      unsubLobby();
      unsubState();
      unsubQuestion();
      unsubLeaderboard();
      unsubReveal();
      unsubAck();
      unsubFinished();
    };
  }, [isConnected, on]);

  const joinSession = useCallback(
    (roomCode: string) => {
      emit("session:join", { roomCode });
    },
    [emit]
  );

  const startSession = useCallback(() => {
    if (sessionId) {
      emit("session:start", { sessionId });
    }
  }, [emit, sessionId]);

  const nextQuestion = useCallback(() => {
    if (sessionId) {
      emit("session:nextQuestion", { sessionId });
    }
  }, [emit, sessionId]);

  const revealAnswer = useCallback(() => {
    if (sessionId) {
      emit("session:revealAnswer", { sessionId });
    }
  }, [emit, sessionId]);

  const finishSession = useCallback(() => {
    if (sessionId) {
      emit("session:finish", { sessionId });
    }
  }, [emit, sessionId]);

  const submitAnswer = useCallback(
    (questionId: string, selectedOptionIds: string[]) => {
      if (sessionId) {
        emit("answer:submit", { sessionId, questionId, selectedOptionIds });
      }
    },
    [emit, sessionId]
  );

  const requestLeaderboard = useCallback(() => {
    if (sessionId) {
      emit("leaderboard:request", { sessionId });
    }
  }, [emit, sessionId]);

  return {
    isConnected,
    joined,
    participants,
    sessionState,
    currentQuestion,
    leaderboard,
    revealData,
    answerSubmitted,
    error,
    clearError,
    joinSession,
    startSession,
    nextQuestion,
    revealAnswer,
    finishSession,
    submitAnswer,
    requestLeaderboard,
  };
}
