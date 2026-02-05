import { Server } from "socket.io";
import { createServer } from "http";
import { parse } from "cookie";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { setupHandlers } from "./handlers";
import { SessionManager } from "./sessionManager";

const prisma = new PrismaClient();
const SOCKET_PORT = parseInt(process.env.SOCKET_PORT || "3001", 10);

function decrypt(token: string): { userId: string; expiresAt: number } | null {
  try {
    const secret = process.env.SESSION_SECRET;
    if (!secret) return null;

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

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000"],
    credentials: true,
  },
});

const sessionManager = new SessionManager(prisma, io);

io.use(async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;
    if (!cookieHeader) {
      return next(new Error("Authentication required"));
    }

    const cookies = parse(cookieHeader);
    const sessionToken = cookies["quiz_session"];

    if (!sessionToken) {
      return next(new Error("Session token not found"));
    }

    const payload = decrypt(sessionToken);
    if (!payload || Date.now() > payload.expiresAt) {
      return next(new Error("Invalid or expired session"));
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.data.userId = user.id;
    socket.data.email = user.email;
    socket.data.role = user.role;

    next();
  } catch (error) {
    next(new Error("Authentication failed"));
  }
});

io.on("connection", (socket) => {
  console.log(
    `✅ User connected: ${socket.data.email} (${socket.data.userId})`
  );

  setupHandlers(socket, io, prisma, sessionManager);

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.data.email}`);
    sessionManager.handleDisconnect(socket);
  });
});

httpServer.listen(SOCKET_PORT, () => {
  console.log(`🚀 Socket.IO server running on port ${SOCKET_PORT}`);
});

process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down...");
  await prisma.$disconnect();
  httpServer.close();
  process.exit(0);
});
