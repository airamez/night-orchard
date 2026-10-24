import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MazeMap } from "@/components/game/MazeMap";
import { gkRoom, isLegal, type Action, type GameState, type Player } from "@/game/engine";
import { ROOMS, ROUND_LIMIT, SHRINE_OF, type Dir } from "@/game/map";
import { joinRoom, roomAction } from "@/game/room.functions";
import { loadSeat, saveSeat, useRoom, type Seat } from "@/game/useRoom";

export const Route = createFileRoute("/room/$code")({
  head: ({ params }) => ({
    meta: [
      { title: `Room ${params.code.toUpperCase()} — Night Orchard` },
      { name: "description", content: "Join your team in the Night Orchard hedge maze. Open the link, enter your name, and wait for the host to start." },
      { property: "og:title", content: `Join room ${params.code.toUpperCase()} in Night Orchard` },
      { property: "og:description", content: "A cooperative night-garden maze for 2 to 8 players." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RoomPage,
});

function RoomPage() {
  const code = Route.useParams().code.toUpperCase();
  const { state, missing } = useRoom(code);
  const [seat, setSeat] = useState<Seat | null>(null);
  const [seatLoaded, setSeatLoaded] = useState(false);
  useEffect(() => { setSeat(loadSeat(code)); setSeatLoaded(true); }, [code]);

  if (missing) return <Centered><p className="font-serif text-2xl">No room with code {code}.</p><Link to="/" className="text-lantern underline">Back home</Link></Centered>;
  if (!state || !seatLoaded) return <Centered><p className="text-muted-foreground">Opening the gate…</p></Centered>;

  const me = seat && state.players.find((p) => p.id === seat.seatId) ? seat : null;
  const send = async (body: Parameters<typeof roomAction>[0]["data"]["body"]) => {
    if (!me) return;
    try { await roomAction({ data: { code, token: me.token, body } }); } catch (e) { toast.error((e as Error).message); }
  };

  if (!me) {
    if (state.phase !== "lobby") return <Centered><p className="font-serif text-2xl">This game has already started.</p><Link to="/" className="text-lantern underline">Back home</Link></Centered>;
    return <JoinForm code={code} state={state} onJoined={setSeat} />;
  }
  if (state.phase === "lobby") return <Lobby code={code} state={state} me={me.seatId} send={send} />;
  if (state.phase === "won" || state.phase === "lost") return <EndScreen state={state} me={me.seatId} send={send} />;
  return <Game state={state} me={me.seatId} send={send} />;
}

type Send = (body: Parameters<typeof roomAction>[0]["data"]["body"]) => Promise<void>;

function Centered({ children }: { children: React.ReactNode }) {
  return <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">{children}</main>;
}

function JoinForm({ code, state, onJoined }: { code: string; state: GameState; onJoined: (s: Seat) => void }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Centered>
      <h1 className="font-serif text-4xl">Room {code}</h1>
      <p className="text-muted-foreground">{state.players.length} of 8 here: {state.players.map((p) => p.name).join(", ")}</p>
      <form className="panel-night flex w-full max-w-sm flex-col gap-3 p-6" onSubmit={async (e) => {
        e.preventDefault(); if (!name.trim()) return; setBusy(true);
        try { const r = await joinRoom({ data: { code, name: name.trim() } }); const s = { token: r.token, seatId: r.seatId }; saveSeat(code, s); onJoined(s); }
        catch (err) { toast.error((err as Error).message); setBusy(false); }
      }}>
        <Input value={name} maxLength={20} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoFocus />
        <Button type="submit" disabled={busy}>Join the team</Button>
      </form>
    </Centered>
  );
}

function Lobby({ code, state, me, send }: { code: string; state: GameState; me: string; send: Send }) {
  const isHost = state.hostId === me;
  const url = typeof window !== "undefined" ? `${window.location.origin}/room/${code}` : "";
  return (
    <main className="mx-auto max-w-xl space-y-6 px-5 py-14">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Room code</p>
        <h1 className="font-mono text-6xl tracking-[0.2em] text-lantern">{code}</h1>
      </div>
      <div className="panel-night flex gap-2 p-3">
        <Input readOnly value={url} className="font-mono text-xs" />
        <Button variant="secondary" onClick={async () => { await navigator.clipboard.writeText(url); toast.success("Link copied"); }}>Copy link</Button>
      </div>
      <ul className="panel-night divide-y divide-border">
        {state.players.map((p, i) => (
          <li key={p.id} className="flex items-center justify-between px-4 py-3">
            <span>{i + 1}. {p.name}{p.id === me && " (you)"}</span>
            {p.id === state.hostId && <span className="text-xs text-lantern">host</span>}
          </li>
        ))}
      </ul>
      {isHost ? (
        <Button size="lg" className="w-full lantern-glow" disabled={state.players.length < 2} onClick={() => send({ op: "start" })}>
          {state.players.length < 2 ? "Waiting for at least 2 players" : `Start with ${state.players.length} players`}
        </Button>
      ) : <p className="text-center text-muted-foreground">Waiting for the host to start…</p>}
    </main>
  );
}

const DIR_LABEL: Record<Dir, string> = { north: "North", south: "South", east: "East", west: "West" };

function describe(a: Action | undefined): string {
  if (!a) return "nothing yet";
  switch (a.type) {
    case "move": return `go ${a.dir}`;
    case "pickup": return "pick up the key";
    case "drop": return "drop the key";
    case "usekey": return "use the key";
    case "light": return "light lantern";
    case "speak": return `say "${a.text}"`;
    default: return a.type;
  }
}

function Game({ state, me, send }: { state: GameState; me: string; send: Send }) {
  const player = state.players.find((p) => p.id === me)!;
  const room = ROOMS[player.room];
  const mine = state.pending[me];
  const locked = !!mine?.locked;
  const [word, setWord] = useState("");
  const isHost = state.hostId === me;
  const lockedCount = state.players.filter((p) => state.pending[p.id]?.locked).length;
  const occupants = state.players.filter((p) => p.room === player.room && p.id !== me);
  const gkHere = gkRoom(state) === player.room;

  const options: { label: string; action: Action; tone?: "shut" }[] = [];
  for (const [dir, to] of Object.entries(room.exits) as [Dir, string][]) {
    const a: Action = { type: "move", dir };
    if (!isLegal(state, player, a)) continue;
    const hedge = room.hedge?.includes(dir);
    options.push({ label: `${DIR_LABEL[dir]} to ${ROOMS[to as keyof typeof ROOMS].title}${hedge ? " (shut hedge)" : ""}`, action: a, tone: hedge ? "shut" : undefined });
  }
  for (const a of [{ type: "pickup" }, { type: "drop" }, { type: "usekey" }, { type: "hold" }, { type: "light" }] as Action[]) {
    if (isLegal(state, player, a)) options.push({ label: { pickup: "Pick up the iron key", drop: "Drop the iron key", usekey: "Use the iron key on the east door", hold: "Hold", light: `Light your ${player.lantern} lantern` }[a.type as "pickup"], action: a });
  }
  options.push({ label: "Wait", action: { type: "wait" } }, { label: "Distract the groundskeeper", action: { type: "distract" } });
  const same = (a: Action) => mine && mine.action.type === a.type && mine.action.dir === a.dir && (a.type !== "speak");

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-6">
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-serif text-2xl">Night Orchard</h1>
        <p className="text-sm text-muted-foreground">Round <span className="text-lantern">{state.round}</span> of {ROUND_LIMIT} · {lockedCount}/{state.players.length} locked</p>
      </header>
      <div className="grid gap-5 md:grid-cols-[1.25fr_1fr]">
        <section className="space-y-4">
          <article className="panel-parchment p-6">
            <h2 className="font-serif text-3xl font-semibold">{room.title}</h2>
            <p className="mt-3 font-serif text-lg leading-relaxed">{room.prose}</p>
            <div className="mt-4 space-y-1 text-sm">
              <p><b>Exits:</b> {Object.entries(room.exits).map(([d, to]) => `${DIR_LABEL[d as Dir]} — ${ROOMS[to!].title}${room.lockedExit === d && !state.doorUnlocked ? " (locked)" : ""}${room.hedge?.includes(d as Dir) ? " (woven shut)" : ""}`).join(" · ")}</p>
              <p><b>Items:</b> {state.keyRoom === player.room ? "the iron key" : "none"}</p>
              <p><b>Here with you:</b> {occupants.length ? occupants.map((p) => p.name).join(", ") : "no one"}{gkHere && " — and the groundskeeper"}</p>
              {room.id === "gate" && <p><b>Gate:</b> {state.passwordSolved ? "the password has been spoken" : "silent"}</p>}
            </div>
          </article>

          <div className="panel-night space-y-3 p-4">
            <div className="flex items-center justify-between text-sm">
              <span>Your lantern: <b className={player.lit ? "text-lantern" : ""}>{player.lantern} — {player.lit ? "lit" : "unlit"}</b> {player.lit ? "" : `(wakes at ${ROOMS[SHRINE_OF[player.lantern]].title})`}</span>
              {player.hasKey && <span className="text-lantern">You carry the iron key</span>}
            </div>
            {player.delayed && <p className="text-sm text-shut">You are delayed: your next locked action will be cancelled.</p>}
            <div className="grid gap-2 sm:grid-cols-2">
              {options.map((o) => (
                <Button key={o.label} disabled={locked} variant={same(o.action) ? "default" : o.tone === "shut" ? "destructive" : "outline"}
                  className="h-auto justify-start whitespace-normal py-2 text-left" onClick={() => send({ op: "choose", action: o.action })}>{o.label}</Button>
              ))}
            </div>
            {player.room === "gate" && (
              <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (word.trim()) send({ op: "choose", action: { type: "speak", text: word.trim() } }); }}>
                <Input value={word} disabled={locked} maxLength={40} onChange={(e) => setWord(e.target.value)} placeholder="Speak a password" />
                <Button type="submit" variant="outline" disabled={locked}>Speak</Button>
              </form>
            )}
            <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
              <span className="text-sm text-muted-foreground">Chosen: <span className="text-foreground">{describe(mine?.action)}</span></span>
              {locked
                ? <Button variant="secondary" onClick={() => send({ op: "unlock" })}>Locked — change</Button>
                : <Button className="lantern-glow" onClick={() => send({ op: "lock" })}>Lock action</Button>}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="panel-night p-3"><MazeMap state={state} me={me} /></div>
          <Roster state={state} me={me} isHost={isHost} send={send} />
        </aside>
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <EventLog state={state} />
        <Chat state={state} send={send} />
      </div>
    </main>
  );
}

