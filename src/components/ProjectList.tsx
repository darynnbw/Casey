import { Project } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ProjectListProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
}

export function ProjectList({ projects, selectedProject, onSelectProject }: ProjectListProps) {
  return (
    <div className="space-y-1">
      {projects.length === 0 && (
        <p className="text-sm text-muted-foreground p-2">No projects yet. Create one to get started!</p>
      )}
      {projects.map((project) => (
        <Button
          key={project.id}
          variant="ghost"
          className={cn(
            "w-full justify-start",
            selectedProject?.id === project.id && "bg-accent text-accent-foreground"
          )}
          onClick={() => onSelectProject(project)}
        >
          {project.name}
        </Button>
      ))}
    </div>
  );
}