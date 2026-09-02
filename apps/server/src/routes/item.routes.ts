import { Router } from "express";
import { createItem, getItems, publishItem, getItem, updateItem, deleteItem, getMyListings } from "../controllers/item.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { createItemSchema, getItemsSchema, publishItemSchema, getItemSchema, updateItemSchema, deleteItemSchema, getMyListingsSchema } from "../validators/item.validator.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(createItemSchema),
  createItem
);

router.get(
  "/",
  authenticate,
  validate(getItemsSchema),
  getItems
);

router.get(
  "/my-listings",
  authenticate,
  validate(getMyListingsSchema),
  getMyListings
);

router.get(
  "/:id",
  authenticate,
  validate(getItemSchema),
  getItem
);

router.patch(
  "/:id/publish",
  authenticate,
  validate(publishItemSchema),
  publishItem
);

router.patch(
  "/:id",
  authenticate,
  validate(updateItemSchema),
  updateItem
);

router.delete(
  "/:id",
  authenticate,
  validate(deleteItemSchema),
  deleteItem
);

export default router;
