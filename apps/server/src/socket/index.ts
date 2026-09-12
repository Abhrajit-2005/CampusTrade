import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { verifyAccessToken, AccessTokenPayload } from "../utils/jwt.js";
import { sendMessagePayloadSchema, typingPayloadSchema, markReadPayloadSchema } from "../validators/conversation.validator.js";
import { conversationService } from "../services/conversation.service.js";
import { z } from "zod";

export interface AuthenticatedSocket extends Socket {
  user?: AccessTokenPayload;
}

export const activeUsers = new Map<string, Set<string>>();

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const payload = verifyAccessToken(token);
      if (!payload || !payload.sub) {
        return next(new Error("Authentication error: Invalid token"));
      }

      socket.user = payload;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.user?.sub;

    if (!userId) {
      socket.disconnect();
      return;
    }

    if (!activeUsers.has(userId)) {
      activeUsers.set(userId, new Set());
    }
    activeUsers.get(userId)!.add(socket.id);

    socket.on("disconnect", () => {
      const userSockets = activeUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          activeUsers.delete(userId);
        }
      }
    });

    socket.on("send_message", async (payload: any, callback?: (response: any) => void) => {
      try {
        const validatedPayload = sendMessagePayloadSchema.parse(payload);
        const { message, recipientId } = await conversationService.sendMessage(userId, validatedPayload);
        
        socket.emit("message_sent", {
          tempId: validatedPayload.tempId,
          message,
        });

        const recipientSockets = activeUsers.get(recipientId);
        if (recipientSockets && recipientSockets.size > 0) {
          for (const socketId of recipientSockets) {
            io.to(socketId).emit("receive_message", message);
          }
        }

        if (callback) {
          callback({ success: true });
        }
      } catch (error: any) {
        const errorMessage = error instanceof z.ZodError 
          ? error.issues[0]?.message || "Validation failed"
          : error.message || "Failed to send message";
          
        socket.emit("socket_error", { error: errorMessage, tempId: payload?.tempId });
        if (callback) {
          callback({ success: false, error: errorMessage });
        }
      }
    });

    socket.on("typing", async (payload: any, callback?: (response: any) => void) => {
      try {
        const validatedPayload = typingPayloadSchema.parse(payload);
        const { recipientId } = await conversationService.handleTyping(userId, validatedPayload);
        
        const recipientSockets = activeUsers.get(recipientId);
        if (recipientSockets && recipientSockets.size > 0) {
          for (const socketId of recipientSockets) {
            io.to(socketId).emit("user_typing", {
              conversationId: validatedPayload.conversationId,
              userId: userId,
              isTyping: validatedPayload.isTyping,
            });
          }
        }

        if (callback) {
          callback({ success: true });
        }
      } catch (error: any) {
        const errorMessage = error instanceof z.ZodError 
          ? error.issues[0]?.message || "Validation failed"
          : error.message || "Failed to process typing event";
          
        socket.emit("socket_error", { error: errorMessage });
        if (callback) {
          callback({ success: false, error: errorMessage });
        }
      }
    });

    socket.on("mark_read", async (payload: any, callback?: (response: any) => void) => {
      try {
        const validatedPayload = markReadPayloadSchema.parse(payload);
        const { count, recipientId } = await conversationService.markAsRead(userId, validatedPayload.conversationId);
        
        if (count > 0) {
          const recipientSockets = activeUsers.get(recipientId);
          if (recipientSockets && recipientSockets.size > 0) {
            const readAt = new Date().toISOString();
            for (const socketId of recipientSockets) {
              io.to(socketId).emit("messages_read", {
                conversationId: validatedPayload.conversationId,
                userId: userId,
                readAt,
              });
            }
          }
        }

        if (callback) {
          callback({ success: true, count });
        }
      } catch (error: any) {
        const errorMessage = error instanceof z.ZodError 
          ? error.issues[0]?.message || "Validation failed"
          : error.message || "Failed to mark messages as read";
          
        socket.emit("socket_error", { error: errorMessage });
        if (callback) {
          callback({ success: false, error: errorMessage });
        }
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
