import { JournalEntry } from "@/types";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { Trash2, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface JournalEntryCardProps {
  journalEntry: JournalEntry;
  onDelete: (journalEntryId: string) => void;
  onEdit: (journalEntry: JournalEntry) => void;
  onPillClick: (type: 'tag' | 'mood', value: string) => void; // Added onPillClick prop
  index: number; // For rotation styling
}

export function JournalEntryCard({ journalEntry, onDelete, onEdit, onPillClick, index }: JournalEntryCardProps) {
  return (
    <div key={journalEntry.id} className={cn(
      "bg-card border border-border/50 shadow-lg hover:shadow-xl shadow-gray-100/50 dark:shadow-none px-6 pb-6 pt-4 rounded-xl group relative transform transition-all duration-300 hover:scale-[1.02] flex flex-col gap-2",
      index % 2 === 0 ? "rotate-1" : "-rotate-1"
    )}>
      <div className="flex justify-between items-start">
        <p className="text-sm text-muted-foreground">{format(new Date(journalEntry.created_at), "h:mm a")}</p>
        <div className="flex gap-1"> {/* Group buttons */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
            onClick={() => onEdit(journalEntry)}
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2" 
            onClick={() => onDelete(journalEntry.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
      <div className="prose dark:prose-invert max-w-none text-base text-foreground" dangerouslySetInnerHTML={{ __html: journalEntry.content || '' }} />
      {journalEntry.mood && (
        <Badge 
          variant="outline" 
          className="w-fit px-3 py-1 text-xs font-medium rounded-full bg-purple-50/50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800 transition-colors duration-200 ease-in-out cursor-pointer hover:bg-purple-100/50 dark:hover:bg-purple-900/30"
          onClick={() => onPillClick('mood', journalEntry.mood!)}
        >
          Mood: {journalEntry.mood}
        </Badge>
      )}
      {journalEntry.tags && journalEntry.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-auto pt-2">
          {journalEntry.tags.map((tag, tagIndex) => (
            <Badge 
              key={tagIndex} 
              variant="secondary" 
              className="rounded-full px-3 py-1 text-xs transition-colors duration-200 ease-in-out cursor-pointer hover:bg-secondary/80"
              onClick={() => onPillClick('tag', tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}