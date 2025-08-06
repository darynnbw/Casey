import { ProblemSolution } from "@/types";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { Trash2, Pencil } from "lucide-react"; // Added Pencil icon
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProblemSolutionCardProps {
  problemSolution: ProblemSolution;
  onDelete: (problemSolutionId: string) => void;
  onEdit: (problemSolution: ProblemSolution) => void; // Added onEdit prop
  index: number; // For rotation styling
}

export function ProblemSolutionCard({ problemSolution, onDelete, onEdit, index }: ProblemSolutionCardProps) {
  return (
    <div key={problemSolution.id} className={cn(
      "bg-card border border-border/50 shadow-lg hover:shadow-xl shadow-gray-100/50 dark:shadow-none px-6 pb-6 pt-4 rounded-xl group relative transform transition-all duration-300 hover:scale-[1.02] flex flex-col gap-3",
      index % 2 === 0 ? "rotate-1" : "-rotate-1"
    )}>
      <div className="flex justify-between items-start">
        <p className="text-sm text-muted-foreground">{format(new Date(problemSolution.created_at), "h:mm a")}</p>
        <div className="flex gap-1"> {/* Group buttons */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
            onClick={() => onEdit(problemSolution)}
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2" 
            onClick={() => onDelete(problemSolution.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
      <h4 className="text-lg font-semibold text-foreground">{problemSolution.title}</h4>
      {problemSolution.occurrence_location && (
        <Badge variant="outline" className="w-fit px-3 py-1 text-xs font-medium rounded-full bg-blue-50/50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800 transition-colors duration-200 ease-in-out">
          Location: {problemSolution.occurrence_location}
        </Badge>
      )}
      {problemSolution.problem_description && (
        <div>
          <p className="text-sm font-medium text-foreground">Problem:</p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{problemSolution.problem_description}</p>
        </div>
      )}
      {problemSolution.solution && (
        <div>
          <p className="text-sm font-medium text-foreground">Solution:</p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{problemSolution.solution}</p>
        </div>
      )}
      {problemSolution.tags && problemSolution.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-auto pt-2">
          {problemSolution.tags.map((tag, tagIndex) => (
            <Badge key={tagIndex} variant="secondary" className="rounded-full px-3 py-1 text-xs transition-colors duration-200 ease-in-out">{tag}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}