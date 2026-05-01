import { z } from "zod";

export const CreateRecipeSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.enum(["instagram", "url"]),
    url: z.string().url("Must be a valid URL"),
  }),
  z.object({
    type: z.literal("image"),
    imageKey: z.string().min(1, "Image key is required"),
  }),
]);

export const PresignUploadSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().regex(/^image\//),
});

export type CreateRecipeInput = z.infer<typeof CreateRecipeSchema>;
export type PresignUploadInput = z.infer<typeof PresignUploadSchema>;
