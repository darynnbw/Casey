import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useState } from "react";
import { Project } from "@/types";
import { NewProjectDialog } from "@/components/NewProjectDialog";
import { ProjectList } from "@/components/ProjectList";

const Index = () => {
  const [projects, setProjects] = useState<Project[]>([
    { id: '1', name: 'Sample Project' }
  ]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleCreateProject = (name: string) => {
    const newProject: Project = { id: crypto.randomUUID(), name };
    setProjects([...projects, newProject]);
  };

  return (
    <div className="h-screen w-screen">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <div className="flex h-full flex-col p-4">
            <h2 className="text-xl font-bold tracking-tight mb-4">Case Studies</h2>
            <NewProjectDialog onCreateProject={handleCreateProject} />
            <div className="mt-4 flex-grow">
              <ProjectList projects={projects} onSelectProject={setSelectedProject} selectedProject={selectedProject} />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={80}>
          <div className="flex h-full items-center justify-center p-6">
            {selectedProject ? (
              <div className="w-full h-full">
                <h1 className="text-3xl font-bold tracking-tight">{selectedProject.name}</h1>
                <p className="text-muted-foreground mt-2">Timeline for your notes and screenshots will appear here.</p>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-xl font-semibold">Welcome!</h2>
                <p className="text-muted-foreground mt-2">Select a project from the sidebar or create a new one to get started.</p>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;