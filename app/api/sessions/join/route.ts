import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth";
import { joinSessionSchema } from "@/src/lib/validation";
import { joinSession } from "@/src/features/session/service";
import { apiSuccess, apiError } from "@/src/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(apiError("Not authenticated"), { status: 401 });
    }

    const body = await request.json();
    const result = joinSessionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        apiError(result.error.errors[0]?.message || "Invalid input"),
        { status: 400 }
      );
    }

    const session = await joinSession(
      result.data.roomCode.toUpperCase(),
      user.id
    );
    return NextResponse.json(
      apiSuccess({ sessionId: session.id, roomCode: session.roomCode })
    );
  } catch (error) {
    console.error("Join session error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to join session";
    return NextResponse.json(apiError(message), { status: 500 });
  }
}
