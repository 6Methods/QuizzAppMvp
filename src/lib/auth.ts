import { cookies } from "next/headers";
import { prisma } from "./prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "quiz_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

interface SessionPayload {
  userId: string;
  expiresAt: number;
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters");
  }
  return secret;
}

function encrypt(payload: SessionPayload): string {
  const secret = getSessionSecret();
  const data = JSON.stringify(payload);
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(secret, "salt", 32);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(token: string): SessionPayload | null {
  try {
    const secret = getSessionSecret();
    const [ivHex, encrypted] = token.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const key = crypto.scryptSync(secret, "salt", 32);
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

export async function createSession(userId: string): Promise<string> {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const token = encrypt({ userId, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  return token;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  const payload = decrypt(token);
  if (!payload) return null;

  if (Date.now() > payload.expiresAt) {
    await destroySession();
    return null;
  }

  return payload;
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function parseSessionToken(token: string): SessionPayload | null {
  return decrypt(token);
}
