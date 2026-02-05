import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth";
import {
  createSession,
  getSessionsByHost,
  getSessionsByParticipant,
} from "@/src/features/session/service";
import { apiSuccess, apiError } from "@/src/lib/utils";
import { z } from "zod";

const createSessionSchema = z.object({
  quizId: z.string(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(apiError("Not authenticated"), { status: 401 });
    }

    if (user.role === "ORGANIZER") {
      const sessions = await getSessionsByHost(user.id);
      return NextResponse.json(apiSuccess(sessions));
    } else {
      const participations = await getSessionsByParticipant(user.id);
      return NextResponse.json(apiSuccess(participations));
    }
  } catch (error) {
    console.error("Get sessions error:", error);
    return NextResponse.json(apiError("Failed to get sessions"), {
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
      return NextResponse.json(
        apiError("Only organizers can create sessions"),
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = createSessionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        apiError(result.error.errors[0]?.message || "Invalid input"),
        { status: 400 }
      );
    }

    const session = await createSession(result.data.quizId, user.id);
    return NextResponse.json(apiSuccess(session), { status: 201 });
  } catch (error) {
    console.error("Create session error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create session";
    return NextResponse.json(apiError(message), { status: 500 });
  }
}
