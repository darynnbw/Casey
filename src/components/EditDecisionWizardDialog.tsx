import { useState, useEffect } from "react";
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
import { Decision } from "@/types";
import { RichTextEditor } from "./RichTextEditor"; // Import the new component

interface EditDecisionWizardDialogProps {
  initialData: Decision | null;
  onUpdateDecision: (
    id: string,
    title: string,
    summary: string,
    context: string,
    alternatives: string,
    rationale: string,
    tags: string[],
    created_at: string, // Changed to created_at
  ) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditDecisionWizardDialog({ initialData, onUpdateDecision, open, onOpenChange }: EditDecisionWizardDialogProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState(initialData?.title || "");
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [context, setContext] = useState(initialData?.context || ""); // Problem/Context
  const [alternatives, setAlternatives] = useState(initialData?.alternatives || "");
  const [rationale, setRationale] = useState(initialData?.rationale || ""); // Why this decision?
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || "");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialData?.created_at ? new Date(initialData.created_at) : new Date());

  const [showSummary, setShowSummary] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [showRationale, setShowRationale] = useState(false);
  const [showTags, setShowTags] = useState(false);

  const totalSteps = 4; // Title/Summary -> Context/Alternatives -> Rationale/Tags -> Date -> Review
  const progress = (step / totalSteps) * 100;

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setSummary(initialData.summary || "");
      setContext(initialData.context || "");
      setAlternatives(initialData.alternatives || "");
      setRationale(initialData.rationale || "");
      setTags(initialData.tags?.join(', ') || "");
      setSelectedDate(initialData.created_at ? new Date(initialData.created_at) : new Date());
      setShowSummary(!!initialData.summary);
      setShowContext(!!initialData.context);
      setShowAlternatives(!!initialData.alternatives);
      setShowRationale(!!initialData.rationale);
      setShowTags(!!initialData.tags && initialData.tags.length > 0);
      setStep(1); // Reset step when new initialData is provided
    }
  }, [initialData]);

  const resetForm = () => {
    setTitle("");
    setSummary("");
    setContext("");
    setAlternatives("");
    setRationale("");
    setTags("");
    setSelectedDate(new Date());
    setStep(1);
    setShowSummary(false);
    setShowContext(false);
    setShowAlternatives(false);
    setShowRationale(false);
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
    if (initialData && title.trim() && selectedDate) {
      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
      onUpdateDecision(
        initialData.id,
        title.trim(),
        summary.trim(),
        context.trim(),
        alternatives.trim(),
        rationale.trim(),
        tagArray,
        selectedDate.toISOString()
      );
      handleOpenChangeInternal(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChangeInternal}>
      <DialogContent className="sm:max-w-[550px] rounded-xl shadow-lg p-6">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-6 pl-4 pr-8"> {/* Adjusted padding */}
            <Progress value={progress} className="w-full h-2 mb-4" />
            <DialogTitle className="text-xl font-semibold">
              {step === 1 && "Edit Decision: Details"}
              {step === 2 && "Edit Decision: Context & Alternatives"}
              {step === 3 && "Edit Decision: Rationale & Tags"}
              {step === 4 && "Review & Update Decision"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-normal">
              {step === 1 && "Modify the main details for your decision."}
              {step === 2 && "Adjust the problem context and alternatives considered."}
              {step === 3 && "Explain the reasoning and add tags."}
              {step === 4 && "Review your changes before updating."}
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
                      className="min-h-[100px]" // Added min-height for better UX
                    />
                  </div>
                )}
              </>
            )}

            {step === 2 && (
              <>
                {!showContext && (
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowContext(true)}
                    className="text-primary justify-start px-0 h-auto text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add context
                  </Button>
                )}
                {showContext && (
                  <div>
                    <Label htmlFor="decision-context" className="text-base mb-2 block">Problem/Context (optional)</Label>
                    <RichTextEditor
                      id="decision-context"
                      value={context}
                      onChange={setContext}
                      placeholder="What problem or situation led to this decision?"
                      className="min-h-[150px]" // Added min-height for better UX
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
                    <Plus className="mr-1 h-4 w-4" /> Add alternatives considered
                  </Button>
                )}
                {showAlternatives && (
                  <div>
                    <Label htmlFor="decision-alternatives" className="text-base mb-2 block">Alternatives Considered (optional)</Label>
                    <RichTextEditor
                      id="decision-alternatives"
                      value={alternatives}
                      onChange={setAlternatives}
                      placeholder="What other options were explored?"
                      className="min-h-[100px]" // Added min-height for better UX
                    />
                  </div>
                )}
              </>
            )}

            {step === 3 && (
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
                      className="min-h-[150px]" // Added min-height for better UX
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
                    <Input
                      id="decision-tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="e.g., Navigation, Mobile, Accessibility"
                      className="rounded-md px-3 py-2 border border-input/70 focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <p className="text-sm text-muted-foreground mt-1">Separate tags with a comma.</p>
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

            {step === 4 && (
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
                {context && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Problem/Context:</p>
                    <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: context || "N/A" }} />
                  </div>
                )}
                {alternatives && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Alternatives Considered:</p>
                    <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: alternatives || "N/A" }} />
                  </div>
                )}
                {rationale && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Why this decision?:</p>
                    <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: rationale || "N/A" }} />
                  </div>
                )}
                {tags && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Tags:</p>
                    <p className="text-base text-muted-foreground">{tags || "N/A"}</p>
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
                Update Decision
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}