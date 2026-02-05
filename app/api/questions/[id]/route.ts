import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth";
import { updateQuestionSchema } from "@/src/lib/validation";
import { updateQuestion, deleteQuestion } from "@/src/features/quiz/service";
import { apiSuccess, apiError } from "@/src/lib/utils";

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
      return NextResponse.json(
        apiError("Only organizers can update questions"),
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = updateQuestionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        apiError(result.error.errors[0]?.message || "Invalid input"),
        { status: 400 }
      );
    }

    const { id } = await params;

    const question = await updateQuestion(id, user.id, result.data);
    return NextResponse.json(apiSuccess(question));
  } catch (error) {
    console.error("Update question error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update question";
    return NextResponse.json(apiError(message), { status: 500 });
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
      return NextResponse.json(
        apiError("Only organizers can delete questions"),
        { status: 403 }
      );
    }

    const { id } = await params;

    await deleteQuestion(id, user.id);
    return NextResponse.json(apiSuccess({ deleted: true }));
  } catch (error) {
    console.error("Delete question error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete question";
    return NextResponse.json(apiError(message), { status: 500 });
  }
}
