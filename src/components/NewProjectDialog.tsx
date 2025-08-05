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
// import { PlusCircle } from "lucide-react"; // Icon not needed here anymore

interface NewProjectDialogProps {
  onCreateProject: (name: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewProjectDialog({ onCreateProject, open, onOpenChange }: NewProjectDialogProps) {
  const [projectName, setProjectName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim()) {
      onCreateProject(projectName.trim());
      setProjectName("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] rounded-xl shadow-lg p-6">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-6"> {/* Removed px-4 here */}
            <DialogTitle className="text-xl font-semibold">Create New Project</DialogTitle>
            <DialogDescription className="text-muted-foreground font-normal">
              This will create a new project to house your notes and screenshots.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div>
              <Label htmlFor="name" className="text-base mb-2 block">
                Project Name
              </Label>
              <Input
                id="name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="rounded-md px-3 py-2 border border-input/70 focus:border-primary"
                placeholder="e.g., Client Website Redesign"
                autoFocus
                required
              />
            </div>
          </div>
          <DialogFooter className="pt-6">
            <Button type="submit" className="rounded-lg px-4 py-2.5">Create Project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}