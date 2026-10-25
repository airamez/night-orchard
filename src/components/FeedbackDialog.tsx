import { useState } from "react";
import { Bug, Send, Check } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { feedbackSchema } from "@/lib/feedback";

export function FeedbackDialog() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const reset = () => { setTitle(""); setDescription(""); setError(""); setSaved(false); };
  return <footer className="mx-auto flex max-w-6xl justify-center px-5 py-5">
    <Dialog open={open} onOpenChange={(next) => { if (saving) return; setOpen(next); if (!next) reset(); }}>
      <DialogTrigger asChild><Button variant="outline" size="sm"><Bug />Report Bugs or Suggestion</Button></DialogTrigger>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto">
        <DialogHeader><DialogTitle>Report a bug or suggestion</DialogTitle><DialogDescription>Reports appear on the public dashboard. Please do not include personal information.</DialogDescription></DialogHeader>
        <form className="space-y-4" onSubmit={async (event) => {
          event.preventDefault();
          if (saving || saved) return;
          const parsed = feedbackSchema.safeParse({ title, description });
          if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Check your report."); return; }
          setError("");
          setSaving(true);
          try {
            const { error: saveError } = await supabase.from("game_feedback").insert(parsed.data);
            if (saveError) throw new Error("Save failed");
            setTitle(""); setDescription(""); setSaved(true);
            await queryClient.invalidateQueries({ queryKey: ["feedback"] });
          } catch { setError("Your report could not be saved. Please try again."); }
          finally { setSaving(false); }
        }}>
          <div className="space-y-2"><Label htmlFor="report-title">Title</Label><Input id="report-title" value={title} required disabled={saving} maxLength={255} onChange={(e) => { setTitle(e.target.value); setSaved(false); }} /><p className="text-right text-xs text-muted-foreground">{title.length}/255</p></div>
          <div className="space-y-2"><Label htmlFor="report-description">Description</Label><Textarea id="report-description" value={description} required disabled={saving} maxLength={255} rows={5} onChange={(e) => { setDescription(e.target.value); setSaved(false); }} /><p className="text-right text-xs text-muted-foreground">{description.length}/255</p></div>
          {error && <p role="alert" className="text-alert">{error}</p>}
          {saved && <p role="status" className="text-lantern">Your report was saved. Thank you!</p>}
          <Button type="submit" disabled={saving || saved}>{saved ? <Check /> : <Send />}{saving ? "Saving…" : saved ? "Saved" : "Submit report"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  </footer>;
}