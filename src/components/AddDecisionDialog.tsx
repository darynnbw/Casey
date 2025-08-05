import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";
import { DecisionWizard } from "./DecisionWizard"; // Import the new wizard component

interface AddDecisionDialogProps {
  onAddDecision: (
    title: string,
    summary: string,
    context: string,
    alternatives: string,
    rationale: string,
    status: string,
    tags: string[]
  ) => void;
}

export function AddDecisionDialog({ onAddDecision }: AddDecisionDialogProps) {
  const [open, setOpen] = useState(false);

  const handleCloseDialog = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-lg">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Add Decision
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-xl shadow-lg p-0 h-[90vh] max-h-[600px] flex flex-col">
        <DecisionWizard onAddDecision={onAddDecision} onClose={handleCloseDialog} />
      </DialogContent>
    </Dialog>
  );
}