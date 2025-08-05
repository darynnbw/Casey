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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddNoteDialogProps {
  onAddNote: (content: string, tags: string[], location: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddNoteDialog({ onAddNote, open, onOpenChange }: AddNoteDialogProps) {
  const [step, setStep] = useState(1);
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [location, setLocation] = useState("");

  const [showTags, setShowTags] = useState(false);
  const [showLocation, setShowLocation] = useState(false);

  const totalSteps = 3; // Content -> Tags/Location -> Review
  const progress = (step / totalSteps) * 100;

  const resetForm = () => {
    setContent("");
    setTags("");
    setLocation("");
    setStep(1);
    setShowTags(false);
    setShowLocation(false);
  };

  const handleOpenChangeInternal = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  const handleNext = () => {
    if (step === 1 && !content.trim()) {
      alert("Note content is required.");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
      onAddNote(content.trim(), tagArray, location.trim());
      handleOpenChangeInternal(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChangeInternal}>
      <DialogContent className="sm:max-w-[550px] rounded-xl shadow-lg p-6">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-6">
            <Progress value={progress} className="w-full h-2 mb-4" />
            <DialogTitle className="text-xl font-semibold">
              {step === 1 && "Add New Note: Content"}
              {step === 2 && "Add New Note: Details"}
              {step === 3 && "Review & Submit Note"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-normal">
              {step === 1 && "Write down your thoughts, ideas, or project updates."}
              {step === 2 && "Add optional tags and location for better organization."}
              {step === 3 && "Review your note before saving."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {step === 1 && (
              <div>
                <Label htmlFor="note-content" className="text-base mb-2 block">Note</Label>
                <Textarea
                  id="note-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type your note here..."
                  rows={5}
                  autoFocus
                  required
                  className="rounded-md px-3 py-2 border border-input/70 focus:border-primary"
                />
              </div>
            )}

            {step === 2 && (
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
                    <Label htmlFor="note-tags" className="text-base mb-2 block">Tags (optional)</Label>
                    <Input
                      id="note-tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="e.g., Problem, Solution, User-Feedback"
                      className="rounded-md px-3 py-2 border border-input/70 focus:border-primary"
                    />
                    <p className="text-sm text-muted-foreground mt-1">Separate tags with a comma.</p>
                  </div>
                )}
                {!showLocation && (
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowLocation(true)}
                    className="text-primary justify-start px-0 h-auto text-sm"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add location
                  </Button>
                )}
                {showLocation && (
                  <div>
                    <Label htmlFor="note-location" className="text-base mb-2 block">Location (optional)</Label>
                    <Input
                      id="note-location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., /checkout or https://..."
                      className="rounded-md px-3 py-2 border border-input/70 focus:border-primary"
                    />
                  </div>
                )}
              </>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Note Content:</p>
                  <p className="text-base text-muted-foreground whitespace-pre-wrap">{content || "N/A"}</p>
                </div>
                {tags && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Tags:</p>
                    <p className="text-base text-muted-foreground">{tags || "N/A"}</p>
                  </div>
                )}
                {location && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Location:</p>
                    <p className="text-base text-muted-foreground">{location || "N/A"}</p>
                  </div>
                )}
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
              <Button type="button" onClick={handleNext} className="rounded-lg px-4 py-2.5">
                Next
              </Button>
            ) : (
              <Button type="submit" className="rounded-lg px-4 py-2.5">
                Save Note
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}