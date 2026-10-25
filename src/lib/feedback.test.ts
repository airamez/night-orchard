import { describe, expect, it } from "vitest";
import { feedbackSchema } from "./feedback";

describe("feedback", () => {
  it("allows a 255-character title and rejects 256", () => {
    expect(feedbackSchema.safeParse({ title: "a".repeat(255), description: "Bug" }).success).toBe(true);
    expect(feedbackSchema.safeParse({ title: "a".repeat(256), description: "Bug" }).success).toBe(false);
  });
  it("allows a 255-character description and rejects 256", () => {
    expect(feedbackSchema.safeParse({ title: "Bug", description: "a".repeat(255) }).success).toBe(true);
    expect(feedbackSchema.safeParse({ title: "Bug", description: "a".repeat(256) }).success).toBe(false);
  });
  it("rejects empty reports", () => {
    expect(feedbackSchema.safeParse({ title: "  ", description: " " }).success).toBe(false);
  });
});