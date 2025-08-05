import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DecisionFormData {
  title: string;
  summary: string;
  context: string;
  alternatives: string;
  rationale: string;
  status: string;
  tags: string;
}

interface DecisionWizardProps {
  onAddDecision: (
    title: string,
    summary: string,
    context: string,
    alternatives: string,
    rationale: string,
    status: string,
    tags: string[]
  ) => void;
  onClose: () => void;
}

export function DecisionWizard({ onAddDecision, onClose }: DecisionWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<DecisionFormData>({
    title: "",
    summary: "",
    context: "",
    alternatives: "",
    rationale: "",
    status: "Proposed",
    tags: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: keyof DecisionFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      const tagArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      onAddDecision(
        formData.title.trim(),
        formData.summary.trim(),
        formData.context.trim(),
        formData.alternatives.trim(),
        formData.rationale.trim(),
        formData.status,
        tagArray
      );
      // Reset form data and close dialog
      setFormData({
        title: "",
        summary: "",
        context: "",
        alternatives: "",
        rationale: "",
        status: "Proposed",
        tags: "",
      });
      setStep(1); // Reset to first step
      onClose();
    }
  };

  const totalSteps = 3;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="p-6 pb-4 border-b border-border/50">
        <h2 className="text-2xl font-bold">Log New Decision</h2>
        <p className="text-muted-foreground mt-1">
          Step {step} of {totalSteps}: {
            step === 1 ? "Core Information" :
            step === 2 ? "Context & Rationale" :
            "Categorization"
          }
        </p>
      </div>
      
      <div className="flex-grow overflow-y-auto p-6 space-y-6">
        {step === 1 && (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title" className="text-base">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Chose sticky header for navigation"
                autoFocus
                required
                className="rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="status" className="text-base">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                <SelectTrigger className="w-full rounded-lg">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="Proposed">Proposed</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Final">Final</SelectItem>
                  <SelectItem value="Revisited">Revisited</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="summary" className="text-base">Summary (optional)</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={handleChange}
                placeholder="A brief overview of the decision."
                rows={2}
                className="rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="context" className="text-base">Problem/Context (optional)</Label>
              <Textarea
                id="context"
                value={formData.context}
                onChange={handleChange}
                placeholder="What problem or situation led to this decision?"
                rows={3}
                className="rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="alternatives" className="text-base">Alternatives Considered (optional)</Label>
              <Textarea
                id="alternatives"
                value={formData.alternatives}
                onChange={handleChange}
                placeholder="What other options were explored?"
                rows={3}
                className="rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="rationale" className="text-base">Why this decision? (optional)</Label>
              <Textarea
                id="rationale"
                value={formData.rationale}
                onChange={handleChange}
                placeholder="Explain the reasoning behind the chosen decision."
                rows={4}
                className="rounded-lg"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="tags" className="text-base">Tags (optional)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g., Navigation, Mobile, Accessibility"
                className="rounded-lg"
              />
              <p className="text-sm text-muted-foreground mt-1">Separate tags with a comma.</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 pt-4 border-t border-border/50 bg-background sticky bottom-0 flex justify-between items-center">
        {step > 1 && (
          <Button type="button" variant="outline" onClick={prevStep} className="rounded-lg px-4 py-2.5">
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
        )}
        <div className={cn("flex-grow", step === 1 ? "justify-end" : "justify-center", "flex")}>
          {step < totalSteps ? (
            <Button type="button" onClick={nextStep} className="rounded-lg px-4 py-2.5">
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" className="rounded-lg px-4 py-2.5">
              <CheckCircle2 className="mr-2 h-4 w-4" /> Save Decision
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}