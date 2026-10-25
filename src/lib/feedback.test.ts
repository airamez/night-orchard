import { describe, expect, it } from "vitest";
import { feedbackEmail, feedbackSchema } from "./feedback";

describe("feedback", () => {
  it("allows a 255-character title and rejects 256", () => {
    expect(feedbackSchema.safeParse({ title: "a".repeat(255), description: "Bug" }).success).toBe(true);
    expect(feedbackSchema.safeParse({ title: "a".repeat(256), description: "Bug" }).success).toBe(false);
  });
  it("allows a 255-character description and rejects 256", () => {
    expect(feedbackSchema.safeParse({ title: "Bug", description: "a".repeat(255) }).success).toBe(true);
    expect(feedbackSchema.safeParse({ title: "Bug", description: "a".repeat(256) }).success).toBe(false);
  });
  it("addresses only the owner's mailbox and encodes report content", () => {
    expect(feedbackEmail({ title: "Bug & suggestion", description: "A? B\nC" })).toBe("mailto:night.orchard@airamez.com?subject=Bug%20%26%20suggestion&body=A%3F%20B%0AC");
  });
});