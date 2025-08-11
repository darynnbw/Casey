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
import { Progress } from "@/components/ui/progress";
import { Plus, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { RichTextEditor } from "./RichTextEditor";
import { TagInput } from "./TagInput";

interface AddDecisionWizardDialogProps {
  onAddDecision: (
    title: string,
    summary: string,
    context: string,
    alternatives: string,
    tags: string[],
    createdAt: string,
  ) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allTags: string[];
}

export function AddDecisionWizardDialog({ onAddDecision, open, onOpenChange, allTags }: AddDecisionWizardDialogProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [rationale, setRationale] = useState(""); // "Why this decision?"
  const [alternatives, setAlternatives] = useState(""); // "Alternatives Explored"
  const [tags, setTags] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const [showSummary, setShowSummary] = useState(false);
  const [showRationale, setShowRationale] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [showTags, setShowTags] = useState(false);

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const resetForm = () => {
    setTitle("");
    setSummary("");
    setRationale("");
    setAlternatives("");
    setTags([]);
    setSelectedDate(new Date());
    setStep(1);
    setShowSummary(false);
    setShowRationale(false);
    setShowAlternatives(false);
    setShowTags(false);
  };

  const handleOpenChangeInternal = (isOpen: boolean) => {
    onOpenChange(isOpen);
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
      onAddDecision(title.trim(), summary.trim(), rationale.trim(), alternatives.trim(), tags, selectedDate.toISOString());
      handleOpenChangeInternal(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChangeInternal}>
      <DialogContent className="sm:max-w-[550px] rounded-xl shadow-lg p-6">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-6 pr-8">
            <Progress value={progress} className="w-full h-2 mb-4" />
            <DialogTitle className="text-xl font-semibold">
              {step === 1 && "Log New Decision: Details"}
              {step === 2 && "Log New Decision: Context"}
              {step === 3 && "Review & Submit Decision"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-normal">
              {step === 1 && "Provide the main details for your decision."}
              {step === 2 && "Explain the reasoning and alternatives considered, and set the date."}
              {step === 3 && "Review your decision before saving."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
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
                    className="rounded-md px-3 py-2 border border-input/70 focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                {!showSummary && (
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowSummary(true)}
                    className="text-primary justify-start px-0 h-auto text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add summary
                  </Button>
                )}
                {showSummary && (
                  <div>
                    <Label htmlFor="decision-summary" className="text-base mb-2 block">Summary (optional)</Label>
                    <RichTextEditor
                      id="decision-summary"
                      value={summary}
                      onChange={setSummary}
                      placeholder="A brief overview of the decision."
                      className="min-h-[100px]"
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
                    className="text-primary justify-start px-0 h-auto text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add rationale
                  </Button>
                )}
                {showRationale && (
                  <div>
                    <Label htmlFor="decision-rationale" className="text-base mb-2 block">Why this decision? (optional)</Label>
                    <RichTextEditor
                      id="decision-rationale"
                      value={rationale}
                      onChange={setRationale}
                      placeholder="Explain the reasoning behind the chosen decision."
                      className="min-h-[150px]"
                    />
                  </div>
                )}
                {!showAlternatives && (
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowAlternatives(true)}
                    className="text-primary justify-start px-0 h-auto text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add alternatives explored
                  </Button>
                )}
                {showAlternatives && (
                  <div>
                    <Label htmlFor="decision-alternatives" className="text-base mb-2 block">Alternatives Explored (optional)</Label>
                    <RichTextEditor
                      id="decision-alternatives"
                      value={alternatives}
                      onChange={setAlternatives}
                      placeholder="What other options were explored?"
                      className="min-h-[100px]"
                    />
                  </div>
                )}
                {!showTags && (
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowTags(true)}
                    className="text-primary justify-start px-0 h-auto text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add tags
                  </Button>
                )}
                {showTags && (
                  <div>
                    <Label htmlFor="decision-tags" className="text-base mb-2 block">Tags (optional)</Label>
                    <TagInput
                      value={tags}
                      onChange={setTags}
                      allTags={allTags}
                      placeholder="e.g., Navigation, Mobile, Accessibility"
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
                          "w-full justify-start text-left font-normal rounded-md px-3 py-2 border border-input/70 focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
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
                    <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: summary || "N/A" }} />
                  </div>
                )}
                {rationale && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Why this decision?:</p>
                    <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: rationale || "N/A" }} />
                  </div>
                )}
                {alternatives && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Alternatives Explored:</p>
                    <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: alternatives || "N/A" }} />
                  </div>
                )}
                {tags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Tags:</p>
                    <p className="text-base text-muted-foreground">{tags.join(', ')}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">Date:</p>
                  <p className="text-base text-muted-foreground">{selectedDate ? format(selectedDate, "PPP") : "N/A"}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between items-center pt-6">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={handleBack} className="rounded-lg px-4 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                Back
              </Button>
            )}
            <div className="flex-grow" />
            {step < totalSteps ? (
              <Button type="button" onClick={handleNext} className="rounded-lg px-4 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                Next
              </Button>
            ) : (
              <Button type="submit" className="rounded-lg px-4 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                Save Decision
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}