import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ORGANIZER", "PARTICIPANT"]),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createQuizSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
});

export const updateQuizSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
});

export const createQuestionSchema = z.object({
  order: z.number().int().positive(),
  type: z.enum(["TEXT", "IMAGE"]),
  prompt: z.string().min(1, "Prompt is required").max(500),
  imageUrl: z.string().url().optional().nullable(),
  isMulti: z.boolean().default(false),
  timeLimitSec: z.number().int().min(5).max(300).default(30),
  points: z.number().int().min(1).max(1000).default(100),
  options: z
    .array(
      z.object({
        text: z.string().min(1).max(200),
        isCorrect: z.boolean(),
      })
    )
    .min(2, "At least 2 options required"),
});

export const updateQuestionSchema = z.object({
  order: z.number().int().positive().optional(),
  type: z.enum(["TEXT", "IMAGE"]).optional(),
  prompt: z.string().min(1).max(500).optional(),
  imageUrl: z.string().url().optional().nullable(),
  isMulti: z.boolean().optional(),
  timeLimitSec: z.number().int().min(5).max(300).optional(),
  points: z.number().int().min(1).max(1000).optional(),
  options: z
    .array(
      z.object({
        id: z.string().optional(),
        text: z.string().min(1).max(200),
        isCorrect: z.boolean(),
      })
    )
    .min(2)
    .optional(),
});

export const joinSessionSchema = z.object({
  roomCode: z.string().length(6, "Room code must be 6 characters"),
});

export const submitAnswerSchema = z.object({
  sessionId: z.string(),
  questionId: z.string(),
  selectedOptionIds: z.array(z.string()).min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type JoinSessionInput = z.infer<typeof joinSessionSchema>;
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
