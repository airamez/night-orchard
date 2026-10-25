import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { ActionIcon } from "@/components/game/ActionIcon";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapView } from "@/components/game/MapView";
import { EndScreen } from "@/components/game/EndScreen";
import { LanternIcon } from "@/components/game/LanternIcon";
import { gkRoom, isLegal, type Action, type GameState, type Player } from "@/game/engine";
import { GK_PATH, NAME_MAX, PASSWORD_LINE, PASSWORD_PHRASES, ROOMS, ROUND_LIMIT, SHRINE_OF, passwordClue, type Dir } from "@/game/map";
import { joinRoom, roomAction, trackRoomVisit, type RoomOp } from "@/game/room.functions";
import { winningPlan } from "@/game/winningPlan";
import { clearSeat, loadSeat, saveSeat, useRoom, type Seat } from "@/game/useRoom";

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
  const { state, missing, refetch } = useRoom(code);
  const navigate = useNavigate();
  const [seat, setSeat] = useState<Seat | null>(null);
  const [seatLoaded, setSeatLoaded] = useState(false);
  const [removed, setRemoved] = useState(false);
  // God mode stays hidden unless the owner opened the room with a ?god-mode suffix.
  const [godModeUrl, setGodModeUrl] = useState(false);
  useEffect(() => {
    setSeat(loadSeat(code));
    setSeatLoaded(true);
    setGodModeUrl(new URLSearchParams(window.location.search).has("god-mode"));
  }, [code]);

  const inRoom = !!seat && !!state?.players.some((p) => p.id === seat.seatId);
  useEffect(() => {
    if (!seat || !inRoom) return;
    void trackRoomVisit({ data: { code, token: seat.token, godMode: godModeUrl } }).catch(() => {});
  }, [code, seat, inRoom, godModeUrl, state?.phase]);
  // If we had a seat but are no longer in the player list, we left or were removed.
  useEffect(() => {
    if (seatLoaded && seat && state && !inRoom) {
      clearSeat(code);
      setSeat(null);
      setRemoved(true);
      if (state.phase !== "lobby") void navigate({ to: "/" });
    }
  }, [seatLoaded, seat, state, inRoom, code, navigate]);

  if (missing) return <Centered><p className="font-serif text-2xl">No room with code {code}.</p><Link to="/" className="text-lantern underline">Back home</Link></Centered>;
  if (!state || !seatLoaded) return <Centered><p className="text-muted-foreground">Opening the gate…</p></Centered>;
  if (removed && !seat) return <Centered><p className="font-serif text-2xl">You have left the garden.</p><Link to="/" className="text-lantern underline">Back home</Link></Centered>;

  const me = seat && state.players.find((p) => p.id === seat.seatId) ? seat : null;
  const send = async (body: RoomOp) => {
    if (!me) return;
    try { await roomAction({ data: { code, token: me.token, body } }); } catch (e) { toast.error((e as Error).message); }
  };
  const leave = async () => {
    if (!me || !window.confirm("Leave this game? The team will play on without you.")) return;
    try {
      await roomAction({ data: { code, token: me.token, body: { op: "leave" } } });
      clearSeat(code);
      setSeat(null);
      void navigate({ to: "/" });
    } catch (e) { toast.error((e as Error).message); }
  };

  if (!me) {
    if (state.phase !== "lobby") return <Centered><p className="font-serif text-2xl">This game has already started.</p><Link to="/" className="text-lantern underline">Back home</Link></Centered>;
    return <JoinForm code={code} state={state} onJoined={async (joined) => {
      // The join response can arrive before Realtime delivers the new player.
      // Refresh the roster before checking whether this newly issued seat exists.
      await refetch();
      saveSeat(code, joined);
      setRemoved(false);
      setSeat(joined);
    }} />;
  }
  if (state.phase === "lobby") return <Lobby code={code} state={state} me={me.seatId} send={send} leave={leave} godMode={godModeUrl} />;
  if (state.phase === "won" || state.phase === "lost") return <EndScreen state={state} me={me.seatId} send={send} leave={leave} />;
  return <Game code={code} state={state} me={me.seatId} send={send} leave={leave} godMode={godModeUrl} />;
}

