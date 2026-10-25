import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Activity, ArrowLeft, RefreshCw, Users, Trophy, Moon, WandSparkles, MapPin, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanternIcon } from "@/components/game/LanternIcon";
import { getActivityDashboard } from "@/game/activity.functions";

const activityQuery = queryOptions({ queryKey: ["activity-dashboard"], queryFn: () => getActivityDashboard(), refetchInterval: 30_000 });

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [
    { title: "Game activity dashboard — Night Orchard" },
    { name: "description", content: "Night Orchard game activity, players, victories, defeats, God mode use, and approximate player locations." },
    { property: "og:title", content: "Night Orchard · Game activity" },
    { property: "og:description", content: "See how many teams played, escaped the garden, and where players come from." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(activityQuery),
  errorComponent: DashboardError,
  notFoundComponent: () => <main className="p-8">Activity not found.</main>,
  component: DashboardPage,
});

function DashboardError() {
  const router = useRouter();
  return <main className="mx-auto max-w-xl space-y-4 px-5 py-16"><h1 className="font-serif text-3xl">Game activity</h1><p role="alert">Activity could not be loaded.</p><Button onClick={() => void router.invalidate()}><RefreshCw />Try again</Button><Button asChild variant="outline"><Link to="/">Back to game</Link></Button></main>;
}

function DashboardPage() {
  const { data, refetch, isFetching } = useSuspenseQuery(activityQuery);
  const finished = data.wins + data.losses;
  const rate = finished ? Math.round(data.wins / finished * 100) : 0;
  const metrics = [
    { label: "Games played", value: data.games, icon: Activity, detail: `${data.active} in progress`, tone: "text-lantern" },
    { label: "Players", value: data.players, icon: Users, detail: "Unique player seats", tone: "text-foreground" },
    { label: "Victories", value: data.wins, icon: Trophy, detail: "Everyone escaped", tone: "text-lantern" },
    { label: "Defeats", value: data.losses, icon: Moon, detail: "Dawn reached the garden", tone: "text-alert" },
    { label: "God mode games", value: data.godMode, icon: WandSparkles, detail: "Testing guide used", tone: "text-lantern" },
  ];
  return (
    <main className="mx-auto max-w-6xl space-y-10 px-5 py-10">
      <header className="flex flex-wrap items-center justify-between gap-5 border-b border-border pb-6">
        <div><p className="mb-3 flex items-center gap-2 text-sm text-lantern"><LanternIcon lantern="Oak" size={22} />Night Orchard</p><h1 className="font-serif text-4xl">Game activity</h1></div>
        <div className="flex gap-2"><Button variant="outline" onClick={() => void refetch()} disabled={isFetching}><RefreshCw className={isFetching ? "animate-spin" : ""} />Refresh</Button><Button asChild variant="ghost"><Link to="/"><ArrowLeft />Back to game</Link></Button></div>
      </header>
      <section aria-label="Activity totals" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map(({ label, value, icon: Icon, detail, tone }) => <article key={label} className="rounded-md border border-border bg-card p-5"><div className="flex items-center justify-between gap-2"><h2 className="text-sm text-muted-foreground">{label}</h2><Icon size={18} className={tone} /></div><p className={`my-4 font-serif text-4xl tabular-nums ${tone}`}>{value.toLocaleString("en-US")}</p><p className="text-xs text-muted-foreground">{detail}</p></article>)}
      </section>
      <section className="grid gap-8 border-b border-border pb-8 md:grid-cols-[1fr_2fr]" aria-label="Game outcomes">
        <div><h2 className="flex items-center gap-2 font-serif text-2xl"><Flame size={22} className="text-lantern" />Escape record</h2><p className="mt-2 text-sm text-muted-foreground">Completed games only</p></div>
        <div className="grid gap-6 sm:grid-cols-3"><div><p className="text-3xl text-lantern">{finished ? `${rate}%` : "—"}</p><p className="mt-1 text-sm text-muted-foreground">Win rate · {finished} completed</p></div><div><p className="text-3xl">{data.restarted}</p><p className="mt-1 text-sm text-muted-foreground">Restarted before finishing</p></div><div><p className="text-3xl">{data.abandoned}</p><p className="mt-1 text-sm text-muted-foreground">Abandoned games</p></div></div>
      </section>
      <section className="space-y-5" aria-label="Player locations">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="flex items-center gap-2 font-serif text-2xl"><MapPin size={22} className="text-lantern" />Where players are from</h2><p className="mt-2 text-sm text-muted-foreground">Approximate city, state / region, and country</p></div><p className="text-sm text-muted-foreground">{data.locatedPlayers} located · {Math.max(0, data.players - data.locatedPlayers)} unknown</p></div>
        {data.locations.length === 0 ? <div className="border-y border-border py-10 text-center"><MapPin className="mx-auto mb-3 text-muted-foreground" /><p>No player locations available yet.</p></div> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-y border-border bg-muted/40 text-muted-foreground"><tr><th className="px-3 py-3 font-medium">City</th><th className="px-3 py-3 font-medium">State / region</th><th className="px-3 py-3 font-medium">Country</th><th className="px-3 py-3 text-right font-medium">Players</th></tr></thead><tbody className="divide-y divide-border">{data.locations.map((location) => <tr key={JSON.stringify([location.city, location.region, location.country])}><td className="px-3 py-4">{location.city || "Unknown"}</td><td className="px-3 py-4">{location.region || "Unknown"}</td><td className="px-3 py-4">{location.country}</td><td className="px-3 py-4 text-right tabular-nums text-lantern">{location.players}</td></tr>)}</tbody></table></div>}
        <p className="text-xs leading-relaxed text-muted-foreground">Only approximate locations are saved, never IP addresses. VPNs and network providers may affect accuracy. Players are counted by their game seats, not identified people.</p>
      </section>
      <footer className="border-t border-border pt-5 text-xs text-muted-foreground">{data.historical > 0 ? `${data.historical} existing games included; earlier restarts and locations were not recorded. ` : ""}New activity is recorded from now on. Totals update every 30 seconds.</footer>
    </main>
  );
}