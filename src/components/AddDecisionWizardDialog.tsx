import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Plus, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface AddDecisionWizardDialogProps {
  onAddDecision: (
    title: string,
    summary: string,
    context: string, // This will be the rationale from the wizard
    alternatives: string,
    createdAt: string,
  ) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddDecisionWizardDialog({ onAddDecision, open, onOpenChange }: AddDecisionWizardDialogProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [rationale, setRationale] = useState(""); // "Why this decision?"
  const [alternatives, setAlternatives] = useState(""); // "Alternatives Explored"
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const [showSummary, setShowSummary] = useState(false);
  const [showRationale, setShowRationale] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const resetForm = () => {
    setTitle("");
    setSummary("");
    setRationale("");
    setAlternatives("");
    setSelectedDate(new Date());
    setStep(1);
    setShowSummary(false);
    setShowRationale(false);
    setShowAlternatives(false);
  };

  const handleOpenChangeInternal = (isOpen: boolean) => {
    onOpenChange(isOpen); // Propagate change to parent
    if (!isOpen) {
      resetForm();
    }
  };

  const handleNext = () => {
    if (step === 1 && !title.trim()) {
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
    if (title.trim() && selectedDate) {
      // The wizard's 'rationale' is mapped to 'context' in the Decision type.
      // The Decision type's 'rationale' field is left unused by this wizard.
      onAddDecision(title.trim(), summary.trim(), rationale.trim(), alternatives.trim(), selectedDate.toISOString());
      handleOpenChangeInternal(false); // Close dialog and reset form
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChangeInternal}>
      {/* DialogTrigger removed as it's now handled by AddActionsDropdown */}
      <DialogContent className="sm:max-w-[550px] rounded-xl shadow-lg p-6"> {/* Increased max-w and padding */}
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-6 px-4"> {/* Added px-4 here */}
            <Progress value={progress} className="w-full h-2 mb-4" />
            <DialogTitle className="text-xl font-semibold"> {/* Smaller font, lighter weight */}
              {step === 1 && "Log New Decision: Details"}
              {step === 2 && "Log New Decision: Context"}
              {step === 3 && "Review & Submit Decision"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-normal"> {/* Lighter font weight */}
              {step === 1 && "Provide the main details for your decision."}
              {step === 2 && "Explain the reasoning and alternatives considered, and set the date."}
              {step === 3 && "Review your decision before saving."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4"> {/* Increased gap and vertical padding */}
            {step === 1 && (
              <>
                <div>
                  <Label htmlFor="decision-title" className="text-base mb-2 block">Title</Label>
                  <Input
                    id="decision-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Chose sticky header for navigation"
                    autoFocus
                    required
                    className="rounded-md px-3 py-2 border border-input/70 focus:border-primary" // Subtler border, reduced radius
                  />
                </div>
                {!showSummary && (
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowSummary(true)}
                    className="text-primary justify-start px-0 h-auto text-sm"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add summary
                  </Button>
                )}
                {showSummary && (
                  <div>
                    <Label htmlFor="decision-summary" className="text-base mb-2 block">Summary (optional)</Label>
                    <Textarea
                      id="decision-summary"
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="A brief overview of the decision."
                      rows={2}
                      className="rounded-md px-3 py-2 border border-input/70 focus:border-primary" // Subtler border, reduced radius
                    />
                  </div>
                )}
              </>
            )}

            {step === 2 && (
              <>
                {!showRationale && (
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowRationale(true)}
                    className="text-primary justify-start px-0 h-auto text-sm"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add rationale
                  </Button>
                )}
                {showRationale && (
                  <div>
                    <Label htmlFor="decision-rationale" className="text-base mb-2 block">Why this decision? (optional)</Label>
                    <Textarea
                      id="decision-rationale"
                      value={rationale}
                      onChange={(e) => setRationale(e.target.value)}
                      placeholder="Explain the reasoning behind the chosen decision."
                      rows={4}
                      className="rounded-md px-3 py-2 border border-input/70 focus:border-primary" // Subtler border, reduced radius
                    />
                  </div>
                )}
                {!showAlternatives && (
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowAlternatives(true)}
                    className="text-primary justify-start px-0 h-auto text-sm"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add alternatives explored
                  </Button>
                )}
                {showAlternatives && (
                  <div>
                    <Label htmlFor="decision-alternatives" className="text-base mb-2 block">Alternatives Explored (optional)</Label>
                    <Textarea
                      id="decision-alternatives"
                      value={alternatives}
                      onChange={(e) => setAlternatives(e.target.value)}
                      placeholder="What other options were explored?"
                      rows={3}
                      className="rounded-md px-3 py-2 border border-input/70 focus:border-primary" // Subtler border, reduced radius
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="decision-date" className="text-base mb-2 block">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal rounded-md px-3 py-2 border border-input/70 focus:border-primary",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-xl">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Title:</p>
                  <p className="text-base text-muted-foreground">{title || "N/A"}</p>
                </div>
                {summary && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Summary:</p>
                    <p className="text-base text-muted-foreground whitespace-pre-wrap">{summary || "N/A"}</p>
                  </div>
                )}
                {rationale && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Why this decision?:</p>
                    <p className="text-base text-muted-foreground whitespace-pre-wrap">{rationale || "N/A"}</p>
                  </div>
                )}
                {alternatives && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Alternatives Explored:</p>
                    <p className="text-base text-muted-foreground whitespace-pre-wrap">{alternatives || "N/A"}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">Date:</p>
                  <p className="text-base text-muted-foreground">{selectedDate ? format(selectedDate, "PPP") : "N/A"}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between items-center pt-6"> {/* Increased padding-top */}
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