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
import { Lightbulb } from "lucide-react";

interface AddProblemSolutionDialogProps {
  onAddProblemSolution: (
    title: string,
    problemDescription: string,
    occurrenceLocation: string,
    possibleSolutions: string,
    chosenSolution: string,
    outcome: string,
    tags: string[]
  ) => void;
}

export function AddProblemSolutionDialog({ onAddProblemSolution }: AddProblemSolutionDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [occurrenceLocation, setOccurrenceLocation] = useState("");
  const [possibleSolutions, setPossibleSolutions] = useState("");
  const [chosenSolution, setChosenSolution] = useState("");
  const [outcome, setOutcome] = useState("");
  const [tags, setTags] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
      onAddProblemSolution(
        title.trim(),
        problemDescription.trim(),
        occurrenceLocation.trim(),
        possibleSolutions.trim(),
        chosenSolution.trim(),
        outcome.trim(),
        tagArray
      );
      setTitle("");
      setProblemDescription("");
      setOccurrenceLocation("");
      setPossibleSolutions("");
      setChosenSolution("");
      setOutcome("");
      setTags("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-lg">
          <Lightbulb className="mr-2 h-4 w-4" />
          Add Problem/Solution
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-xl shadow-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Log Problem & Solution</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Document a UX problem, its context, and how it was solved.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <div>
              <Label htmlFor="problem-title" className="text-base">Title</Label>
              <Input
                id="problem-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., User confusion on checkout page"
                autoFocus
                required
                className="rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="problem-description" className="text-base">Problem Description (optional)</Label>
              <Textarea
                id="problem-description"
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder="Describe the problem in detail."
                rows={3}
                className="rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="occurrence-location" className="text-base">Occurrence Location (optional)</Label>
              <Input
                id="occurrence-location"
                value={occurrenceLocation}
                onChange={(e) => setOccurrenceLocation(e.target.value)}
                placeholder="e.g., /checkout, Login flow, User testing session"
                className="rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="possible-solutions" className="text-base">Possible Solutions (optional)</Label>
              <Textarea
                id="possible-solutions"
                value={possibleSolutions}
                onChange={(e) => setPossibleSolutions(e.target.value)}
                placeholder="List potential ways to address the problem."
                rows={3}
                className="rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="chosen-solution" className="text-base">Chosen Solution (optional)</Label>
              <Textarea
                id="chosen-solution"
                value={chosenSolution}
                onChange={(e) => setChosenSolution(e.target.value)}
                placeholder="What solution was implemented?"
                rows={3}
                className="rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="outcome" className="text-base">Outcome (optional)</Label>
              <Textarea
                id="outcome"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="What was the result of the implemented solution?"
                rows={3}
                className="rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="problem-tags" className="text-base">Tags (optional)</Label>
              <Input
                id="problem-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., Bug, Usability, Performance"
                className="rounded-lg"
              />
              <p className="text-sm text-muted-foreground mt-1">Separate tags with a comma.</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="rounded-lg px-4 py-2.5">Save Problem/Solution</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}