type Send = (body: RoomOp) => Promise<void>;

function Centered({ children }: { children: React.ReactNode }) {
  return <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">{children}</main>;
}

function JoinForm({ code, state, onJoined }: { code: string; state: GameState; onJoined: (s: Seat) => Promise<void> }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Centered>
      <h1 className="font-serif text-4xl">Room {code}</h1>
      <p className="text-muted-foreground">{state.players.length} of 8 here: {state.players.map((p) => p.name).join(", ")}</p>
      <form className="panel-night flex w-full max-w-sm flex-col gap-3 p-6" onSubmit={async (e) => {
        e.preventDefault(); if (!name.trim()) return; setBusy(true);
        try { const r = await joinRoom({ data: { code, name: name.trim() } }); const s = { token: r.token, seatId: r.seatId }; await onJoined(s); }
        catch (err) { toast.error((err as Error).message); setBusy(false); }
      }}>
        <Input value={name} maxLength={NAME_MAX} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoFocus />
        <p className="text-xs text-muted-foreground">Up to {NAME_MAX} characters, so your name always fits on the map.</p>
        <Button type="submit" disabled={busy}>Join the team</Button>
      </form>
    </Centered>
  );
}

function Lobby({ code, state, me, send, leave, godMode }: { code: string; state: GameState; me: string; send: Send; leave: () => void; godMode?: boolean }) {
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
          <li key={p.id} className="flex items-center justify-between gap-2 px-4 py-3">
            <span>{i + 1}. {p.name}{p.id === me && " (you)"}</span>
            <span className="flex items-center gap-2">
              {p.id === state.hostId && <span className="text-xs text-lantern">host</span>}
              {isHost && p.id !== me && (
                <Button size="sm" variant="outline" onClick={() => { if (window.confirm(`Remove ${p.name} from the room?`)) void send({ op: "kick", target: p.id }); }}>Remove</Button>
              )}
            </span>
          </li>
        ))}
      </ul>
      {isHost ? (
        <Button size="lg" className="w-full lantern-glow" disabled={state.players.length < 2} onClick={() => send({ op: "start" })}>
          {state.players.length < 2 ? "Waiting for at least 2 players" : `Start with ${state.players.length} players`}
        </Button>
      ) : <p className="text-center text-muted-foreground">Waiting for the host to start…</p>}
      {isHost && godMode && <GodModeButton code={code} />}
      <Button variant="ghost" className="w-full text-muted-foreground" onClick={leave}>Leave this room</Button>
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

function GodModeButton({ code }: { code: string }) {
  return <Button asChild size="sm" variant="outline"><Link to="/room/$code/god-mode" params={{ code }} target="_blank" rel="noopener noreferrer">God mode — all players</Link></Button>;
}

