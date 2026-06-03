import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import type { AuthUser } from "../types/auth";

let io: Server | null = null;

export const ADMIN_ROOM = "admins";

export interface SocketUser {
  userId: string;
  role: string;
}

interface AuthenticatedSocket extends Socket {
  data: { user?: SocketUser };
}

const extractToken = (handshake: Socket["handshake"]): string | undefined => {
  const fromAuth =
    typeof handshake.auth?.token === "string"
      ? handshake.auth.token
      : undefined;
  if (fromAuth) return fromAuth;

  const header = handshake.headers?.authorization;
  if (typeof header === "string" && header.startsWith("Bearer ")) {
    return header.slice("Bearer ".length).trim();
  }
  return undefined;
};

const verifyToken = (token: string): SocketUser | null => {
  try {
    return jwt.verify(token, process.env.ACCESS_SECRET as string) as SocketUser;
  } catch {
    return null;
  }
};

export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        const normalized = origin.replace(/\/$/, "").toLowerCase();
        const envOrigins = (process.env.CORS_ORIGINS || "")
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean);
        const allowed = [
          process.env.CLIENT_ORIGIN,
          process.env.ADMIN_ORIGIN,
          ...envOrigins,
        ]
          .filter(Boolean)
          .map((o) => (o as string).replace(/\/$/, "").toLowerCase());

        const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(
          normalized
        );
        const isVercel =
          /^https:\/\/[a-z0-9][a-z0-9-]*\.vercel\.app\/?$/i.test(normalized);
        const isRailway =
          /^https:\/\/[a-z0-9][a-z0-9-]*\.up\.railway\.app\/?$/i.test(
            normalized
          );

        if (
          allowed.includes(normalized) ||
          isLocal ||
          isVercel ||
          isRailway
        ) {
          return callback(null, true);
        }
        return callback(new Error("Socket CORS blocked"), false);
      },
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.use((socket: Socket, next) => {
    const token = extractToken(socket.handshake);
    if (!token) {
      return next(new Error("Unauthorized: token missing"));
    }
    const user = verifyToken(token);
    if (!user) {
      return next(new Error("Unauthorized: invalid token"));
    }
    (socket as AuthenticatedSocket).data.user = user;
    next();
  });

  io.on("connection", (socket: Socket) => {
    const user = (socket as AuthenticatedSocket).data.user;
    if (!user) {
      socket.disconnect(true);
      return;
    }

    socket.join(`user:${user.userId}`);
    if (user.role === "admin") {
      socket.join(ADMIN_ROOM);
    }

    socket.emit("connected", { userId: user.userId, role: user.role });
  });

  return io;
};

export const getIO = (): Server | null => io;

export const emitToAdmins = (event: string, payload: unknown): void => {
  if (!io) return;
  io.to(ADMIN_ROOM).emit(event, payload);
};

export const emitToUser = (
  userId: string,
  event: string,
  payload: unknown
): void => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
};
