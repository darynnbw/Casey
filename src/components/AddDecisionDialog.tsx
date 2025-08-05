import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";

interface AddDecisionDialogProps {
  onAddDecision: (
    title: string,
    summary: string,
    context: string,
    alternatives: string,
    rationale: string,
    status: string,
    tags: string[]
  ) => void;
}

export function AddDecisionDialog({ onAddDecision }: AddDecisionDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [context, setContext] = useState("");
  const [alternatives, setAlternatives] = useState("");
  const [rationale, setRationale] = useState("");
  const [status, setStatus] = useState("Proposed");
  const [tags, setTags] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
      onAddDecision(
        title.trim(),
        summary.trim(),
        context.trim(),
        alternatives.trim(),
        rationale.trim(),
        status,
        tagArray
      );
      setTitle("");
      setSummary("");
      setContext("");
      setAlternatives("");
      setRationale("");
      setStatus("Proposed");
      setTags("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-lg">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Add Decision
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-xl shadow-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Log New Decision</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Document a design decision, its context, and rationale.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <div>
              <Label htmlFor="decision-title" className="text-base">Title</Label>
              <Input
                id="decision-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Chose sticky header for navigation"
                autoFocus
                required
                className="rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="decision-summary" className="text-base">Summary (optional)</Label>
              <Textarea
                id="decision-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="A brief overview of the decision."
                rows={2}
                className="rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="decision-context" className="text-base">Problem/Context (optional)</Label>
              <Textarea
                id="decision-context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="What problem or situation led to this decision?"
                rows={3}
                className="rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="decision-alternatives" className="text-base">Alternatives Considered (optional)</Label>
              <Textarea
                id="decision-alternatives"
                value={alternatives}
                onChange={(e) => setAlternatives(e.target.value)}
                placeholder="What other options were explored?"
                rows={3}
                className="rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="decision-rationale" className="text-base">Why this decision? (optional)</Label>
              <Textarea
                id="decision-rationale"
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                placeholder="Explain the reasoning behind the chosen decision."
                rows={4}
                className="rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="decision-status" className="text-base">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full rounded-lg">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="Proposed">Proposed</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Final">Final</SelectItem>
                  <SelectItem value="Revisited">Revisited</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="decision-tags" className="text-base">Tags (optional)</Label>
              <Input
                id="decision-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., Navigation, Mobile, Accessibility"
                className="rounded-lg"
              />
              <p className="text-sm text-muted-foreground mt-1">Separate tags with a comma.</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="rounded-lg px-4 py-2.5">Save Decision</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}