function Game({ code, state, me, send, leave, godMode }: { code: string; state: GameState; me: string; send: Send; leave: () => void; godMode?: boolean }) {
  const player = state.players.find((p) => p.id === me);
  const mine = state.pending[me];
  const locked = !!mine?.locked;
  // God mode (?god-mode on this window's URL): pre-select this player's planned action
  // each round. It only chooses — the player still presses Lock action, and can change it.
  const planned = useMemo(() => {
    if (!godMode || state.phase !== "playing") return undefined;
    const step = winningPlan(state).steps[0];
    return step?.round === state.round ? step.players.find((p) => p.id === me)?.action : undefined;
  }, [godMode, state, me]);
  const autoPicked = useRef("");
  useEffect(() => {
    const key = `${state.round}`;
    if (!planned || mine?.action || autoPicked.current === key) return;
    autoPicked.current = key;
    void send({ op: "choose", action: planned });
  }, [planned, mine?.action, state.round, send]);
  const [word, setWord] = useState("");
  const [restarting, setRestarting] = useState(false);
  if (!player) return null;
  const room = ROOMS[player.room];
  const isHost = state.hostId === me;
  const lockedCount = state.players.filter((p) => state.pending[p.id]?.locked).length;
  const occupants = state.players.filter((p) => p.room === player.room && p.id !== me);
  const gkHere = gkRoom(state) === player.room;
  const gkComing = GK_PATH[(state.gkIndex + 1) % GK_PATH.length] === player.room;

  const options: { label: string; action: Action; tone?: "shut" | undefined }[] = [];
  for (const [dir, to] of Object.entries(room.exits) as [Dir, string][]) {
    const a: Action = { type: "move", dir };
    if (!isLegal(state, player, a)) continue;
    const hedge = room.hedge?.includes(dir);
    options.push({ label: `${DIR_LABEL[dir]} to ${ROOMS[to as keyof typeof ROOMS].title}${hedge ? " (shut hedge)" : ""}`, action: a, tone: hedge ? "shut" : undefined });
  }
  for (const a of [{ type: "pickup" }, { type: "drop" }, { type: "usekey" }, { type: "hold" }, { type: "light" }] as Action[]) {
    if (isLegal(state, player, a)) options.push({ label: { pickup: "Pick up the iron key", drop: "Drop the iron key", usekey: "Use the iron key on the east door", hold: "Hold", light: `Light your ${player.lantern} lantern` }[a.type as "pickup"], action: a });
  }
  options.push({ label: "Wait", action: { type: "wait" } });
  // Distract is only shown the round the groundskeeper walks into this room.
  if (gkComing) options.push({ label: "Distract the groundskeeper", action: { type: "distract" } });
  const same = (a: Action) => mine && mine.action.type === a.type && mine.action.dir === a.dir && (a.type !== "speak");

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-serif text-2xl">Night Orchard</h1>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground">Round <span className="text-lantern">{state.round}</span> of {ROUND_LIMIT} · {lockedCount}/{state.players.length} locked</p>
          <Button asChild size="sm" variant="outline">
            <Link to="/how-to-play" target="_blank" rel="noopener noreferrer" aria-label="Instructions (opens in a new tab)">Instructions</Link>
          </Button>
          {isHost && godMode && <GodModeButton code={code} />}
          {isHost && (
            <Button size="sm" variant="outline" disabled={restarting} onClick={async () => {
              if (!window.confirm("Restart the game for all players? Everyone returns to their starting room at round 1. Lanterns, the key, gate progress, chosen actions, and the Event log reset. Team chat and players stay.")) return;
              setRestarting(true);
              try { await send({ op: "restart" }); } finally { setRestarting(false); }
            }}>
              <RotateCcw aria-hidden="true" />
              {restarting ? "Restarting…" : "Restart game"}
            </Button>
          )}
          <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={leave}>Leave game</Button>
        </div>
      </header>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section className="space-y-4">
          <article className="panel-parchment p-4">
            <h2 className="font-serif text-2xl font-semibold">{room.title}</h2>
            <ul className="mt-2 list-disc space-y-0.5 pl-5 font-serif text-base leading-snug">
              {room.prose.map((line, i) => (
                <li key={i} className={i > 0 && room.prose[i - 1]?.endsWith(":") ? "ml-4 list-[circle]" : undefined}>
                  {room.shrine && line === `${room.shrine} lanterns wake here.` && <LanternIcon lantern={room.shrine} size={16} className="mr-1.5" />}
                  {room.id === "orchard" && line === PASSWORD_LINE ? passwordClue(state.password || PASSWORD_PHRASES[0]!) : line}
                </li>
              ))}

            </ul>
            <div className="mt-3 space-y-1 text-xs">
              <p><b>Exits:</b> {Object.entries(room.exits).map(([d, to]) => `${DIR_LABEL[d as Dir]} — ${ROOMS[to!].title}${room.lockedExit === d && !state.doorUnlocked ? " (locked)" : ""}${room.hedge?.includes(d as Dir) ? " (woven shut)" : ""}`).join(" · ")}</p>
              <p><b>Items:</b> {state.keyRoom === player.room ? "the iron key" : "none"}</p>
              <p><b>Here with you:</b> {occupants.length ? occupants.map((p) => p.name).join(", ") : "no one"}{gkHere && " — and the groundskeeper"}</p>
              {room.id === "gate" && <p><b>Gate:</b> {state.passwordSolved ? "the password has been spoken" : "silent"}</p>}
            </div>
          </article>

          <div className="panel-night space-y-3 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="flex flex-wrap items-center gap-1.5"><LanternIcon lantern={player.lantern} size={16} />Your lantern: <b className={player.lit ? "text-lantern" : ""}>{player.lantern}{player.lit ? " — lit" : ""}</b> {player.lit ? `(lit at ${ROOMS[SHRINE_OF[player.lantern]].title})` : `(wakes at ${ROOMS[SHRINE_OF[player.lantern]].title})`}</span>
            </div>
            {player.hasKey && <p className="text-lantern">You carry the iron key</p>}
            {player.delayed && <p className="text-sm text-alert">You are delayed: your next locked action will be cancelled.</p>}
            {gkComing && <p className="text-sm text-alert">The groundskeeper walks into {room.title} this round — Distract him, or everyone here is delayed.</p>}
            <div className="grid gap-2 sm:grid-cols-2">
              {options.map((o) => (
                <Button key={o.label} disabled={locked} variant={same(o.action) ? "default" : o.tone === "shut" ? "destructive" : "outline"}
                  className="h-auto justify-start whitespace-normal py-2 text-left" onClick={() => send({ op: "choose", action: o.action })}>
                  <ActionIcon action={o.action} className="mr-1.5 shrink-0" />{o.label}</Button>
              ))}
            </div>
            {player.room === "gate" && (
              <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (word.trim()) send({ op: "choose", action: { type: "speak", text: word.trim() } }); }}>
                <Input value={word} disabled={locked} maxLength={40} onChange={(e) => setWord(e.target.value)} placeholder="Speak a password" />
                <Button type="submit" variant="outline" disabled={locked}><ActionIcon action={{ type: "speak" }} className="mr-1.5" />Speak</Button>
              </form>
            )}
            <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
              <span className="text-sm text-muted-foreground">Chosen: <span className="inline-flex items-center gap-1.5 text-foreground"><ActionIcon action={mine?.action} size={14} />{describe(mine?.action)}</span></span>
              {locked
                ? <Button variant="secondary" onClick={() => send({ op: "unlock" })}>Locked — change</Button>
                : <Button className="lantern-glow" disabled={!mine?.action} title={mine?.action ? undefined : "Choose an action first"} onClick={() => send({ op: "lock" })}>{mine?.action ? "Lock action" : "Choose an action first"}</Button>}
            </div>
          </div>

          <Chat state={state} send={send} />
        </section>

        <aside className="min-w-0 space-y-4">
          <div className="panel-night p-4"><MapView state={state} me={me} /></div>
          <Roster state={state} me={me} isHost={isHost} send={send} />
          <EventLog state={state} />
        </aside>
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
                {p.delayed && <span className="text-alert"> · delayed</span>}
              </div>
            </div>
            {state.phase === "playing" && (
              <div className="flex items-center gap-2">
                <span className={lk ? "text-hedge" : "text-muted-foreground"}>{lk ? "locked" : "choosing"}</span>
                {isHost && p.id !== me && send && (
                  <>
                    {!lk && <Button size="sm" variant="outline" onClick={() => send({ op: "forceWait", target: p.id })}>Set Wait</Button>}
                    <Button size="sm" variant="outline" onClick={() => { if (window.confirm(`Remove ${p.name} from the game? The round will continue without them.`)) void send({ op: "kick", target: p.id }); }}>Kick</Button>
                  </>
                )}
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
        {state.chat.length === 0 && <p className="text-muted-foreground">No messages yet.</p>}
        {state.chat.map((m, i) => <p key={i}><b className="text-lantern">{m.name}:</b> {m.text}</p>)}
      </div>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (text.trim()) { void send({ op: "chat", text: text.trim() }); setText(""); } }}>
        <Input value={text} maxLength={240} onChange={(e) => setText(e.target.value)} placeholder="Say something" />
        <Button type="submit" variant="secondary">Send</Button>
      </form>
    </section>
  );
}
