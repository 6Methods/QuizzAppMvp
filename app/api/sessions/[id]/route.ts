import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth";
import { getSessionById } from "@/src/features/session/service";
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
    const session = await getSessionById(id);

    if (!session) {
      return NextResponse.json(apiError("Session not found"), { status: 404 });
    }

    return NextResponse.json(apiSuccess(session));
  } catch (error) {
    console.error("Get session error:", error);
    return NextResponse.json(apiError("Failed to get session"), {
      status: 500,
    });
  }
}
