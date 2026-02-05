import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { hashPassword, createSession } from "@/src/lib/auth";
import { registerSchema } from "@/src/lib/validation";
import { apiSuccess, apiError } from "@/src/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        apiError(result.error.errors[0]?.message || "Invalid input"),
        { status: 400 }
      );
    }

    const { email, password, role } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(apiError("Email already registered"), {
        status: 400,
      });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    await createSession(user.id);

    return NextResponse.json(apiSuccess(user), { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(apiError("Registration failed"), { status: 500 });
  }
}
