import { useState, useRef } from "react";
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
import { Camera } from "lucide-react";

interface AddScreenshotDialogProps {
  onAddScreenshot: (file: File, caption: string, tags: string[], location: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddScreenshotDialog({ onAddScreenshot, open, onOpenChange }: AddScreenshotDialogProps) {
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [location, setLocation] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
      onAddScreenshot(file, caption.trim(), tagArray, location.trim());
      setCaption("");
      setTags("");
      setLocation("");
      setFile(null);
      setPreview(null);
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {/* This trigger is now handled by AddActionsDropdown, so it's not directly used here */}
        <Button variant="outline" className="rounded-lg">
          <Camera className="mr-2 h-4 w-4" />
          Add Screenshot
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-xl shadow-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add Screenshot</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Upload an image and add an optional caption and tags.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <div>
              <Label htmlFor="screenshot-file" className="text-base">Image</Label>
              <Input id="screenshot-file" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} required className="rounded-lg" />
            </div>
            {preview && <img src={preview} alt="Screenshot preview" className="mt-2 max-h-40 w-full object-contain rounded-lg border border-border/50 shadow-sm" />}
            <div>
              <Label htmlFor="caption" className="text-base">Caption (optional)</Label>
              <Textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Describe this screenshot..."
                rows={3}
                className="rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="screenshot-tags" className="text-base">Tags</Label>
              <Input
                id="screenshot-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., Wireframe, Mockup, Result"
                className="rounded-lg"
              />
              <p className="text-sm text-muted-foreground mt-1">Separate tags with a comma.</p>
            </div>
            <div>
              <Label htmlFor="screenshot-location" className="text-base">Location (optional)</Label>
              <Input
                id="screenshot-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., /checkout or https://..."
                className="rounded-lg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!file} className="rounded-lg px-4 py-2.5">Save Screenshot</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}