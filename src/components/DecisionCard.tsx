import { Decision } from "@/types";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { Trash2, Pencil } from "lucide-react"; // Added Pencil icon
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DecisionCardProps {
  decision: Decision;
  onDelete: (decisionId: string) => void;
  onEdit: (decision: Decision) => void; // Added onEdit prop
  index: number; // For rotation styling
}

export function DecisionCard({ decision, onDelete, onEdit, index }: DecisionCardProps) {
  return (
    <div key={decision.id} className={cn(
      "bg-card border border-border/50 shadow-lg shadow-gray-100/50 dark:shadow-none px-6 pb-6 pt-4 rounded-xl group relative transform transition-all duration-300 hover:scale-[1.02] flex flex-col gap-4",
      index % 2 === 0 ? "rotate-1" : "-rotate-1"
    )}>
      <div className="flex justify-between items-start">
        <p className="text-sm text-muted-foreground">{format(new Date(decision.created_at), "h:mm a")}</p>
        <div className="flex gap-1"> {/* Group buttons */}
          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" onClick={() => onEdit(decision)}>
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" onClick={() => onDelete(decision.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
      <h4 className="text-lg font-semibold text-foreground">{decision.title}</h4>
      {decision.summary && <p className="text-sm text-muted-foreground">{decision.summary}</p>}
      {decision.context && (
        <div>
          <p className="text-sm font-medium text-foreground">Context:</p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{decision.context}</p>
        </div>
      )}
      {decision.alternatives && (
        <div>
          <p className="text-sm font-medium text-foreground">Alternatives:</p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{decision.alternatives}</p>
        </div>
      )}
      {decision.rationale && (
        <div>
          <p className="text-sm font-medium text-foreground">Rationale:</p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{decision.rationale}</p>
        </div>
      )}
      {decision.tags && decision.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-auto pt-2">
          {decision.tags.map((tag, tagIndex) => (
            <Badge key={tagIndex} variant="secondary" className="rounded-full px-3 py-1 text-xs">{tag}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}