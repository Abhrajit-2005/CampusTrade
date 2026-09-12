import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { conversationService } from "../services/conversation.service.js";
import { sendSuccess } from "../utils/response.js";

export const createConversation = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { itemId } = req.body;
    const conversation = await conversationService.createConversation(req.user!.sub, itemId);

    return sendSuccess(
      res,
      conversation,
      "Conversation retrieved/created successfully",
      201 // Even if retrieved existing, keeping 201 or 200 is fine, returning 201 for POST is standard.
    );
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const data = await conversationService.getConversations(req.user!.sub, page, limit);

    return sendSuccess(
      res,
      data,
      "Conversations fetched successfully",
      200
    );
  } catch (error) {
    next(error);
  }
};

export const getConversationMessages = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const data = await conversationService.getConversationMessages(req.user!.sub, id, page, limit);

    return sendSuccess(
      res,
      data,
      "Messages fetched successfully",
      200
    );
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;

    const data = await conversationService.markAsRead(req.user!.sub, id);

    return sendSuccess(
      res,
      data,
      "Messages marked as read successfully",
      200
    );
  } catch (error) {
    next(error);
  }
};
