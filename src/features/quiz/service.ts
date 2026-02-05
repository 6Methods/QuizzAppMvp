import { prisma } from "@/src/lib/prisma";
import {
  CreateQuizInput,
  UpdateQuizInput,
  CreateQuestionInput,
  UpdateQuestionInput,
} from "@/src/lib/validation";

export async function createQuiz(ownerId: string, data: CreateQuizInput) {
  return prisma.quiz.create({
    data: {
      ownerId,
      title: data.title,
      description: data.description,
    },
  });
}

export async function getQuizById(id: string) {
  return prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: {
        include: { options: true },
        orderBy: { order: "asc" },
      },
      owner: { select: { email: true } },
    },
  });
}

export async function getQuizzesByOwner(ownerId: string) {
  return prisma.quiz.findMany({
    where: { ownerId },
    include: {
      _count: { select: { questions: true, sessions: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function updateQuiz(
  id: string,
  ownerId: string,
  data: UpdateQuizInput
) {
  return prisma.quiz.updateMany({
    where: { id, ownerId },
    data,
  });
}

export async function deleteQuiz(id: string, ownerId: string) {
  return prisma.quiz.deleteMany({
    where: { id, ownerId },
  });
}

export async function createQuestion(
  quizId: string,
  ownerId: string,
  data: CreateQuestionInput
) {
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, ownerId },
  });

  if (!quiz) {
    throw new Error("Quiz not found or access denied");
  }

  return prisma.question.create({
    data: {
      quizId,
      order: data.order,
      type: data.type,
      prompt: data.prompt,
      imageUrl: data.imageUrl,
      isMulti: data.isMulti,
      timeLimitSec: data.timeLimitSec,
      points: data.points,
      options: {
        create: data.options.map((opt) => ({
          text: opt.text,
          isCorrect: opt.isCorrect,
        })),
      },
    },
    include: { options: true },
  });
}

export async function updateQuestion(
  id: string,
  ownerId: string,
  data: UpdateQuestionInput
) {
  const question = await prisma.question.findFirst({
    where: { id, quiz: { ownerId } },
  });

  if (!question) {
    throw new Error("Question not found or access denied");
  }

  if (data.options) {
    await prisma.option.deleteMany({ where: { questionId: id } });
    await prisma.option.createMany({
      data: data.options.map((opt) => ({
        questionId: id,
        text: opt.text,
        isCorrect: opt.isCorrect,
      })),
    });
  }

  return prisma.question.update({
    where: { id },
    data: {
      order: data.order,
      type: data.type,
      prompt: data.prompt,
      imageUrl: data.imageUrl,
      isMulti: data.isMulti,
      timeLimitSec: data.timeLimitSec,
      points: data.points,
    },
    include: { options: true },
  });
}

export async function deleteQuestion(id: string, ownerId: string) {
  const question = await prisma.question.findFirst({
    where: { id, quiz: { ownerId } },
  });

  if (!question) {
    throw new Error("Question not found or access denied");
  }

  return prisma.question.delete({ where: { id } });
}
