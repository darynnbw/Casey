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
import { ProblemSolution } from "@/types";
import { RichTextEditor } from "./RichTextEditor"; // Import the new component

interface EditProblemSolutionDialogProps {
  initialData: ProblemSolution | null;
  onUpdateProblemSolution: (
    id: string,
    title: string,
    problem_description: string,
    occurrence_location: string,
    solution: string,
    tags: string[],
    created_at: string
  ) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProblemSolutionDialog({ initialData, onUpdateProblemSolution, open, onOpenChange }: EditProblemSolutionDialogProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState(initialData?.title || "");
  const [problem_description, setProblemDescription] = useState(initialData?.problem_description || "");
  const [occurrence_location, setOccurrenceLocation] = useState(initialData?.occurrence_location || "");
  const [solution, setSolution] = useState(initialData?.solution || "");
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || "");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialData?.created_at ? new Date(initialData.created_at) : new Date());

  const [showProblemDescription, setShowProblemDescription] = useState(false);
  const [showOccurrenceLocation, setShowOccurrenceLocation] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showTags, setShowTags] = useState(false);

  const totalSteps = 3; // Title/Desc -> Location/Solution -> Tags/Date -> Review
  const progress = (step / totalSteps) * 100;

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setProblemDescription(initialData.problem_description || "");
      setOccurrenceLocation(initialData.occurrence_location || "");
      setSolution(initialData.solution || "");
      setTags(initialData.tags?.join(', ') || "");
      setSelectedDate(initialData.created_at ? new Date(initialData.created_at) : new Date());
      setShowProblemDescription(!!initialData.problem_description);
      setShowOccurrenceLocation(!!initialData.occurrence_location);
      setShowSolution(!!initialData.solution);
      setShowTags(!!initialData.tags && initialData.tags.length > 0);
      setStep(1); // Reset step when new initialData is provided
    }
  }, [initialData]);

  const resetForm = () => {
    setTitle("");
    setProblemDescription("");
    setOccurrenceLocation("");
    setSolution("");
    setTags("");
    setSelectedDate(new Date());
    setStep(1);
    setShowProblemDescription(false);
    setShowOccurrenceLocation(false);
    setShowSolution(false);
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
      alert("Problem title is required.");
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
      onUpdateProblemSolution(
        initialData.id,
        title.trim(),
        problem_description.trim(),
        occurrence_location.trim(),
        solution.trim(),
        tagArray,
        selectedDate.toISOString()
      );
      handleOpenChangeInternal(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChangeInternal}>
      <DialogContent className="sm:max-w-[600px] rounded-xl shadow-lg p-6">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-6 pl-4 pr-8"> {/* Adjusted padding */}
            <Progress value={progress} className="w-full h-2 mb-4" />
            <DialogTitle className="text-xl font-semibold">
              {step === 1 && "Edit Problem & Solution: Problem Details"}
              {step === 2 && "Edit Problem & Solution: Context & Solution"}
              {step === 3 && "Review & Update Problem/Solution"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-normal">
              {step === 1 && "Modify the problem details."}
              {step === 2 && "Adjust context and solution details."}
              {step === 3 && "Review your changes before updating."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {step === 1 && (
              <>
                <div>
                  <Label htmlFor="problem-title" className="text-base mb-2 block">Title</Label>
                  <Input
                    id="problem-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., User confusion on checkout page"
                    autoFocus
                    required
                    className="rounded-md px-3 py-2 border border-input/70 focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                {!showProblemDescription && (
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowProblemDescription(true)}
                    className="text-primary justify-start px-0 h-auto text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add problem description
                  </Button>
                )}
                {showProblemDescription && (
                  <div>
                    <Label htmlFor="problem-description" className="text-base mb-2 block">Problem Description (optional)</Label>
                    <RichTextEditor
                      id="problem-description"
                      value={problem_description}
                      onChange={setProblemDescription}
                      placeholder="Describe the problem in detail."
                      className="min-h-[150px]" // Added min-height for better UX
                    />
                  </div>
                )}
              </>
            )}

            {step === 2 && (
              <>
                {!showOccurrenceLocation && (
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowOccurrenceLocation(true)}
                    className="text-primary justify-start px-0 h-auto text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add occurrence location
                  </Button>
                )}
                {showOccurrenceLocation && (
                  <div>
                    <Label htmlFor="occurrence-location" className="text-base mb-2 block">Occurrence Location (optional)</Label>
                    <Input
                      id="occurrence-location"
                      value={occurrence_location}
                      onChange={(e) => setOccurrenceLocation(e.target.value)}
                      placeholder="e.g., /checkout, Login flow, User testing session"
                      className="rounded-md px-3 py-2 border border-input/70 focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                )}
                {!showSolution && (
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowSolution(true)}
                    className="text-primary justify-start px-0 h-auto text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add solution
                  </Button>
                )}
                {showSolution && (
                  <div>
                    <Label htmlFor="solution" className="text-base mb-2 block">Solution (optional)</Label>
                    <RichTextEditor
                      id="solution"
                      value={solution}
                      onChange={setSolution}
                      placeholder="Describe the implemented solution."
                      className="min-h-[150px]" // Added min-height for better UX
                    />
                  </div>
                )}
              </>
            )}

            {step === 3 && (
              <>
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
                    <Label htmlFor="problem-tags" className="text-base mb-2 block">Tags (optional)</Label>
                    <Input
                      id="problem-tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="e.g., Bug, Usability, Performance"
                      className="rounded-md px-3 py-2 border border-input/70 focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <p className="text-sm text-muted-foreground mt-1">Separate tags with a comma.</p>
                  </div>
                )}
                <div>
                  <Label htmlFor="problem-date" className="text-base mb-2 block">Date</Label>
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
                {problem_description && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Problem Description:</p>
                    <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: problem_description || "N/A" }} />
                  </div>
                )}
                {occurrence_location && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Occurrence Location:</p>
                    <p className="text-base text-muted-foreground">{occurrence_location || "N/A"}</p>
                  </div>
                )}
                {solution && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Solution:</p>
                    <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: solution || "N/A" }} />
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
              <Button type="button" onClick={handleNext} className="rounded-lg px-4 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" disabled={step === 1 && !title.trim()}>
                Next
              </Button>
            ) : (
              <Button type="submit" className="rounded-lg px-4 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" disabled={!title.trim()}>
                Save Problem/Solution
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}