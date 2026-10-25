import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { EndScreen } from "@/components/game/EndScreen";
import { sampleEndState } from "@/game/demoEnd";

export const Route = createFileRoute("/demo/defeat")({
  head: () => ({
    meta: [
      { title: "Defeat screen preview — Night Orchard" },
      { name: "description", content: "See what the whole team sees when dawn comes before everyone escapes the Night Orchard maze." },
      { property: "og:title", content: "Night Orchard defeat screen" },
      { property: "og:description", content: "The retro end screen every player sees when the team runs out of rounds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DemoDefeat,
});

function DemoDefeat() {
  const navigate = useNavigate();
  return (
    <EndScreen
      state={sampleEndState(false)}
      me="p1"
      send={async () => toast.info("This is a preview — in a real game the host restarts from here.")}
      leave={() => void navigate({ to: "/" })}
    />
  );
}
