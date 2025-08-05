import { Entry } from "@/types";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { Trash2, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NoteCardProps {
  note: Entry;
  onDelete: (note: Entry) => void;
  index: number; // For rotation styling
}

const isUrl = (text: string) => {
  return text.startsWith('http://') || text.startsWith('https://');
}

export function NoteCard({ note, onDelete, index }: NoteCardProps) {
  return (
    <div key={note.id} className={cn(
      "bg-card border border-border/50 shadow-lg shadow-gray-100/50 dark:shadow-none p-6 rounded-xl group relative transform transition-all duration-300 hover:scale-[1.02] flex flex-col gap-4",
      index % 2 === 0 ? "rotate-1" : "-rotate-1"
    )}>
      <div className="flex justify-between items-start">
        <p className="text-sm text-muted-foreground">{format(new Date(note.created_at), "h:mm a")}</p>
        <Button variant="ghost" size="icon" className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" onClick={() => onDelete(note)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
      
      {note.location && (
        <Badge variant="outline" className="w-fit px-3 py-1 text-xs font-medium rounded-full bg-blue-50/50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800">
          {isUrl(note.location) ? (
            <a href={note.location} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
              <Link2 className="h-3 w-3" />
              {note.location}
            </a>
          ) : (
            <span className="flex items-center gap-1">
              <Link2 className="h-3 w-3" />
              {note.location}
            </span>
          )}
        </Badge>
      )}

      <p className="whitespace-pre-wrap text-base text-foreground">{note.content}</p>

      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-auto pt-2">
          {note.tags.map((tag, tagIndex) => (
            <Badge key={tagIndex} variant="secondary" className="rounded-full px-3 py-1 text-xs">{tag}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}