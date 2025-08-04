import { Project } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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

interface ProjectListProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

export function ProjectList({ projects, selectedProject, onSelectProject, onDeleteProject }: ProjectListProps) {
  return (
    <div className="space-y-2">
      {projects.length === 0 && (
        <p className="text-sm text-muted-foreground p-2">No projects yet. Create one to get started!</p>
      )}
      {projects.map((project) => (
        <div key={project.id} className="flex items-center group rounded-lg transition-all duration-200 hover:bg-accent/50">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start flex-grow text-sidebar-foreground py-2 px-3 rounded-lg",
              selectedProject?.id === project.id && "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent"
            )}
            onClick={() => onSelectProject(project)}
          >
            {project.name}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
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