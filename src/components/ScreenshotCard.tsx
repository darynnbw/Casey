import { Entry } from "@/types";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { Trash2, Link2, Pencil } from "lucide-react"; // Added Pencil icon
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ScreenshotCardProps {
  screenshot: Entry;
  onDelete: (screenshot: Entry) => void;
  onEdit: (screenshot: Entry) => void; // Added onEdit prop
  index: number; // For rotation styling
}

const isUrl = (text: string) => {
  return text.startsWith('http://') || text.startsWith('https://');
}

export function ScreenshotCard({ screenshot, onDelete, onEdit, index }: ScreenshotCardProps) {
  return (
    <div key={screenshot.id} className={cn(
      "bg-card border border-border/50 shadow-lg shadow-gray-100/50 dark:shadow-none px-6 pb-6 pt-4 rounded-xl group relative transform transition-all duration-300 hover:scale-[1.02] flex flex-col gap-4",
      index % 2 === 0 ? "rotate-1" : "-rotate-1"
    )}>
      <div className="flex justify-between items-start">
        <p className="text-sm text-muted-foreground">{format(new Date(screenshot.created_at), "h:mm a")}</p>
        <div className="flex gap-1"> {/* Group buttons */}
          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" onClick={() => onEdit(screenshot)}>
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" onClick={() => onDelete(screenshot)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {screenshot.location && (
        <Badge variant="outline" className="w-fit px-3 py-1 text-xs font-medium rounded-full bg-blue-50/50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800">
          {isUrl(screenshot.location) ? (
            <a href={screenshot.location} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
              <Link2 className="h-3 w-3" />
              {screenshot.location}
            </a>
          ) : (
            <span className="flex items-center gap-1">
              <Link2 className="h-3 w-3" />
              {screenshot.location}
            </span>
          )}
        </Badge>
      )}

      <div className="space-y-3">
        <img src={screenshot.file_url} alt={screenshot.content || 'Screenshot'} className="w-full object-contain rounded-lg border border-border/50 bg-white shadow-sm" />
        {screenshot.content && <p className="text-sm italic text-muted-foreground">{screenshot.content}</p>}
      </div>

      {screenshot.tags && screenshot.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-auto pt-2">
          {screenshot.tags.map((tag, tagIndex) => (
            <Badge key={tagIndex} variant="secondary" className="rounded-full px-3 py-1 text-xs">{tag}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}