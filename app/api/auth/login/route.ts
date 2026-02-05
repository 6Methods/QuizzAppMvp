import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { verifyPassword, createSession } from "@/src/lib/auth";
import { loginSchema } from "@/src/lib/validation";
import { apiSuccess, apiError } from "@/src/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        apiError(result.error.errors[0]?.message || "Invalid input"),
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(apiError("Invalid credentials"), {
        status: 401,
      });
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(apiError("Invalid credentials"), {
        status: 401,
      });
    }

    await createSession(user.id);

    return NextResponse.json(
      apiSuccess({
        id: user.id,
        email: user.email,
        role: user.role,
      })
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(apiError("Login failed"), { status: 500 });
  }
}
