import { z } from "zod";

export const feedbackSchema = z.object({
  title: z.string().trim().min(1, "Enter a title.").max(255),
  description: z.string().trim().min(1, "Enter a description.").max(255),
});

export function feedbackEmail(input: unknown) {
  const data = feedbackSchema.parse(input);
  return `mailto:night.orchard@airamez.com?subject=${encodeURIComponent(data.title)}&body=${encodeURIComponent(data.description)}`;
}