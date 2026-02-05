import { NextResponse } from "next/server";
import { destroySession } from "@/src/lib/auth";
import { apiSuccess } from "@/src/lib/utils";

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json(apiSuccess({ message: "Logged out" }));
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(apiSuccess({ message: "Logged out" }));
  }
}
