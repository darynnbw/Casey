import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useState, useEffect } from "react";
import { Project } from "@/types";
import { NewProjectDialog } from "@/components/NewProjectDialog";
import { ProjectList } from "@/components/ProjectList";
import Header from "@/components/Header";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { showSuccess, showError } from "@/utils/toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ProjectDetail } from "@/components/ProjectDetail";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const Index = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const fetchProjects = async () => {
    if (!session) return [];
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      showError("Could not fetch projects.");
      throw new Error(error.message);
    }
    return data;
  };

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['projects', session?.user?.id],
    queryFn: fetchProjects,
    enabled: !!session,
  });

  useEffect(() => {
    if (!selectedProject && projects && projects.length > 0) {
      setSelectedProject(projects[0]);
    }
    if (selectedProject && projects && !projects.find(p => p.id === selectedProject.id)) {
      setSelectedProject(projects.length > 0 ? projects[0] : null);
    }
  }, [projects, selectedProject]);

  const createProjectMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!session) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from('projects')
        .insert([{ name, user_id: session.user.id }])
        .select();
      
      if (error) {
        showError("Could not create project.");
        throw new Error(error.message);
      }
      return data[0];
    },
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects', session?.user?.id] });
      setSelectedProject(newProject);
      showSuccess("Project created successfully!");
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        showError("Could not delete project.");
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', session?.user?.id] });
      showSuccess("Project deleted.");
    },
  });

  const handleCreateProject = (name: string) => {
    createProjectMutation.mutate(name);
  };

  const handleDeleteProject = (projectId: string) => {
    deleteProjectMutation.mutate(projectId);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="h-screen w-screen flex flex-col">
      <Header />
      <div className="flex-grow overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full w-full">
          <ResizablePanel 
            defaultSize={25} // Initial expanded size
            minSize={5} // Minimum size (collapsed)
            maxSize={25} // Maximum size (expanded)
            collapsedSize={5} // Size when collapsed
            collapsible={true}
            onCollapse={() => setIsSidebarCollapsed(true)}
            onExpand={() => setIsSidebarCollapsed(false)}
            className={cn(
              "flex h-full flex-col bg-sidebar-background border-r border-sidebar-border transition-all duration-300 ease-in-out",
              isSidebarCollapsed ? "items-center px-2" : "px-6"
            )}
          >
            <div className={cn("flex items-center justify-between mb-6", isSidebarCollapsed ? "w-full pt-6" : "w-full pt-6")}>
              {!isSidebarCollapsed && (
                <h2 className="text-xl font-semibold tracking-tight text-sidebar-foreground">Case Studies</h2>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsNewProjectDialogOpen(true)}
                    className={cn("rounded-lg", isSidebarCollapsed ? "w-10 h-10" : "w-auto h-auto")}
                  >
                    <Plus className={cn("h-4 w-4", !isSidebarCollapsed && "mr-2")} />
                    {!isSidebarCollapsed && "New Project"}
                    {isSidebarCollapsed && <span className="sr-only">New Project</span>}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="rounded-lg">Create a new case study project</TooltipContent>
              </Tooltip>
            </div>
            
            <Separator className={cn("mb-6", isSidebarCollapsed && "w-full")} />

            <div className="flex-grow overflow-y-auto">
              <ProjectList 
                projects={projects || []} 
                onSelectProject={setSelectedProject} 
                selectedProject={selectedProject}
                onDeleteProject={handleDeleteProject}
                isCollapsed={isSidebarCollapsed}
              />
            </div>

            <div className={cn("mt-auto pt-4", isSidebarCollapsed ? "w-full flex justify-center" : "w-full flex justify-end")}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="rounded-lg"
                  >
                    {isSidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                    <span className="sr-only">{isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="rounded-lg">
                  {isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                </TooltipContent>
              </Tooltip>
            </div>
          </ResizablePanel>
          <ResizablePanel defaultSize={75}>
            {selectedProject ? (
              <ProjectDetail project={selectedProject} />
            ) : (
              <div className="flex h-full items-center justify-center p-6 bg-background">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-foreground">Welcome!</h2>
                  <p className="text-muted-foreground mt-2 text-lg">Select a project from the sidebar or create a new one to get started.</p>
                </div>
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <NewProjectDialog open={isNewProjectDialogOpen} onOpenChange={setIsNewProjectDialogOpen} onCreateProject={handleCreateProject} />
    </div>
  );
};

export default Index;