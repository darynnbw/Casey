import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  // DialogTrigger, // Removed
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
// import { BookOpenText } from "lucide-react"; // Icon not needed here anymore

interface AddJournalEntryDialogProps {
  onAddJournalEntry: (content: string, mood: string, tags: string[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddJournalEntryDialog({ onAddJournalEntry, open, onOpenChange }: AddJournalEntryDialogProps) {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [tags, setTags] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
      onAddJournalEntry(content.trim(), mood, tagArray);
      setContent("");
      setMood("");
      setTags("");
      onOpenChange(false); // Close dialog on submit
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* DialogTrigger removed as it's now handled by AddActionsDropdown */}
      <DialogContent className="sm:max-w-[500px] rounded-xl shadow-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">New Journal Entry</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Log your thoughts, progress, or observations for today.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <div>
              <Label htmlFor="journal-content" className="text-base">Entry</Label>
              <Textarea
                id="journal-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind today? What did you work on?"
                rows={7}
                autoFocus
                required
                className="rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="journal-mood" className="text-base">Mood (optional)</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger className="w-full rounded-lg">
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
            <div>
              <Label htmlFor="journal-tags" className="text-base">Tags (optional)</Label>
              <Input
                id="journal-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., Meeting, Client Feedback, Brainstorm"
                className="rounded-lg"
              />
              <p className="text-sm text-muted-foreground mt-1">Separate tags with a comma.</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="rounded-lg px-4 py-2.5">Save Entry</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}