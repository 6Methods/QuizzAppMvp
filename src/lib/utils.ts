export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function calculateTimeRemaining(endsAt: Date | string): number {
  const end = new Date(endsAt).getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((end - now) / 1000));
}

export function isTimeExpired(endsAt: Date | string): boolean {
  return new Date(endsAt).getTime() < Date.now();
}

export type ApiResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

export function apiSuccess<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

export function apiError(error: string): ApiResponse<never> {
  return { success: false, error };
}
