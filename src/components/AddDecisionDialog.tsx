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
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);

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
      setShowAdvancedFields(false); // Reset advanced fields visibility
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
      <DialogContent className="sm:max-w-[500px] rounded-xl shadow-lg p-0">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <DialogHeader className="p-6 pb-4 border-b border-border/50">
            <DialogTitle className="text-2xl font-bold">Log New Decision</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Document a design decision, its context, and rationale.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            {/* Core Decision Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">Core Information</h3>
              <div className="grid gap-4">
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
              </div>
            </div>

            <Separator />

            {/* Advanced Fields Toggle */}
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAdvancedFields(!showAdvancedFields)}
              className="w-full justify-center text-primary hover:text-primary/80 rounded-lg"
            >
              {showAdvancedFields ? (
                <>
                  Hide Details <ChevronUp className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Show More Details <ChevronDown className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            {/* Advanced Fields Section (conditionally rendered) */}
            {showAdvancedFields && (
              <div className="space-y-6 pt-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-foreground">Context & Rationale</h3>
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="decision-summary" className="text-base">Summary</Label>
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
                      <Label htmlFor="decision-context" className="text-base">Problem/Context</Label>
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
                      <Label htmlFor="decision-alternatives" className="text-base">Alternatives Considered</Label>
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
                      <Label htmlFor="decision-rationale" className="text-base">Why this decision?</Label>
                      <Textarea
                        id="decision-rationale"
                        value={rationale}
                        onChange={(e) => setRationale(e.target.value)}
                        placeholder="Explain the reasoning behind the chosen decision."
                        rows={4}
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4 text-foreground">Categorization</h3>
                  <div>
                    <Label htmlFor="decision-tags" className="text-base">Tags</Label>
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
              </div>
            )}
          </div>

          <DialogFooter className="p-6 pt-4 border-t border-border/50 bg-background sticky bottom-0">
            <Button type="submit" className="rounded-lg px-4 py-2.5 w-full">Save Decision</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}