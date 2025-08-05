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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Plus, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface AddJournalEntryDialogProps {
  onAddJournalEntry: (content: string, mood: string, tags: string[], createdAt: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddJournalEntryDialog({ onAddJournalEntry, open, onOpenChange }: AddJournalEntryDialogProps) {
  const [step, setStep] = useState(1);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [tags, setTags] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const [showMood, setShowMood] = useState(false);
  const [showTags, setShowTags] = useState(false);

  const totalSteps = 3; // Content -> Details (Mood/Tags/Date) -> Review
  const progress = (step / totalSteps) * 100;

  const resetForm = () => {
    setContent("");
    setMood("");
    setTags("");
    setSelectedDate(new Date());
    setStep(1);
    setShowMood(false);
    setShowTags(false);
  };

  const handleOpenChangeInternal = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  const handleNext = () => {
    if (step === 1 && !content.trim()) {
      alert("Journal entry content is required.");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && selectedDate) {
      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
      onAddJournalEntry(content.trim(), mood, tagArray, selectedDate.toISOString());
      handleOpenChangeInternal(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChangeInternal}>
      <DialogContent className="sm:max-w-[550px] rounded-xl shadow-lg p-6">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-6 px-4"> {/* Added px-4 here */}
            <Progress value={progress} className="w-full h-2 mb-4" />
            <DialogTitle className="text-xl font-semibold">
              {step === 1 && "New Journal Entry: Content"}
              {step === 2 && "New Journal Entry: Details"}
              {step === 3 && "Review & Submit Entry"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-normal">
              {step === 1 && "Log your thoughts, progress, or observations for today."}
              {step === 2 && "Add optional mood, tags, and set the date for context."}
              {step === 3 && "Review your journal entry before saving."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {step === 1 && (
              <div>
                <Label htmlFor="journal-content" className="text-base mb-2 block">Entry</Label>
                <Textarea
                  id="journal-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind today? What did you work on?"
                  rows={7}
                  autoFocus
                  required
                  className="rounded-md px-3 py-2 border border-input/70 focus:border-primary"
                />
              </div>
            )}

            {step === 2 && (
              <>
                {!showMood && (
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowMood(true)}
                    className="text-primary justify-start px-0 h-auto text-sm"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add mood
                  </Button>
                )}
                {showMood && (
                  <div>
                    <Label htmlFor="journal-mood" className="text-base mb-2 block">Mood (optional)</Label>
                    <Select value={mood} onValueChange={setMood}>
                      <SelectTrigger className="w-full rounded-md px-3 py-2 border border-input/70 focus:border-primary">
                        <SelectValue placeholder="How are you feeling?" />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                        <SelectItem value="happy">😊 Happy</SelectItem>
                        <SelectItem value="neutral">😐 Neutral</SelectItem>
                        <SelectItem value="frustrated">😖 Frustrated</SelectItem>
                        <SelectItem value="productive">🚀 Productive</SelectItem>
                        <SelectItem value="thoughtful">🤔 Thoughtful</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
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
                    <Label htmlFor="journal-tags" className="text-base mb-2 block">Tags (optional)</Label>
                    <Input
                      id="journal-tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="e.g., Meeting, Client Feedback, Brainstorm"
                      className="rounded-md px-3 py-2 border border-input/70 focus:border-primary"
                    />
                    <p className="text-sm text-muted-foreground mt-1">Separate tags with a comma.</p>
                  </div>
                )}
                <div>
                  <Label htmlFor="journal-date" className="text-base mb-2 block">Date</Label>
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
                  <p className="text-sm font-medium text-foreground">Entry Content:</p>
                  <p className="text-base text-muted-foreground whitespace-pre-wrap">{content || "N/A"}</p>
                </div>
                {mood && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Mood:</p>
                    <p className="text-base text-muted-foreground">{mood || "N/A"}</p>
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
              <Button type="button" onClick={handleNext} className="rounded-lg px-4 py-2.5">
                Next
              </Button>
            ) : (
              <Button type="submit" className="rounded-lg px-4 py-2.5">
                Save Entry
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}