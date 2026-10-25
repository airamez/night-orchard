import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { EndScreen } from "@/components/game/EndScreen";
import { sampleEndState } from "@/game/demoEnd";

export const Route = createFileRoute("/demo/victory")({
  head: () => ({
    meta: [
      { title: "Victory screen preview — Night Orchard" },
      { name: "description", content: "See what the whole team sees when everyone escapes the Night Orchard maze before dawn." },
      { property: "og:title", content: "Night Orchard victory screen" },
      { property: "og:description", content: "The retro end screen every player sees when the team escapes the maze." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DemoVictory,
});

function DemoVictory() {
  const navigate = useNavigate();
  return (
    <EndScreen
      state={sampleEndState(true)}
      me="p1"
      send={async () => toast.info("This is a preview — in a real game the host restarts from here.")}
      leave={() => void navigate({ to: "/" })}
    />
  );
}
