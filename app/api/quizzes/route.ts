import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth";
import { createQuizSchema } from "@/src/lib/validation";
import { createQuiz, getQuizzesByOwner } from "@/src/features/quiz/service";
import { apiSuccess, apiError } from "@/src/lib/utils";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(apiError("Not authenticated"), { status: 401 });
    }

    if (user.role !== "ORGANIZER") {
      return NextResponse.json(apiError("Only organizers can view quizzes"), {
        status: 403,
      });
    }

    const quizzes = await getQuizzesByOwner(user.id);
    return NextResponse.json(apiSuccess(quizzes));
  } catch (error) {
    console.error("Get quizzes error:", error);
    return NextResponse.json(apiError("Failed to get quizzes"), {
      status: 500,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(apiError("Not authenticated"), { status: 401 });
    }

    if (user.role !== "ORGANIZER") {
      return NextResponse.json(apiError("Only organizers can create quizzes"), {
        status: 403,
      });
    }

    const body = await request.json();
    const result = createQuizSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        apiError(result.error.errors[0]?.message || "Invalid input"),
        { status: 400 }
      );
    }

    const quiz = await createQuiz(user.id, result.data);
    return NextResponse.json(apiSuccess(quiz), { status: 201 });
  } catch (error) {
    console.error("Create quiz error:", error);
    return NextResponse.json(apiError("Failed to create quiz"), {
      status: 500,
    });
  }
}
