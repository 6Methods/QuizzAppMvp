import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth";
import { createQuestionSchema } from "@/src/lib/validation";
import { createQuestion } from "@/src/features/quiz/service";
import { apiSuccess, apiError } from "@/src/lib/utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(apiError("Not authenticated"), { status: 401 });
    }

    if (user.role !== "ORGANIZER") {
      return NextResponse.json(apiError("Only organizers can add questions"), {
        status: 403,
      });
    }

    const body = await request.json();
    const result = createQuestionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        apiError(result.error.errors[0]?.message || "Invalid input"),
        { status: 400 }
      );
    }

    const { id } = await params;

    const question = await createQuestion(id, user.id, result.data);
    return NextResponse.json(apiSuccess(question), { status: 201 });
  } catch (error) {
    console.error("Create question error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create question";
    return NextResponse.json(apiError(message), { status: 500 });
  }
}
