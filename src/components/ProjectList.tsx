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

const motivationalMessages = [
  "Every great project starts with a single step. Let's build something amazing!",
  "Your ideas are waiting to be brought to life. Start a new project now!",
  "The best way to predict the future is to create it. Begin your next case study!",
  "Unleash your creativity. Your next breakthrough project is just a click away!",
  "Transform your vision into reality. Create your first case study today!",
  "Great things never came from comfort zones. Start a new project and explore!",
  "The journey of a thousand miles begins with a single step. Your project journey starts here!",
  "Don't wait for inspiration. Be the inspiration. Create a new project!",
  "The only way to do great work is to love what you do. Start a project you're passionate about!",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. Keep building!",
];

export function ProjectList({ projects, selectedProject, onSelectProject, onDeleteProject, isCollapsed }: ProjectListProps) {
  // Select a random motivational message when the component renders and projects are empty
  const randomMotivationalMessage = projects.length === 0 
    ? motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]
    : null;

  return (
    <div className="space-y-1">
      {projects.length === 0 ? (
        <p className={cn("text-sm text-muted-foreground p-2 text-center", isCollapsed && "hidden")}>
          {randomMotivationalMessage}
        </p>
      ) : (
        projects.map((project) => (
          <div key={project.id} className="flex items-center group rounded-lg transition-all duration-200 hover:bg-accent/50">
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start flex-grow text-sidebar-foreground py-1.5 px-2 rounded-lg transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    selectedProject?.id === project.id && "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent",
                    isCollapsed && "justify-center px-0 w-10 h-10"
                  )}
                  onClick={() => onSelectProject(project)}
                >
                  <Folder className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                  {!isCollapsed && (
                    <span className="truncate">
                      {project.name}
                    </span>
                  )}
                  {isCollapsed && <span className="sr-only">{project.name}</span>}
                </Button>
              </TooltipTrigger>
              {isCollapsed && <TooltipContent side="right" className="rounded-lg">
                <p>{project.name}</p>
              </TooltipContent>}
            </Tooltip>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("opacity-0 group-hover:opacity-100 transition-opacity rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2", isCollapsed && "hidden")}
                >
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
        ))
      )}
    </div>
  );
}