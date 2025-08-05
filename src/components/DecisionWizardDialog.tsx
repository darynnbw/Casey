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
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";

interface DecisionWizardDialogProps {
  onAddDecision: (
    title: string,
    summary: string,
    context: string, // This will be the rationale
    alternatives: string,
    rationale: string, // This will be unused, but kept for type compatibility
    status: string, // This will be hardcoded to 'Final' for simplicity in wizard
    tags: string[] // This will be unused for simplicity in wizard
  ) => void;
}

export function DecisionWizardDialog({ onAddDecision }: DecisionWizardDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [rationale, setRationale] = useState(""); // "Why this decision?"
  const [alternatives, setAlternatives] = useState(""); // "Alternatives Explored"

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const resetForm = () => {
    setTitle("");
    setSummary("");
    setRationale("");
    setAlternatives("");
    setStep(1);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  const handleNext = () => {
    if (step === 1 && !title.trim()) {
      // Basic validation for title
      alert("Title is required.");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      // For simplicity in the wizard, status is 'Final' and tags are empty
      onAddDecision(title.trim(), summary.trim(), rationale.trim(), alternatives.trim(), "", "Final", []);
      handleOpenChange(false); // Close dialog and reset form
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-lg">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Add Decision
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-xl shadow-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <Progress value={progress} className="w-full h-2 mb-4" />
            <DialogTitle className="text-2xl font-bold">
              {step === 1 && "Log New Decision: Details"}
              {step === 2 && "Log New Decision: Context"}
              {step === 3 && "Review & Submit Decision"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {step === 1 && "Provide the main details for your decision."}
              {step === 2 && "Explain the reasoning and alternatives considered."}
              {step === 3 && "Review your decision before saving."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-6">
            {step === 1 && (
              <>
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
              </>
            )}

            {step === 2 && (
              <>
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
                  <Label htmlFor="decision-alternatives" className="text-base">Alternatives Explored (optional)</Label>
                  <Textarea
                    id="decision-alternatives"
                    value={alternatives}
                    onChange={(e) => setAlternatives(e.target.value)}
                    placeholder="What other options were explored?"
                    rows={3}
                    className="rounded-lg"
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Title:</p>
                  <p className="text-base text-muted-foreground">{title || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Summary:</p>
                  <p className="text-base text-muted-foreground whitespace-pre-wrap">{summary || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Why this decision?:</p>
                  <p className="text-base text-muted-foreground whitespace-pre-wrap">{rationale || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Alternatives Explored:</p>
                  <p className="text-base text-muted-foreground whitespace-pre-wrap">{alternatives || "N/A"}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between items-center">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={handleBack} className="rounded-lg px-4 py-2.5">
                Back
              </Button>
            )}
            <div className="flex-grow" /> {/* Spacer */}
            {step < totalSteps ? (
              <Button type="button" onClick={handleNext} className="rounded-lg px-4 py-2.5">
                Next
              </Button>
            ) : (
              <Button type="submit" className="rounded-lg px-4 py-2.5">
                Save Decision
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}