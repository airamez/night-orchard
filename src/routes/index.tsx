import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createRoom } from "@/game/room.functions";
import { saveSeat } from "@/game/useRoom";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Night Orchard — a cooperative hedge maze for teams" },
      { name: "description", content: "Lock into a hedge maze at night with 2 to 8 teammates. Share what you see, light your lanterns, and reach the outer lawn by dawn." },
      { property: "og:title", content: "Night Orchard" },
      { property: "og:description", content: "A browser game for live team events. 2–8 players, one maze, sixteen rounds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function create() {
    if (!name.trim()) { toast.error("Enter your name first."); return; }
    setBusy(true);
    try {
      const r = await createRoom({ data: { name: name.trim() } });
      saveSeat(r.code, { token: r.token, seatId: r.seatId });
      navigate({ to: "/room/$code", params: { code: r.code } });
    } catch (e) { toast.error((e as Error).message); setBusy(false); }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-10 px-5 py-16">
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-lantern">A team game for one night</p>
        <h1 className="mt-3 font-serif text-6xl font-semibold">Night Orchard</h1>
        <p className="mt-4 font-serif text-lg text-muted-foreground">
          The hedge maze is locked. Each of you can read only the room you stand in. Light your own lantern, then
          everyone walks out onto the lawn — before dawn.
        </p>
      </header>

      <section className="panel-night space-y-4 p-6">
        <label className="block text-sm text-muted-foreground" htmlFor="name">Your name</label>
        <Input id="name" value={name} maxLength={20} onChange={(e) => setName(e.target.value)} placeholder="Mina" />
        <Button className="w-full lantern-glow" size="lg" disabled={busy} onClick={create}>Create room</Button>
      </section>

      <section className="panel-night space-y-3 p-6">
        <p className="text-sm text-muted-foreground">Have a code? Join a room</p>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (code.trim().length === 4) navigate({ to: "/room/$code", params: { code: code.trim().toUpperCase() } }); }}>
          <Input value={code} maxLength={4} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ABCD" className="font-mono tracking-widest uppercase" />
          <Button type="submit" variant="secondary">Join</Button>
        </form>
      </section>
    </main>
  );
}
