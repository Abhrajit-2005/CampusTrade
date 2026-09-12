import { z } from "zod";

export const createConversationSchema = z.object({
  body: z.object({
    itemId: z.string().uuid("Invalid Item ID format"),
  }),
});

export const getConversationsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "Page must be a number").optional(),
    limit: z.string().regex(/^\d+$/, "Limit must be a number").optional(),
  }),
});

export const getConversationMessagesSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid Conversation ID format"),
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/, "Page must be a number").optional(),
    limit: z.string().regex(/^\d+$/, "Limit must be a number").optional(),
  }),
});

export const markConversationReadSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid Conversation ID format"),
  }),
});

export const sendMessagePayloadSchema = z.object({
  conversationId: z.string().uuid("Invalid Conversation ID format"),
  content: z.string().trim().min(1, "Message cannot be empty").max(2000, "Message exceeds maximum length"),
  tempId: z.string().min(1, "tempId is required"),
});

export const typingPayloadSchema = z.object({
  conversationId: z.string().uuid("Invalid Conversation ID format"),
  isTyping: z.boolean(),
});

export const markReadPayloadSchema = z.object({
  conversationId: z.string().uuid("Invalid Conversation ID format"),
});

