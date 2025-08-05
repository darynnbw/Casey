import { useState, useRef, useEffect } from "react";
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
import { Entry } from "@/types";

interface EditScreenshotDialogProps {
  initialData: Entry | null;
  onUpdateScreenshot: (id: string, file: File | null, caption: string, tags: string[], location: string, createdAt: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditScreenshotDialog({ initialData, onUpdateScreenshot, open, onOpenChange }: EditScreenshotDialogProps) {
  const [step, setStep] = useState(1);
  const [caption, setCaption] = useState(initialData?.content || "");
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [file, setFile] = useState<File | null>(null); // New file if user uploads
  const [preview, setPreview] = useState<string | null>(initialData?.file_url || null); // Current or new preview
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialData?.created_at ? new Date(initialData.created_at) : new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showCaption, setShowCaption] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [showLocation, setShowLocation] = useState(false);

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  useEffect(() => {
    if (initialData) {
      setCaption(initialData.content || "");
      setTags(initialData.tags?.join(', ') || "");
      setLocation(initialData.location || "");
      setPreview(initialData.file_url || null);
      setSelectedDate(initialData.created_at ? new Date(initialData.created_at) : new Date());
      setFile(null); // Clear any previously selected new file
      setShowCaption(!!initialData.content);
      setShowTags(!!initialData.tags && initialData.tags.length > 0);
      setShowLocation(!!initialData.location);
      setStep(1); // Reset step when new initialData is provided
    }
  }, [initialData]);

  const resetForm = () => {
    setCaption("");
    setTags("");
    setLocation("");
    setFile(null);
    setPreview(null);
    setSelectedDate(new Date());
    if(fileInputRef.current) fileInputRef.current.value = "";
    setStep(1);
    setShowCaption(false);
    setShowTags(false);
    setShowLocation(false);
  };

  const handleOpenChangeInternal = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFile(null);
      setPreview(initialData?.file_url || null); // Revert to original preview if no new file
    }
  };

  const handleNext = () => {
    if (step === 1 && !preview) { // Check for preview, which could be existing or new
      alert("An image file is required.");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData && preview && selectedDate) { // Ensure there's a preview (either old or new file)
      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
      onUpdateScreenshot(initialData.id, file, caption.trim(), tagArray, location.trim(), selectedDate.toISOString());
      handleOpenChangeInternal(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChangeInternal}>
      <DialogContent className="sm:max-w-[550px] rounded-xl shadow-lg p-6">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-6 px-4">
            <Progress value={progress} className="w-full h-2 mb-4" />
            <DialogTitle className="text-xl font-semibold">
              {step === 1 && "Edit Screenshot: Image & Caption"}
              {step === 2 && "Edit Screenshot: Details"}
              {step === 3 && "Review & Update Screenshot"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-normal">
              {step === 1 && "Update your image and caption."}
              {step === 2 && "Adjust optional tags, location, and date."}
              {step === 3 && "Review your changes before updating."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {step === 1 && (
              <>
                <div>
                  <Label htmlFor="screenshot-file" className="text-base mb-2 block">Image</Label>
                  <Input id="screenshot-file" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="rounded-md px-3 py-2 border border-input/70 focus:border-primary" />
                  <p className="text-sm text-muted-foreground mt-1">Leave blank to keep current image.</p>
                </div>
                {preview && <img src={preview} alt="Screenshot preview" className="mt-2 max-h-40 w-full object-contain rounded-lg border border-border/50 shadow-sm" />}
                {!showCaption && (
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowCaption(true)}
                    className="text-primary justify-start px-0 h-auto text-sm"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add caption
                  </Button>
                )}
                {showCaption && (
                  <div>
                    <Label htmlFor="caption" className="text-base mb-2 block">Caption (optional)</Label>
                    <Textarea
                      id="caption"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Describe this screenshot..."
                      rows={3}
                      className="rounded-md px-3 py-2 border border-input/70 focus:border-primary"
                    />
                  </div>
                )}
              </>
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
                    <Label htmlFor="screenshot-tags" className="text-base mb-2 block">Tags (optional)</Label>
                    <Input
                      id="screenshot-tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="e.g., Wireframe, Mockup, Result"
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
                    <Label htmlFor="screenshot-location" className="text-base mb-2 block">Location (optional)</Label>
                    <Input
                      id="screenshot-location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., /checkout or https://..."
                      className="rounded-md px-3 py-2 border border-input/70 focus:border-primary"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="screenshot-date" className="text-base mb-2 block">Date</Label>
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
                {preview && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Image Preview:</p>
                    <img src={preview} alt="Screenshot preview" className="mt-2 max-h-40 w-full object-contain rounded-lg border border-border/50 shadow-sm" />
                  </div>
                )}
                {caption && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Caption:</p>
                    <p className="text-base text-muted-foreground whitespace-pre-wrap">{caption || "N/A"}</p>
                  </div>
                )}
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
              <Button type="button" variant="outline" onClick={handleBack} className="rounded-lg px-4 py-2.5">
                Back
              </Button>
            )}
            <div className="flex-grow" />
            {step < totalSteps ? (
              <Button type="button" onClick={handleNext} className="rounded-lg px-4 py-2.5" disabled={step === 1 && !preview}>
                Next
              </Button>
            ) : (
              <Button type="submit" className="rounded-lg px-4 py-2.5" disabled={!preview}>
                Update Screenshot
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}