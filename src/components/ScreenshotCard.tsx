import { Entry } from "@/types";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { Trash2, Link2, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertDialogTrigger } from "./ui/alert-dialog";

interface ScreenshotCardProps {
  screenshot: Entry;
  onEdit: (screenshot: Entry) => void;
  index: number;
}

const isUrl = (text: string) => {
  return text.startsWith('http://') || text.startsWith('https://');
}

export function ScreenshotCard({ screenshot, onEdit, index }: ScreenshotCardProps) {
  return (
    <div key={screenshot.id} className={cn(
      "bg-card border border-border/50 shadow-lg hover:shadow-xl shadow-gray-100/50 px-6 pb-6 pt-4 rounded-xl group relative transform transition-all duration-300 hover:scale-[1.02] flex flex-col gap-2",
      index % 2 === 0 ? "rotate-1" : "-rotate-1"
    )}>
      <div className="flex justify-between items-start">
        <p className="text-sm text-muted-foreground">{format(new Date(screenshot.created_at), "h:mm a")}</p>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
            onClick={() => onEdit(screenshot)}
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </Button>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>
        </div>
      </div>

      {screenshot.location && (
        <Badge 
          variant="outline" 
          className="w-fit px-3 py-1 text-xs font-medium rounded-full bg-accent text-accent-foreground border-primary/20"
        >
          {isUrl(screenshot.location) ? (
            <a href={screenshot.location} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
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
        <img src={screenshot.file_url} alt={screenshot.content || 'Screenshot'} className="w-full object-contain rounded-lg border border-border/50 bg-muted shadow-sm" loading="lazy" />
        {screenshot.content && <div className="prose max-w-none text-sm italic text-muted-foreground" dangerouslySetInnerHTML={{ __html: screenshot.content }} />}
      </div>

      {screenshot.tags && screenshot.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-auto pt-2">
          {screenshot.tags.map((tag, tagIndex) => (
            <Badge 
              key={tagIndex} 
              variant="secondary" 
              className="rounded-full px-3 py-1 text-xs"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}