import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth";
import { updateQuizSchema } from "@/src/lib/validation";
import {
  getQuizById,
  updateQuiz,
  deleteQuiz,
} from "@/src/features/quiz/service";
import { apiSuccess, apiError } from "@/src/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(apiError("Not authenticated"), { status: 401 });
    }

    const { id } = await params;
    const quiz = await getQuizById(id);

    if (!quiz) {
      return NextResponse.json(apiError("Quiz not found"), { status: 404 });
    }

    if (quiz.ownerId !== user.id && user.role !== "ORGANIZER") {
      return NextResponse.json(apiError("Access denied"), { status: 403 });
    }

    return NextResponse.json(apiSuccess(quiz));
  } catch (error) {
    console.error("Get quiz error:", error);
    return NextResponse.json(apiError("Failed to get quiz"), { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(apiError("Not authenticated"), { status: 401 });
    }

    if (user.role !== "ORGANIZER") {
      return NextResponse.json(apiError("Only organizers can update quizzes"), {
        status: 403,
      });
    }

    const body = await request.json();
    const result = updateQuizSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        apiError(result.error.errors[0]?.message || "Invalid input"),
        { status: 400 }
      );
    }

    const { id } = await params;
    const updated = await updateQuiz(id, user.id, result.data);

    if (updated.count === 0) {
      return NextResponse.json(apiError("Quiz not found or access denied"), {
        status: 404,
      });
    }

    const quiz = await getQuizById(id);
    return NextResponse.json(apiSuccess(quiz));
  } catch (error) {
    console.error("Update quiz error:", error);
    return NextResponse.json(apiError("Failed to update quiz"), {
      status: 500,
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(apiError("Not authenticated"), { status: 401 });
    }

    if (user.role !== "ORGANIZER") {
      return NextResponse.json(apiError("Only organizers can delete quizzes"), {
        status: 403,
      });
    }

    const { id } = await params;
    const deleted = await deleteQuiz(id, user.id);

    if (deleted.count === 0) {
      return NextResponse.json(apiError("Quiz not found or access denied"), {
        status: 404,
      });
    }

    return NextResponse.json(apiSuccess({ deleted: true }));
  } catch (error) {
    console.error("Delete quiz error:", error);
    return NextResponse.json(apiError("Failed to delete quiz"), {
      status: 500,
    });
  }
}
