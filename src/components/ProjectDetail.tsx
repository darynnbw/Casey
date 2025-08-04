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
import { Trash2, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  return text.startsWith('http://') || text.startsWith('https://');
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
    <div className="w-full h-full flex flex-col">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <div className="flex gap-2">
            <AddNoteDialog onAddNote={(content, tags, location) => addNoteMutation.mutate({ content, tags, location })} />
            <AddScreenshotDialog onAddScreenshot={(file, caption, tags, location) => addScreenshotMutation.mutate({ file, caption, tags, location })} />
          </div>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900/50">
        {Object.keys(groupedEntries).length === 0 ? (
          <div className="text-center text-muted-foreground mt-8">
            <p>This project is empty.</p>
            <p>Add a note or screenshot to get started.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedEntries).map(([date, entriesOnDate]) => (
              <div key={date}>
                <h3 className="text-lg font-semibold mb-4 pb-2 border-b">{date}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {entriesOnDate.map((entry, index) => (
                    <div key={entry.id} className={cn(
                      "bg-yellow-50 dark:bg-yellow-900/20 shadow-md p-4 rounded-lg group relative transform transition-transform hover:scale-105 flex flex-col gap-3",
                      index % 2 === 0 ? "rotate-1" : "-rotate-1"
                    )}>
                      <div className="flex justify-between items-start">
                        <p className="text-xs text-muted-foreground">{format(new Date(entry.created_at), "h:mm a")}</p>
                        <Button variant="ghost" size="icon" className="absolute top-1 right-1 opacity-0 group-hover:opacity-100" onClick={() => deleteEntryMutation.mutate(entry)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      
                      {entry.location && (
                        <Badge variant="outline" className="w-fit">
                          {isUrl(entry.location) ? (
                            <a href={entry.location} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                              <Link2 className="h-3 w-3" />
                              {entry.location}
                            </a>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Link2 className="h-3 w-3" />
                              {entry.location}
                            </span>
                          )}
                        </Badge>
                      )}

                      {entry.type === 'note' && <p className="whitespace-pre-wrap text-sm">{entry.content}</p>}
                      {entry.type === 'screenshot' && (
                        <div className="space-y-2">
                          <img src={entry.file_url} alt={entry.content || 'Screenshot'} className="w-full object-contain rounded-md border bg-white" />
                          {entry.content && <p className="text-sm italic">{entry.content}</p>}
                        </div>
                      )}

                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-auto pt-2">
                          {entry.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                      )}
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