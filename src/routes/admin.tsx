import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { LogOut, Trash2, ArrowLeft } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import "@lovable.dev/cloud-auth-js/styles.css";
import { Button } from "@/components/ui/button";
import { isOwnerEmail } from "@/lib/feedback";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Admin — Night Orchard" },
    { name: "description", content: "Owner-only moderation of Night Orchard bug reports and suggestions." },
    { name: "robots", content: "noindex" },
    { property: "og:title", content: "Night Orchard admin" },
    { property: "og:description", content: "Owner-only report moderation." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AdminPage,
});

function AdminPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") setUser(session?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  if (user === undefined) return <main className="p-8">Loading…</main>;
  if (!user) return <main className="mx-auto max-w-md space-y-5 px-5 py-16 text-center">
    <h1 className="font-serif text-3xl">Admin sign-in</h1>
    <p className="text-muted-foreground">Sign in with the owner's Lovable account.</p>
    <button type="button" className="lovable-auth-button" onClick={() => void lovable.auth.signInWithOAuth("lovable", { redirect_uri: `${window.location.origin}/admin` })}>Sign in with Lovable</button>
  </main>;
  if (!isOwnerEmail(user.email)) return <main className="mx-auto max-w-md space-y-5 px-5 py-16 text-center">
    <h1 className="font-serif text-3xl">Access denied</h1>
    <p className="text-muted-foreground">This account can't open the admin page.</p>
    <Button variant="outline" onClick={() => void supabase.auth.signOut()}><LogOut />Sign out</Button>
  </main>;
  return <Reports />;
}

function Reports() {
  const qc = useQueryClient();
  const [error, setError] = useState("");
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-feedback"], queryFn: async () => {
    const { data, error } = await supabase.from("game_feedback").select("id,title,description,created_at").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  } });
  async function remove(id: string) {
    if (!confirm("Delete this report permanently?")) return;
    const { error, count } = await supabase.from("game_feedback").delete({ count: "exact" }).eq("id", id);
    setError(error || !count ? "The report could not be deleted." : "");
    await qc.invalidateQueries({ queryKey: ["admin-feedback"] });
    await qc.invalidateQueries({ queryKey: ["feedback"] });
  }
  return <main className="mx-auto max-w-4xl space-y-6 px-5 py-10">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
      <h1 className="font-serif text-3xl">Bug reports and suggestions</h1>
      <div className="flex gap-2"><Button asChild variant="ghost"><Link to="/dashboard"><ArrowLeft />Dashboard</Link></Button><Button variant="outline" onClick={() => { qc.clear(); void supabase.auth.signOut(); }}><LogOut />Sign out</Button></div>
    </header>
    {error && <p role="alert" className="text-alert">{error}</p>}
    {isLoading ? <p>Loading…</p> : data.length === 0 ? <p className="text-muted-foreground">No reports.</p> :
      <ul className="divide-y divide-border">{data.map((r) => <li key={r.id} className="flex items-start justify-between gap-4 py-4">
        <div className="min-w-0 space-y-1"><h2 className="break-words font-medium">{r.title}</h2><p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{r.description}</p><time className="text-xs text-muted-foreground">{new Date(r.created_at).toISOString().replace("T", " ").slice(0, 16)} UTC</time></div>
        <Button variant="destructive" size="sm" onClick={() => void remove(r.id)} aria-label={`Delete ${r.title}`}><Trash2 />Delete</Button>
      </li>)}</ul>}
  </main>;
}
