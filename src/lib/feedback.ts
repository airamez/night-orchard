import { z } from "zod";

export const feedbackSchema = z.object({
  title: z.string().trim().min(1, "Enter a title.").max(255),
  description: z.string().trim().min(1, "Enter a description.").max(255),
});
export const OWNER_EMAIL = "airamez@gmail.com";
export const isOwnerEmail = (email?: string | null) => email?.trim().toLowerCase() === OWNER_EMAIL;
