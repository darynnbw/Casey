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
  onAddScreenshot: (file: File, caption: string) => void;
}

export function AddScreenshotDialog({ onAddScreenshot }: AddScreenshotDialogProps) {
  const [open, setOpen] = useState(false);
  const [caption, setCaption] = useState("");
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
      onAddScreenshot(file, caption.trim());
      setCaption("");
      setFile(null);
      setPreview(null);
      if(fileInputRef.current) fileInputRef.current.value = "";
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Camera className="mr-2 h-4 w-4" />
          Add Screenshot
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Screenshot</DialogTitle>
            <DialogDescription>
              Upload an image and add an optional caption.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="screenshot-file">Image</Label>
              <Input id="screenshot-file" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} required />
            </div>
            {preview && <img src={preview} alt="Screenshot preview" className="mt-2 max-h-40 w-full object-contain rounded-md border" />}
            <div>
              <Label htmlFor="caption">Caption (optional)</Label>
              <Textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Describe this screenshot..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!file}>Save Screenshot</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}