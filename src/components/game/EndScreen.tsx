import { Button } from "@/components/ui/button";
import type { GameState } from "@/game/engine";
import { ROOMS, ROUND_LIMIT } from "@/game/map";

interface EndScreenProps {
  state: GameState;
  me: string;
  send: (body: { op: "restart" }) => Promise<void> | void;
  leave: () => void;
}

/** Retro CRT end screen shown to every player when the game is won or lost. */
export function EndScreen({ state, me, send, leave }: EndScreenProps) {
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
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="crt-frame crt-flicker w-full max-w-2xl p-6 sm:p-10">
        {/* scanline + vignette overlay */}
        <div className="crt-scanlines pointer-events-none absolute inset-0" aria-hidden="true" />

        <div className="relative space-y-8 text-center">
          <header className="space-y-4">
            <p className="font-pixel text-[10px] uppercase tracking-widest text-muted-foreground">
              Night Orchard · Round {state.round} of {ROUND_LIMIT}
            </p>
            <h1
              className={`font-pixel text-3xl leading-relaxed sm:text-4xl ${won ? "text-lantern" : "text-shut"}`}
              style={{ textShadow: "0 0 18px currentColor" }}
            >
              {won ? "YOU ESCAPED!" : "GAME OVER"}
            </h1>
            <p className="font-serif text-lg text-muted-foreground">
              {won ? "The gate closes behind you. Dawn finds the garden empty." : "The garden locks again at dawn. Nobody made it out."}
            </p>
          </header>

          {/* high-score style roster */}
          <section className="mx-auto max-w-md border-2 border-dashed border-border p-4 text-left">
            <p className="mb-3 text-center font-pixel text-[10px] uppercase tracking-widest text-lantern">— Team roster —</p>
            <ul className="space-y-2 font-mono text-sm">
              {state.players.map((p) => (
                <li key={p.id} className="flex items-baseline justify-between gap-3">
                  <span className="truncate">
                    <b>{p.name}</b>
                    <span className="text-muted-foreground"> · {p.lantern}</span>
                  </span>
                  <span className={p.room === "outer_lawn" ? "text-hedge" : "text-shut"}>
                    {p.room === "outer_lawn" ? `OUT · R${p.outAt ?? "?"}` : `IN · ${ROOMS[p.room].title.toUpperCase()}`}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* reflection questions */}
          <section className="mx-auto max-w-md space-y-4 text-left font-serif text-sm">
            <div>
              <p className="font-pixel text-[9px] uppercase tracking-widest text-lantern">Who spent a turn so someone else could move?</p>
              <p className="mt-1">{helpers.length ? helpers.map((h) => `${h.name} (${h.helped})`).join(", ") : "No one held or distracted."}</p>
            </div>
            <div>
              <p className="font-pixel text-[9px] uppercase tracking-widest text-lantern">Who was left inside the longest?</p>
              <p className="mt-1">{last.map((p) => p.name).join(", ")}</p>
            </div>
            <div>
              <p className="font-pixel text-[9px] uppercase tracking-widest text-lantern">Clues only found because someone read their room aloud</p>
              {clues.length ? clues.map((c) => <p key={c as string} className="mt-1">{c}</p>) : <p className="mt-1">None were found.</p>}
            </div>
          </section>

          <footer className="space-y-3 pt-2">
            {state.hostId === me ? (
              <>
                <p className="crt-blink font-pixel text-[10px] uppercase tracking-widest text-lantern">Press restart to play again</p>
                <Button size="lg" className="w-full font-pixel text-xs lantern-glow" onClick={() => void send({ op: "restart" })}>
                  ▸ Restart
                </Button>
              </>
            ) : (
              <p className="crt-blink font-pixel text-[10px] uppercase tracking-widest text-muted-foreground">Waiting for the host to restart…</p>
            )}
            <Button variant="ghost" className="w-full text-muted-foreground" onClick={leave}>Leave this room</Button>
          </footer>
        </div>
      </div>
    </main>
  );
}
