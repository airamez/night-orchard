import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { LanternIcon } from "@/components/game/LanternIcon";
import { ActionIcon } from "@/components/game/ActionIcon";
import { loadSeat, useRoom } from "@/game/useRoom";
import { trackVisit } from "@/game/trackVisit";
import { ROOMS, ROUND_LIMIT } from "@/game/map";
import { lockWarnings, winningAction, winningPlan } from "@/game/winningPlan";

export const Route = createFileRoute("/room/$code_/god-mode")({
  head: ({ params }) => ({ meta: [
    { title: `God mode · ${params.code.toUpperCase()} — Night Orchard` },
    { name: "description", content: "Live, round-by-round winning actions for every player in your Night Orchard test room." },
    { property: "og:title", content: `Night Orchard testing guide · ${params.code.toUpperCase()}` },
    { property: "og:description", content: "A complete team action plan for testing a cooperative escape." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: GodMode,
});

function GodMode() {
  const code = Route.useParams().code.toUpperCase();
  const { state, missing } = useRoom(code);
  useEffect(() => {
    const seat = loadSeat(code);
    if (seat && state?.players.some((p) => p.id === seat.seatId)) void trackVisit({ code, token: seat.token, godMode: true }).catch(() => {});
  }, [code, state?.phase, state?.password]);
  const plan = useMemo(() => state ? winningPlan(state) : null, [state]);
  const warnings = useMemo(() => state && plan ? lockWarnings(state, plan) : [], [state, plan]);
  const spare = plan?.won ? ROUND_LIMIT - (plan.steps.at(-1)?.round ?? ROUND_LIMIT) : 0;
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="text-sm text-lantern">Night Orchard · Room {code}</p>
          <h1 className="mt-2 font-pixel text-xl leading-relaxed">God mode</h1>
        </div>
        <Button asChild variant="outline"><Link to="/room/$code" params={{ code }}>Game room</Link></Button>
      </header>
      {missing ? <p>No room with code {code}.</p> : !state || !plan ? <p className="text-muted-foreground">Opening the testing guide…</p> : (
        <>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl">Winning steps for every player</h2>
            <p className="text-muted-foreground">In each player's window, choose the action below and press Lock action. Lock every player, including anyone already outside, to advance the round.</p>
            <p className="text-sm text-lantern">Shortcut: open each player's window with <code>/room/{code}?god-mode</code> and their planned action is chosen for them every round — just press Lock action.</p>
            <p className="text-sm text-muted-foreground">This guide updates with the room and does not play for you. It reveals the password, so the key and Orchard detour are not needed.</p>
          </div>
          {state.phase === "lobby" && <p className="text-lantern">Start the game in the owner's window. These steps use the starting rooms assigned to this team.</p>}
          {warnings.length > 0 && (
            <div role="alert" className="space-y-1 border border-alert p-3 text-sm">
              <p className="font-semibold text-alert">A locked action is off-plan and {plan.won ? "slows the escape" : "loses the game"}:</p>
              <ul className="list-disc pl-5">
                {warnings.map((w) => (
                  <li key={w.id}><b>{w.name}</b> locked “{winningAction(w.locked, w.room)}”. In {w.name}'s window press “Locked — change” and choose <b className="text-lantern">{winningAction(w.suggested, w.room)}</b>.</li>
                ))}
              </ul>
            </div>
          )}
          {state.phase === "won" ? <p className="font-serif text-3xl text-lantern">Everyone escaped — victory!</p> : state.phase === "lost" ? <p className="text-alert">Dawn has arrived. Restart from the owner's window for a fresh winning plan.</p> : !plan.won ? (
            <div className="space-y-2 text-alert">
              {plan.impossible
                ? <p>The team can no longer reach the Outer Lawn before dawn (round {ROUND_LIMIT}) from round {state.round} — every possible sequence of moves was checked. Earlier rounds went off-plan (a missed move, a Wait, or a groundskeeper delay), and the plan had no spare rounds left.</p>
                : <p>No complete winning plan found from this position.</p>}
              <p>Restart from the owner's window to follow a fresh plan. Tip: in each window, click the action first so “Chosen” shows it, then press Lock action — locking without choosing locks Wait.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">{spare > 0 ? `Spare rounds before dawn: ${spare}. Each missed or wrong action usually costs one.` : "No spare rounds — every action below must be followed exactly."}</p>
              {plan.steps.map((step, index) => (
                <section key={step.round} aria-label={`Round ${step.round}`} className="border-t border-border pt-4">
                  <h3 className="mb-3 flex flex-wrap items-center gap-3 font-serif text-xl">
                    Round {step.round}
                    {index === 0 && <span className="font-sans text-sm text-lantern">{state.phase === "lobby" ? "First round" : "Do these actions now"}</span>}
                  </h3>
                  <ul className="divide-y divide-border">
                    {step.players.map((p) => {
                      const player = state.players.find((item) => item.id === p.id);
                      const locked = index === 0 && state.pending[p.id]?.locked;
                      return (
                        <li key={p.id} className="grid items-start gap-2 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_6rem]">
                          <div className="flex min-w-0 items-center gap-2">
                            {player && <LanternIcon lantern={player.lantern} size={20} className="shrink-0" />}
                            <div className="min-w-0"><b className="break-words">{p.name}</b><p className="text-xs text-muted-foreground">{ROOMS[p.room].title}</p></div>
                          </div>
                          <p className="flex items-center gap-1.5 font-semibold text-lantern"><ActionIcon action={p.action} size={14} className="shrink-0" />{winningAction(p.action, p.room)}</p>
                          <span className="text-xs text-muted-foreground">{locked ? "Locked ✓" : index === 0 ? "Choose + lock" : "Then lock"}</span>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
              <p className="border-t border-border pt-4 text-lantern">Finish round {plan.steps.at(-1)?.round}: every player reaches the Outer Lawn with a lit lantern.</p>
            </div>
          )}
        </>
      )}
    </main>
  );
}