import { JournalEntry } from "@/types";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface JournalEntryCardProps {
  journalEntry: JournalEntry;
  onDelete: (journalEntryId: string) => void;
  index: number; // For rotation styling
}

export function JournalEntryCard({ journalEntry, onDelete, index }: JournalEntryCardProps) {
  return (
    <div key={journalEntry.id} className={cn(
      "bg-card border border-border/50 shadow-lg shadow-gray-100/50 dark:shadow-none p-6 rounded-xl group relative transform transition-all duration-300 hover:scale-[1.02] flex flex-col gap-4",
      index % 2 === 0 ? "rotate-1" : "-rotate-1"
    )}>
      <div className="flex justify-between items-start">
        <p className="text-sm text-muted-foreground">{format(new Date(journalEntry.created_at), "h:mm a")}</p>
        <Button variant="ghost" size="icon" className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" onClick={() => onDelete(journalEntry.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
      <p className="whitespace-pre-wrap text-base text-foreground">{journalEntry.content}</p>
      {journalEntry.mood && (
        <Badge variant="outline" className="w-fit px-3 py-1 text-xs font-medium rounded-full bg-purple-50/50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800">
          Mood: {journalEntry.mood}
        </Badge>
      )}
      {journalEntry.tags && journalEntry.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-auto pt-2">
          {journalEntry.tags.map((tag, tagIndex) => (
            <Badge key={tagIndex} variant="secondary" className="rounded-full px-3 py-1 text-xs">{tag}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}