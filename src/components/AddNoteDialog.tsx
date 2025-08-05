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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { MessageSquarePlus } from "lucide-react"; // Icon not needed here anymore

interface AddNoteDialogProps {
  onAddNote: (content: string, tags: string[], location: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddNoteDialog({ onAddNote, open, onOpenChange }: AddNoteDialogProps) {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
      onAddNote(content.trim(), tagArray, location.trim());
      setContent("");
      setTags("");
      setLocation("");
      onOpenChange(false); // Close dialog on submit
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* DialogTrigger removed as it's now handled by AddActionsDropdown */}
      <DialogContent className="sm:max-w-[425px] rounded-xl shadow-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add New Note</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Write down your thoughts, ideas, or project updates.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <div>
              <Label htmlFor="note-content" className="text-base">Note</Label>
              <Textarea
                id="note-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your note here..."
                rows={5}
                autoFocus
                className="rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="note-tags" className="text-base">Tags</Label>
              <Input
                id="note-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., Problem, Solution, User-Feedback"
                className="rounded-lg"
              />
              <p className="text-sm text-muted-foreground mt-1">Separate tags with a comma.</p>
            </div>
            <div>
              <Label htmlFor="note-location" className="text-base">Location (optional)</Label>
              <Input
                id="note-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., /checkout or https://..."
                className="rounded-lg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="rounded-lg px-4 py-2.5">Save Note</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}