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
import { Trash2 } from "lucide-react";

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
    mutationFn: async (content: string) => {
      if (!session) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from("entries")
        .insert([{ project_id: project.id, user_id: session.user.id, type: "note", content }])
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
    mutationFn: async ({ file, caption }: { file: File, caption: string }) => {
      if (!session) throw new Error("User not authenticated");
      
      const filePath = `${session.user.id}/${project.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("project_files").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("project_files").getPublicUrl(filePath);

      const { data, error: insertError } = await supabase
        .from("entries")
        .insert([{ project_id: project.id, user_id: session.user.id, type: "screenshot", content: caption, file_url: publicUrl }])
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
            <AddNoteDialog onAddNote={(content) => addNoteMutation.mutate(content)} />
            <AddScreenshotDialog onAddScreenshot={(file, caption) => addScreenshotMutation.mutate({ file, caption })} />
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
          <div className="space-y-8">
            {Object.entries(groupedEntries).map(([date, entriesOnDate]) => (
              <div key={date}>
                <h3 className="text-lg font-semibold mb-4 pb-2 border-b">{date}</h3>
                <div className="space-y-4">
                  {entriesOnDate.map((entry) => (
                    <div key={entry.id} className="bg-card p-4 rounded-lg border group relative">
                      <p className="text-sm text-muted-foreground mb-2">{format(new Date(entry.created_at), "h:mm a")}</p>
                      {entry.type === 'note' && <p className="whitespace-pre-wrap">{entry.content}</p>}
                      {entry.type === 'screenshot' && (
                        <div>
                          <img src={entry.file_url} alt={entry.content || 'Screenshot'} className="max-h-80 w-auto object-contain rounded-md border" />
                          {entry.content && <p className="mt-2 text-sm italic">{entry.content}</p>}
                        </div>
                      )}
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100" onClick={() => deleteEntryMutation.mutate(entry)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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