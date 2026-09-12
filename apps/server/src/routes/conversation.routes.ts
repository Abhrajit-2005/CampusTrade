import { Router } from "express";
import { createConversation, getConversations, getConversationMessages, markAsRead } from "../controllers/conversation.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { createConversationSchema, getConversationsSchema, getConversationMessagesSchema, markConversationReadSchema } from "../validators/conversation.validator.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(createConversationSchema),
  createConversation
);

router.get(
  "/",
  authenticate,
  validate(getConversationsSchema),
  getConversations
);

router.get(
  "/:id/messages",
  authenticate,
  validate(getConversationMessagesSchema),
  getConversationMessages
);

router.patch(
  "/:id/read",
  authenticate,
  validate(markConversationReadSchema),
  markAsRead
);

export default router;
