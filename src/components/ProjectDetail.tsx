import { Project, Entry } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { showSuccess, showError } from "@/utils/toast";
import LoadingSpinner from "./LoadingSpinner";
import { AddNoteDialog } from "./AddNoteDialog";
import { AddScreenshotDialog } from "./AddScreenshotDialog";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { Trash2, Link2, FileText, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProjectDetailProps {
  project: Project;
}

const groupEntriesByDate = (entries: Entry[]) => {
  return entries.reduce((acc, entry) => {
    const date = format(new Date(entry.created_at), "MMMM d, yyyy");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, Entry[]>);
};

const isUrl = (text: string) => {
  try {
    new URL(text);
    return true;
  } catch (_) {
    return false;
  }
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false });
    if (error) {
      showError("Could not fetch project entries.");
      throw new Error(error.message);
    }
    return data;
  };

  const { data: entries, isLoading } = useQuery<Entry[]>({
    queryKey: ["entries", project.id],
    queryFn: fetchEntries,
  });

  const addNoteMutation = useMutation({
    mutationFn: async ({ content, tags, location }: { content: string, tags: string[], location: string }) => {
      if (!session) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from("entries")
        .insert([{ project_id: project.id, user_id: session.user.id, type: "note", content, tags, location }])
        .select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries", project.id] });
      showSuccess("Note added.");
    },
    onError: () => showError("Could not add note."),
  });

  const addScreenshotMutation = useMutation({
    mutationFn: async ({ file, caption, tags, location }: { file: File, caption: string, tags: string[], location: string }) => {
      if (!session) throw new Error("User not authenticated");
      
      const filePath = `${session.user.id}/${project.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("project_files").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("project_files").getPublicUrl(filePath);

      const { data, error: insertError } = await supabase
        .from("entries")
        .insert([{ project_id: project.id, user_id: session.user.id, type: "screenshot", content: caption, file_url: publicUrl, tags, location }])
        .select();
      if (insertError) throw insertError;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries", project.id] });
      showSuccess("Screenshot added.");
    },
    onError: () => showError("Could not add screenshot."),
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (entry: Entry) => {
      if (entry.type === 'screenshot' && entry.file_url) {
        const filePath = entry.file_url.split('/project_files/')[1];
        await supabase.storage.from('project_files').remove([filePath]);
      }
      const { error } = await supabase.from('entries').delete().eq('id', entry.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries', project.id] });
      showSuccess("Entry deleted.");
    },
    onError: () => showError("Could not delete entry."),
  });

  if (isLoading) return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;

  const groupedEntries = groupEntriesByDate(entries || []);

  return (
    <div className="w-full h-full flex flex-col bg-background">
      <div className="p-6 border-b bg-card/30">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
          <div className="flex gap-2">
            <AddNoteDialog onAddNote={(content, tags, location) => addNoteMutation.mutate({ content, tags, location })} />
            <AddScreenshotDialog onAddScreenshot={(file, caption, tags, location) => addScreenshotMutation.mutate({ file, caption, tags, location })} />
          </div>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto p-6">
        {Object.keys(groupedEntries).length === 0 ? (
          <div className="text-center text-muted-foreground mt-8">
            <p>This project is empty.</p>
            <p>Add a note or screenshot to get started.</p>
          </div>
        ) : (
          <div className="space-y-8 max-w-5xl mx-auto">
            {Object.entries(groupedEntries).map(([date, entriesOnDate]) => (
              <div key={date}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-4 pb-2">{date}</h3>
                <div className="space-y-6">
                  {entriesOnDate.map((entry) => (
                    <div key={entry.id} className="bg-card border rounded-xl shadow-sm p-5 group relative transition-all hover:shadow-md">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            {entry.type === 'note' ? <FileText className="h-5 w-5 text-primary" /> : <ImageIcon className="h-5 w-5 text-primary" />}
                          </div>
                          <div>
                            <p className="font-medium">{entry.type === 'note' ? 'Note' : 'Screenshot'}</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(entry.created_at), "h:mm a")}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => deleteEntryMutation.mutate(entry)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>

                      <div className="mt-4 pl-10">
                        {entry.type === 'screenshot' && entry.file_url && (
                          <div className="mb-3">
                            <img src={entry.file_url} alt={entry.content || 'Screenshot'} className="max-h-80 w-auto object-contain rounded-lg border bg-white" />
                          </div>
                        )}
                        {entry.content && <p className="whitespace-pre-wrap text-sm text-foreground/90">{entry.content}</p>}
                        
                        <div className="flex flex-wrap gap-2 mt-4">
                          {entry.location && (
                            <Badge variant="outline" className="flex items-center gap-1.5">
                              <Link2 className="h-3 w-3" />
                              {isUrl(entry.location) ? (
                                <a href={entry.location} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                  {entry.location}
                                </a>
                              ) : (
                                <span>{entry.location}</span>
                              )}
                            </Badge>
                          )}
                          {entry.tags && entry.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}