function Roster({ state, me, isHost, send }: { state: GameState; me: string; isHost?: boolean; send?: Send }) {
  return (
    <ul className="panel-night divide-y divide-border text-sm">
      {state.players.map((p: Player) => {
        const lk = state.pending[p.id]?.locked;
        return (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
            <div>
              <b>{p.name}</b>{p.id === me && " (you)"} <span className="text-muted-foreground">· {ROOMS[p.room].title}</span>
              <div className="text-xs">
                <span className={p.lit ? "text-lantern" : "text-muted-foreground"}>{p.lantern} {p.lit ? "lit" : "unlit"}</span>
                {p.hasKey && <span className="text-lantern"> · iron key</span>}
                {p.delayed && <span className="text-shut"> · delayed</span>}
              </div>
            </div>
            {state.phase === "playing" && (
              <div className="flex items-center gap-2">
                <span className={lk ? "text-hedge" : "text-muted-foreground"}>{lk ? "locked" : "choosing"}</span>
                {isHost && !lk && p.id !== me && send && <Button size="sm" variant="outline" onClick={() => send({ op: "forceWait", target: p.id })}>Set Wait</Button>}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function EventLog({ state }: { state: GameState }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.scrollTo({ top: ref.current.scrollHeight }); }, [state.log.length]);
  return (
    <section className="panel-night p-4">
      <h3 className="mb-2 text-sm uppercase tracking-widest text-muted-foreground">Event log</h3>
      <div ref={ref} className="max-h-60 space-y-1 overflow-y-auto font-serif text-sm">
        {state.log.map((l, i) => <p key={i}><span className="text-muted-foreground">R{l.r}</span> {l.text}</p>)}
      </div>
    </section>
  );
}

function Chat({ state, send }: { state: GameState; send: Send }) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.scrollTo({ top: ref.current.scrollHeight }); }, [state.chat.length]);
  return (
    <section className="panel-night flex flex-col p-4">
      <h3 className="mb-2 text-sm uppercase tracking-widest text-muted-foreground">Team chat</h3>
      <div ref={ref} className="mb-2 max-h-60 min-h-24 flex-1 space-y-1 overflow-y-auto text-sm">
        {state.chat.length === 0 && <p className="text-muted-foreground">Read your room aloud. Nobody else can see it.</p>}
        {state.chat.map((m, i) => <p key={i}><b className="text-lantern">{m.name}:</b> {m.text}</p>)}
      </div>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (text.trim()) { void send({ op: "chat", text: text.trim() }); setText(""); } }}>
        <Input value={text} maxLength={240} onChange={(e) => setText(e.target.value)} placeholder="Say something" />
        <Button type="submit" variant="secondary">Send</Button>
      </form>
    </section>
  );
}

function EndScreen({ state, me, send }: { state: GameState; me: string; send: Send }) {
  const won = state.phase === "won";
  const helpers = [...state.players].filter((p) => p.helped > 0).sort((a, b) => b.helped - a.helped);
  const inside = state.players.filter((p) => p.room !== "outer_lawn");
  const last = inside.length ? inside : [...state.players].sort((a, b) => (b.outAt ?? 0) - (a.outAt ?? 0)).slice(0, 1);
  const clues = [
    state.firstVisitor.fountain && `The key is under the bell — read in Fountain Court by ${state.firstVisitor.fountain}.`,
    state.firstVisitor.orchard && `The password NIGHTBLOOM — carved in the Orchard, found by ${state.firstVisitor.orchard}.`,
    state.firstVisitor.hedge_knot && `The hedge opens while someone holds — read at the Hedge Knot by ${state.firstVisitor.hedge_knot}.`,
  ].filter(Boolean);
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-5 py-14">
      <h1 className="text-center font-serif text-5xl">{won ? "The gate closes behind you." : "The garden locks again at dawn."}</h1>
      <ul className="panel-parchment divide-y divide-border p-2">
        {state.players.map((p) => (
          <li key={p.id} className="flex justify-between px-3 py-2"><span><b>{p.name}</b> · {p.lantern} lantern</span><span>{p.room === "outer_lawn" ? "reached the lawn" : `still in ${ROOMS[p.room].title}`}</span></li>
        ))}
      </ul>
      <div className="panel-night space-y-4 p-5 font-serif">
        <div><p className="text-lantern">Who spent a turn so someone else could move?</p><p>{helpers.length ? helpers.map((h) => `${h.name} (${h.helped})`).join(", ") : "No one held or distracted."}</p></div>
        <div><p className="text-lantern">Who was left inside the longest?</p><p>{last.map((p) => p.name).join(", ")}</p></div>
        <div><p className="text-lantern">Which clue did the team only have because someone read their room aloud?</p>{clues.length ? clues.map((c) => <p key={c as string}>{c}</p>) : <p>None were found.</p>}</div>
      </div>
      {state.hostId === me ? <Button size="lg" className="w-full lantern-glow" onClick={() => send({ op: "restart" })}>Restart</Button>
        : <p className="text-center text-muted-foreground">The host can restart with the same team.</p>}
    </main>
  );
}
