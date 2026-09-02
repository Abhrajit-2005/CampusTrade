import { z } from "zod";

export const reorderImagesSchema = z.object({
  body: z.array(
    z.object({
      id: z.string().uuid("Invalid image ID"),
      displayOrder: z.number().int().min(0, "displayOrder must be non-negative"),
      isPrimary: z.boolean(),
    })
  )
    .min(1, "At least one image is required")
    .max(5, "Maximum 5 images allowed"),
});
