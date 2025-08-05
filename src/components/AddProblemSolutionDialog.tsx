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

interface AddProblemSolutionDialogProps {
  onAddProblemSolution: (
    title: string,
    problem_description: string,
    occurrence_location: string,
    possible_solutions: string,
    chosen_solution: string,
    outcome: string,
    tags: string[],
    createdAt: string
  ) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddProblemSolutionDialog({ onAddProblemSolution, open, onOpenChange }: AddProblemSolutionDialogProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [problem_description, setProblemDescription] = useState("");
  const [occurrence_location, setOccurrenceLocation] = useState("");
  const [possible_solutions, setPossibleSolutions] = useState("");
  const [chosen_solution, setChosenSolution] = useState("");
  const [outcome, setOutcome] = useState("");
  const [tags, setTags] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const [showProblemDescription, setShowProblemDescription] = useState(false);
  const [showOccurrenceLocation, setShowOccurrenceLocation] = useState(false);
  const [showPossibleSolutions, setShowPossibleSolutions] = useState(false);
  const [showChosenSolution, setShowChosenSolution] = useState(false);
  const [showOutcome, setShowOutcome] = useState(false);
  const [showTags, setShowTags] = useState(false);

  const totalSteps = 5; // Title/Desc -> Location/Possible -> Chosen/Outcome -> Tags -> Review
  const progress = (step / totalSteps) * 100;

  const resetForm = () => {
    setTitle("");
    setProblemDescription("");
    setOccurrenceLocation("");
    setPossibleSolutions("");
    setChosenSolution("");
    setOutcome("");
    setTags("");
    setSelectedDate(new Date());
    setStep(1);
    setShowProblemDescription(false);
    setShowOccurrenceLocation(false);
    setShowPossibleSolutions(false);
    setShowChosenSolution(false);
    setShowOutcome(false);
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
    if (title.trim() && selectedDate) {
      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
      onAddProblemSolution(
        title.trim(),
        problem_description.trim(),
        occurrence_location.trim(),
        possible_solutions.trim(),
        chosen_solution.trim(),
        outcome.trim(),
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
          <DialogHeader className="mb-6">
            <Progress value={progress} className="w-full h-2 mb-4" />
            <DialogTitle className="text-xl font-semibold">
              {step === 1 && "Log Problem & Solution: Problem Details"}
              {step === 2 && "Log Problem & Solution: Context & Options"}
              {step === 3 && "Log Problem & Solution: Resolution"}
              {step === 4 && "Log Problem & Solution: Tags & Date"}
              {step === 5 && "Review & Submit Problem/Solution"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-normal">
              {step === 1 && "Document a UX problem and its description."}
              {step === 2 && "Provide context and list possible solutions."}
              {step === 3 && "Detail the chosen solution and its outcome."}
              {step === 4 && "Add optional tags for categorization and set the date."}
              {step === 5 && "Review your problem and solution before saving."}
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
                    className="rounded-md px-3 py-2 border border-input/70 focus:border-primary"
                  />
                </div>
                {!showProblemDescription && (
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowProblemDescription(true)}
                    className="text-primary justify-start px-0 h-auto text-sm"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add problem description
                  </Button>
                )}
                {showProblemDescription && (
                  <div>
                    <Label htmlFor="problem-description" className="text-base mb-2 block">Problem Description (optional)</Label>
                    <Textarea
                      id="problem-description"
                      value={problem_description}
                      onChange={(e) => setProblemDescription(e.target.value)}
                      placeholder="Describe the problem in detail."
                      rows={3}
                      className="rounded-md px-3 py-2 border border-input/70 focus:border-primary"
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
                    className="text-primary justify-start px-0 h-auto text-sm"
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
                      className="rounded-md px-3 py-2 border border-input/70 focus:border-primary"
                    />
                  </div>
                )}
                {!showPossibleSolutions && (
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowPossibleSolutions(true)}
                    className="text-primary justify-start px-0 h-auto text-sm"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add possible solutions
                  </Button>
                )}
                {showPossibleSolutions && (
                  <div>
                    <Label htmlFor="possible-solutions" className="text-base mb-2 block">Possible Solutions (optional)</Label>
                    <Textarea
                      id="possible-solutions"
                      value={possible_solutions}
                      onChange={(e) => setPossibleSolutions(e.target.value)}
                      placeholder="List potential ways to address the problem."
                      rows={3}
                      className="rounded-md px-3 py-2 border border-input/70 focus:border-primary"
                    />
                  </div>
                )}
              </>
            )}

            {step === 3 && (
              <>
                {!showChosenSolution && (
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowChosenSolution(true)}
                    className="text-primary justify-start px-0 h-auto text-sm"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add chosen solution
                  </Button>
                )}
                {showChosenSolution && (
                  <div>
                    <Label htmlFor="chosen-solution" className="text-base mb-2 block">Chosen Solution (optional)</Label>
                    <Textarea
                      id="chosen-solution"
                      value={chosen_solution}
                      onChange={(e) => setChosenSolution(e.target.value)}
                      placeholder="What solution was implemented?"
                      rows={3}
                      className="rounded-md px-3 py-2 border border-input/70 focus:border-primary"
                    />
                  </div>
                )}
                {!showOutcome && (
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowOutcome(true)}
                    className="text-primary justify-start px-0 h-auto text-sm"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add outcome
                  </Button>
                )}
                {showOutcome && (
                  <div>
                    <Label htmlFor="outcome" className="text-base mb-2 block">Outcome (optional)</Label>
                    <Textarea
                      id="outcome"
                      value={outcome}
                      onChange={(e) => setOutcome(e.target.value)}
                      placeholder="What was the result of the implemented solution?"
                      rows={3}
                      className="rounded-md px-3 py-2 border border-input/70 focus:border-primary"
                    />
                  </div>
                )}
              </>
            )}

            {step === 4 && (
              <>
                {!showTags && (
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowTags(true)}
                    className="text-primary justify-start px-0 h-auto text-sm"
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
                      className="rounded-md px-3 py-2 border border-input/70 focus:border-primary"
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

            {step === 5 && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Title:</p>
                  <p className="text-base text-muted-foreground">{title || "N/A"}</p>
                </div>
                {problem_description && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Problem Description:</p>
                    <p className="text-base text-muted-foreground whitespace-pre-wrap">{problem_description || "N/A"}</p>
                  </div>
                )}
                {occurrence_location && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Occurrence Location:</p>
                    <p className="text-base text-muted-foreground">{occurrence_location || "N/A"}</p>
                  </div>
                )}
                {possible_solutions && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Possible Solutions:</p>
                    <p className="text-base text-muted-foreground whitespace-pre-wrap">{possible_solutions || "N/A"}</p>
                  </div>
                )}
                {chosen_solution && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Chosen Solution:</p>
                    <p className="text-base text-muted-foreground whitespace-pre-wrap">{chosen_solution || "N/A"}</p>
                  </div>
                )}
                {outcome && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Outcome:</p>
                    <p className="text-base text-muted-foreground whitespace-pre-wrap">{outcome || "N/A"}</p>
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
              <Button type="button" variant="outline" onClick={handleBack} className="rounded-lg px-4 py-2.5">
                Back
              </Button>
            )}
            <div className="flex-grow" />
            {step < totalSteps ? (
              <Button type="button" onClick={handleNext} className="rounded-lg px-4 py-2.5" disabled={step === 1 && !title.trim()}>
                Next
              </Button>
            ) : (
              <Button type="submit" className="rounded-lg px-4 py-2.5" disabled={!title.trim()}>
                Save Problem/Solution
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}