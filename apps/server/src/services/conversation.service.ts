import { conversationRepository } from "../repositories/conversation.repository.js";
import { itemRepository } from "../repositories/item.repository.js";
import { messageRepository } from "../repositories/message.repository.js";
import { AppError } from "../utils/AppError.js";

export const conversationService = {
  createConversation: async (buyerId: string, itemId: string) => {
    const item = await itemRepository.findById(itemId);

    if (!item || item.deletedAt !== null) {
      throw new AppError("Item not found", 404, "ITEM_NOT_FOUND");
    }

    if (item.status !== "AVAILABLE") {
      throw new AppError("Item is no longer available", 400, "ITEM_NOT_AVAILABLE");
    }

    if (item.sellerId === buyerId) {
      throw new AppError("You cannot start a conversation for your own item", 403, "CANNOT_MESSAGE_SELF");
    }

    // Attempt to create or fetch existing conversation
    // Sets lastMessageAt to now as a baseline
    const conversation = await conversationRepository.create({
      itemId,
      buyerId,
      sellerId: item.sellerId,
      lastMessageAt: new Date(),
    });

    return conversation;
  },

  getConversations: async (userId: string, page: number, limit: number) => {
    return await conversationRepository.findManyByUserIdWithPagination(userId, page, limit);
  },

  getConversationMessages: async (userId: string, conversationId: string, page: number, limit: number) => {
    const conversation = await conversationRepository.findById(conversationId);

    if (!conversation || conversation.deletedAt !== null) {
      throw new AppError("Conversation not found", 404, "CONVERSATION_NOT_FOUND");
    }

    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      throw new AppError("You are not authorized to view these messages", 403, "UNAUTHORIZED_ACCESS");
    }

    return await messageRepository.findManyByConversationIdWithPagination(conversationId, page, limit);
  },

  markAsRead: async (userId: string, conversationId: string) => {
    const conversation = await conversationRepository.findById(conversationId);

    if (!conversation || conversation.deletedAt !== null) {
      throw new AppError("Conversation not found", 404, "CONVERSATION_NOT_FOUND");
    }

    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      throw new AppError("You are not authorized to access this conversation", 403, "UNAUTHORIZED_ACCESS");
    }

    const recipientId = conversation.buyerId === userId ? conversation.sellerId : conversation.buyerId;
    const updatedCount = await messageRepository.markMessagesAsRead(conversationId, userId);
    
    return { count: updatedCount, recipientId };
  },

  sendMessage: async (userId: string, payload: { conversationId: string, content: string }) => {
    const { conversationId, content } = payload;
    const conversation = await conversationRepository.findById(conversationId);

    if (!conversation || conversation.deletedAt !== null) {
      throw new AppError("Conversation not found", 404, "CONVERSATION_NOT_FOUND");
    }

    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      throw new AppError("You are not authorized to send messages in this conversation", 403, "UNAUTHORIZED_ACCESS");
    }

    const recipientId = conversation.buyerId === userId ? conversation.sellerId : conversation.buyerId;

    const message = await messageRepository.createMessageAndUpdateConversation({
      conversationId,
      senderId: userId,
      content,
    });

    return { message, recipientId };
  },

  handleTyping: async (userId: string, payload: { conversationId: string, isTyping: boolean }) => {
    const { conversationId } = payload;
    const conversation = await conversationRepository.findById(conversationId);

    if (!conversation || conversation.deletedAt !== null) {
      throw new AppError("Conversation not found", 404, "CONVERSATION_NOT_FOUND");
    }

    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      throw new AppError("You are not authorized to perform actions in this conversation", 403, "UNAUTHORIZED_ACCESS");
    }

    const recipientId = conversation.buyerId === userId ? conversation.sellerId : conversation.buyerId;

    return { recipientId };
  },
};
