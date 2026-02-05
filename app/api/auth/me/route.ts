import { NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth";
import { apiSuccess, apiError } from "@/src/lib/utils";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(apiError("Not authenticated"), { status: 401 });
    }

    return NextResponse.json(apiSuccess(user));
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(apiError("Failed to get user"), { status: 500 });
  }
}
