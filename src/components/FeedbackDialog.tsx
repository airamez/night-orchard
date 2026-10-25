import { useState } from "react";
import { Bug, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { feedbackEmail, feedbackSchema } from "@/lib/feedback";

export function FeedbackDialog() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [prepared, setPrepared] = useState(false);
  return <footer className="mx-auto flex max-w-6xl justify-center px-5 py-5">
    <Dialog>
      <DialogTrigger asChild><Button variant="outline" size="sm"><Bug />Report Bugs or Suggestion</Button></DialogTrigger>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto">
        <DialogHeader><DialogTitle>Report a bug or suggestion</DialogTitle><DialogDescription>To night.orchard@airamez.com</DialogDescription></DialogHeader>
        <form className="space-y-4" onSubmit={(event) => {
          event.preventDefault();
          const parsed = feedbackSchema.safeParse({ title, description });
          if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Check your report."); return; }
          setError("");
          window.location.href = feedbackEmail(parsed.data);
          setPrepared(true);
        }}>
          <div className="space-y-2"><Label htmlFor="report-title">Title</Label><Input id="report-title" value={title} required maxLength={255} onChange={(e) => { setTitle(e.target.value); setPrepared(false); }} /><p className="text-right text-xs text-muted-foreground">{title.length}/255</p></div>
          <div className="space-y-2"><Label htmlFor="report-description">Description</Label><Textarea id="report-description" value={description} required maxLength={255} rows={5} onChange={(e) => { setDescription(e.target.value); setPrepared(false); }} /><p className="text-right text-xs text-muted-foreground">{description.length}/255</p></div>
          {error && <p role="alert" className="text-alert">{error}</p>}
          <p className="text-sm text-muted-foreground">{prepared ? "Your report is prepared. Send it from your email app; it has not been sent here." : "Opens your email app with the report filled in. Send it there."}</p>
          <Button type="submit"><Mail />Open email draft</Button>
        </form>
      </DialogContent>
    </Dialog>
  </footer>;
}