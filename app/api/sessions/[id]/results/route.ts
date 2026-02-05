import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth";
import { getSessionResults } from "@/src/features/session/service";
import { getSessionStats } from "@/src/features/scoring/service";
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
    const session = await getSessionResults(id);

    if (!session) {
      return NextResponse.json(apiError("Session not found"), { status: 404 });
    }

    const stats = await getSessionStats(id);

    return NextResponse.json(
      apiSuccess({
        session: {
          id: session.id,
          quizTitle: session.quiz.title,
          status: session.status,
          createdAt: session.createdAt,
          endedAt: session.endedAt,
        },
        leaderboard: session.scores.map((s, idx) => ({
          rank: idx + 1,
          email: s.user.email,
          points: s.points,
        })),
        stats,
        participantCount: session._count.participants,
      })
    );
  } catch (error) {
    console.error("Get results error:", error);
    return NextResponse.json(apiError("Failed to get results"), {
      status: 500,
    });
  }
}
