import { Project } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Trash2, Folder } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ProjectListProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  isCollapsed: boolean;
}

export function ProjectList({ projects, selectedProject, onSelectProject, onDeleteProject, isCollapsed }: ProjectListProps) {
  return (
    <div className="space-y-1"> {/* Reduced space-y for tighter list */}
      {projects.length === 0 && (
        <p className={cn("text-sm text-muted-foreground p-2", isCollapsed && "hidden")}>No projects yet. Create one to get started!</p>
      )}
      {projects.map((project) => (
        <div key={project.id} className="flex items-center group rounded-lg transition-all duration-200 hover:bg-accent/50">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start flex-grow text-sidebar-foreground py-1.5 px-2 rounded-lg", // Reduced padding
                  selectedProject?.id === project.id && "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent",
                  isCollapsed && "justify-center px-0 w-10 h-10" // Center icon when collapsed
                )}
                onClick={() => onSelectProject(project)}
              >
                <Folder className={cn("h-4 w-4", !isCollapsed && "mr-2")} /> {/* Icon with conditional margin */}
                {!isCollapsed && (
                  <span className="truncate">
                    {project.name}
                  </span>
                )}
                {isCollapsed && <span className="sr-only">{project.name}</span>}
              </Button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right" className="rounded-lg">{project.name}</TooltipContent>}
          </Tooltip>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className={cn("opacity-0 group-hover:opacity-100 transition-opacity rounded-lg", isCollapsed && "hidden")}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your project and all associated notes and screenshots.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDeleteProject(project.id)} className="rounded-lg">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ))}
    </div>
  );
}