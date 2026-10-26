import { createFileRoute } from "@tanstack/react-router";

const GUIDE_URL = "/how-to-play.html";

export const Route = createFileRoute("/how-to-play")({
  head: () => ({
    meta: [
      { title: "How to play — Night Orchard" },
      {
        name: "description",
        content:
          "Instructions for Night Orchard: how rounds work, what each action does, and how your team escapes the hedge maze before dawn.",
      },
      { property: "og:title", content: "How to play Night Orchard" },
      {
        property: "og:description",
        content: "Rules, actions, and examples for the cooperative hedge maze.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HowToPlay,
});

function HowToPlay() {
  return (
    <iframe
      title="How to play Night Orchard"
      src={GUIDE_URL}
      className="block h-dvh w-full border-0 bg-background"
    />
  );
}
