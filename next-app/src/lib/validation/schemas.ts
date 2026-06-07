import { z } from "zod";

export const sessionBodySchema = z.object({
  idToken: z.string().min(20).max(8192),
});

export const deleteAccountSchema = z.object({
  confirm: z.literal("DELETE"),
});

export const adminDeletePostSchema = z.object({
  postId: z.string().min(1).max(128),
});

export const adminEventPatchSchema = z.object({
  eventName: z.string().min(1).max(200).optional(),
  eventDescription: z.string().max(2000).optional(),
  eventLocation: z.string().max(300).optional(),
});
