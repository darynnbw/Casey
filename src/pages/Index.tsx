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
import { FolderPlus } from "lucide-react";

const Index = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
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
    <div className="h-screen w-screen flex flex-col bg-background">
      <Header />
      <div className="flex-grow overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full w-full">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-card/50">
            <div className="flex h-full flex-col p-4">
              <h2 className="text-lg font-bold tracking-tight mb-4 px-2">Case Studies</h2>
              <div className="px-2 mb-4">
                <NewProjectDialog onCreateProject={handleCreateProject} />
              </div>
              <div className="mt-2 flex-grow overflow-y-auto">
                <ProjectList 
                  projects={projects || []} 
                  onSelectProject={setSelectedProject} 
                  selectedProject={selectedProject}
                  onDeleteProject={handleDeleteProject}
                />
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={80}>
            {selectedProject ? (
              <ProjectDetail project={selectedProject} />
            ) : (
              <div className="flex h-full items-center justify-center p-6">
                <div className="text-center">
                  <FolderPlus className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h2 className="mt-4 text-xl font-semibold">Welcome!</h2>
                  <p className="text-muted-foreground mt-2">Select a project or create a new one to get started.</p>
                </div>
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Index;