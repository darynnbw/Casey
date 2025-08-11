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
import { Entry } from "@/types";
import { RichTextEditor } from "./RichTextEditor"; // Import the new component

interface EditNoteDialogProps {
  initialData: Entry | null;
  onUpdateNote: (id: string, content: string, tags: string[], location: string, createdAt: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditNoteDialog({ initialData, onUpdateNote, open, onOpenChange }: EditNoteDialogProps) {
  const [step, setStep] = useState(1);
  const [content, setContent] = useState(initialData?.content || "");
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialData?.created_at ? new Date(initialData.created_at) : new Date());

  const [showTags, setShowTags] = useState(false);
  const [showLocation, setShowLocation] = useState(false);

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  useEffect(() => {
    if (initialData) {
      setContent(initialData.content || "");
      setTags(initialData.tags?.join(', ') || "");
      setLocation(initialData.location || "");
      setSelectedDate(initialData.created_at ? new Date(initialData.created_at) : new Date());
      setShowTags(!!initialData.tags && initialData.tags.length > 0);
      setShowLocation(!!initialData.location);
      setStep(1); // Reset step when new initialData is provided
    }
  }, [initialData]);

  const resetForm = () => {
    setContent("");
    setTags("");
    setLocation("");
    setSelectedDate(new Date());
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
    if (initialData && content.trim() && selectedDate) {
      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
      onUpdateNote(initialData.id, content.trim(), tagArray, location.trim(), selectedDate.toISOString());
      handleOpenChangeInternal(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChangeInternal}>
      <DialogContent className="sm:max-w-[550px] rounded-xl shadow-lg p-6">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-4 text-center">
            <DialogTitle className="text-xl font-semibold">
              {step === 1 && "Edit Note: Content"}
              {step === 2 && "Edit Note: Details"}
              {step === 3 && "Review & Update Note"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-normal">
              {step === 1 && "Modify your note's content."}
              {step === 2 && "Adjust optional tags, location, and date."}
              {step === 3 && "Review your changes before updating."}
            </DialogDescription>
          </DialogHeader>

          <Progress value={progress} className="w-full h-2 mb-6" />

          <div className="grid gap-6 py-4">
            {step === 1 && (
              <div>
                <Label htmlFor="note-content" className="text-base mb-2 block">Note</Label>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Type your note here..."
                  className="min-h-[150px]" // Added min-height for better UX
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
                    className="text-primary justify-start px-0 h-auto text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                      className="rounded-md px-3 py-2 border border-input/70 focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <p className="text-sm text-muted-foreground mt-1">Separate tags with a comma.</p>
                  </div>
                )}
                {!showLocation && (
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowLocation(true)}
                    className="text-primary justify-start px-0 h-auto text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                      className="rounded-md px-3 py-2 border border-input/70 focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="note-date" className="text-base mb-2 block">Date</Label>
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
                  <p className="text-sm font-medium text-foreground">Note Content:</p>
                  <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content || "N/A" }} />
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
                Update Note
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}