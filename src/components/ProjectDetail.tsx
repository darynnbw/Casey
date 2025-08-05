import { Project, Entry, Decision, JournalEntry, ProblemSolution } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { showSuccess, showError } from "@/utils/toast";
import LoadingSpinner from "./LoadingSpinner";
import { AddNoteDialog } from "./AddNoteDialog";
import { AddScreenshotDialog } from "./AddScreenshotDialog";
import { AddDecisionWizardDialog } from "./AddDecisionWizardDialog"; // Corrected import name
import { AddJournalEntryDialog } from "./AddJournalEntryDialog";
import { AddProblemSolutionDialog } from "./AddProblemSolutionDialog";
import { AddActionsDropdown } from "./AddActionsDropdown";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { Trash2, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NoteCard } from "./NoteCard";
import { ScreenshotCard } from "./ScreenshotCard";
import { DecisionCard } from "./DecisionCard";
import { JournalEntryCard } from "./JournalEntryCard";
import { ProblemSolutionCard } from "./ProblemSolutionCard";

// Import new edit dialogs
import { EditNoteDialog } from "./EditNoteDialog";
import { EditScreenshotDialog } from "./EditScreenshotDialog";
import { EditDecisionWizardDialog } from "./EditDecisionWizardDialog";
import { EditJournalEntryDialog } from "./EditJournalEntryDialog";
import { EditProblemSolutionDialog } from "./EditProblemSolutionDialog";

interface ProjectDetailProps {
  project: Project;
}

const groupEntriesByDate = <T extends { created_at: string }>(entries: T[]) => {
  return entries.reduce((acc, entry) => {
    const date = format(new Date(entry.created_at), "MMMM d, yyyy");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, T[]>);
};

const isUrl = (text: string) => {
  return text.startsWith('http://') || text.startsWith('https://');
}

// Motivational messages for each section
const notesScreenshotsMessages = [
  "Capture every idea, big or small. Your next breakthrough starts with a note!",
  "A picture is worth a thousand words. Document your progress with a screenshot!",
  "Don't let brilliant insights fade. Jot them down here!",
  "Your project's story unfolds with every note and screenshot you add.",
  "Visualize your journey. Start adding notes and screenshots today!",
];

const decisionsMessages = [
  "Every great product is built on thoughtful decisions. Log yours here!",
  "Clarity comes from documenting choices. What's your next big decision?",
  "Make your design process transparent. Start logging decisions now!",
  "Future you will thank past you for documenting these insights.",
  "Decisions shape destiny. Record the turning points of your project.",
];

const journalEntriesMessages = [
  "Reflect and grow. Your daily insights are valuable here.",
  "Track your journey, one entry at a time. What did you learn today?",
  "A space for your thoughts, challenges, and triumphs. Start journaling!",
  "Your personal log of progress and reflections. Add an entry!",
  "Document your process, not just the outcome. Journal your way to success.",
];

const problemSolutionsMessages = [
  "Turn challenges into triumphs. Document your problem-solving journey!",
  "Every problem has a solution. Share how you conquered yours.",
  "Learn from every hurdle. Log your problems and their brilliant solutions.",
  "Your repository of challenges overcome. What problem did you solve today?",
  "Build a knowledge base of solutions. Start documenting problems now!",
];

const getRandomMessage = (messages: string[]) => {
  return messages[Math.floor(Math.random() * messages.length)];
};

export function ProjectDetail({ project }: ProjectDetailProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("notes-screenshots");

  // State to control add dialogs
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isScreenshotDialogOpen, setIsScreenshotDialogOpen] = useState(false);
  const [isDecisionWizardOpen, setIsDecisionWizardOpen] = useState(false);
  const [isJournalEntryDialogOpen, setIsJournalEntryDialogOpen] = useState(false);
  const [isProblemSolutionDialogOpen, setIsProblemSolutionDialogOpen] = useState(false);

  // State to control edit dialogs and hold data
  const [editingNote, setEditingNote] = useState<Entry | null>(null);
  const [isEditNoteDialogOpen, setIsEditNoteDialogOpen] = useState(false);

  const [editingScreenshot, setEditingScreenshot] = useState<Entry | null>(null);
  const [isEditScreenshotDialogOpen, setIsEditScreenshotDialogOpen] = useState(false);

  const [editingDecision, setEditingDecision] = useState<Decision | null>(null);
  const [isEditDecisionWizardOpen, setIsEditDecisionWizardOpen] = useState(false);

  const [editingJournalEntry, setEditingJournalEntry] = useState<JournalEntry | null>(null);
  const [isEditJournalEntryDialogOpen, setIsEditJournalEntryDialogOpen] = useState(false);

  const [editingProblemSolution, setEditingProblemSolution] = useState<ProblemSolution | null>(null);
  const [isEditProblemSolutionDialogOpen, setIsEditProblemSolutionDialogOpen] = useState(false);

  // Fetch Notes & Screenshots
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

  const { data: entries, isLoading: isLoadingEntries } = useQuery<Entry[]>({
    queryKey: ["entries", project.id],
    queryFn: fetchEntries,
  });

  // Fetch Decisions
  const fetchDecisions = async () => {
    const { data, error } = await supabase
      .from("decisions")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false });
    if (error) {
      showError("Could not fetch decisions.");
      throw new Error(error.message);
    }
    return data;
  };

  const { data: decisions, isLoading: isLoadingDecisions } = useQuery<Decision[]>({
    queryKey: ["decisions", project.id],
    queryFn: fetchDecisions,
  });

  // Fetch Journal Entries
  const fetchJournalEntries = async () => {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false });
    if (error) {
      showError("Could not fetch journal entries.");
      throw new Error(error.message);
    }
    return data;
  };

  const { data: journalEntries, isLoading: isLoadingJournalEntries } = useQuery<JournalEntry[]>({
    queryKey: ["journal_entries", project.id],
    queryFn: fetchJournalEntries,
  });

  // Fetch Problem Solutions
  const fetchProblemSolutions = async () => {
    const { data, error } = await supabase
      .from("problem_solutions")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false });
    if (error) {
      showError("Could not fetch problem solutions.");
      throw new Error(error.message);
    }
    return data;
  };

  const { data: problemSolutions, isLoading: isLoadingProblemSolutions } = useQuery<ProblemSolution[]>({
    queryKey: ["problem_solutions", project.id],
    queryFn: fetchProblemSolutions,
  });

  // Mutations for Notes & Screenshots
  const addNoteMutation = useMutation({
    mutationFn: async ({ content, tags, location, createdAt }: { content: string, tags: string[], location: string, createdAt: string }) => {
      if (!session) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from("entries")
        .insert([{ project_id: project.id, user_id: session.user.id, type: "note", content, tags, location, created_at: createdAt }])
        .select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries", project.id] });
      showSuccess("Note added.");
      setIsNoteDialogOpen(false);
    },
    onError: () => showError("Could not add note."),
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, content, tags, location, createdAt }: { id: string, content: string, tags: string[], location: string, createdAt: string }) => {
      if (!session) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from("entries")
        .update({ content, tags, location, created_at: createdAt })
        .eq('id', id)
        .select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries", project.id] });
      showSuccess("Note updated.");
      setIsEditNoteDialogOpen(false);
      setEditingNote(null);
    },
    onError: () => showError("Could not update note."),
  });

  const addScreenshotMutation = useMutation({
    mutationFn: async ({ file, caption, tags, location, createdAt }: { file: File, caption: string, tags: string[], location: string, createdAt: string }) => {
      if (!session) throw new Error("User not authenticated");
      
      const filePath = `${session.user.id}/${project.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("project_files").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("project_files").getPublicUrl(filePath);

      const { data, error: insertError } = await supabase
        .from("entries")
        .insert([{ project_id: project.id, user_id: session.user.id, type: "screenshot", content: caption, file_url: publicUrl, tags, location, created_at: createdAt }])
        .select();
      if (insertError) throw insertError;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries", project.id] });
      showSuccess("Screenshot added.");
      setIsScreenshotDialogOpen(false);
    },
    onError: () => showError("Could not add screenshot."),
  });

  const updateScreenshotMutation = useMutation({
    mutationFn: async ({ id, file, caption, tags, location, createdAt, oldFileUrl }: { id: string, file: File | null, caption: string, tags: string[], location: string, createdAt: string, oldFileUrl?: string | null }) => {
      if (!session) throw new Error("User not authenticated");
      
      let fileUrl = oldFileUrl;
      if (file) {
        // Delete old file if it exists
        if (oldFileUrl) {
          const oldFilePath = oldFileUrl.split('/project_files/')[1];
          await supabase.storage.from('project_files').remove([oldFilePath]);
        }
        // Upload new file
        const filePath = `${session.user.id}/${project.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from("project_files").upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("project_files").getPublicUrl(filePath);
        fileUrl = publicUrl;
      }

      const { data, error: updateError } = await supabase
        .from("entries")
        .update({ content: caption, file_url: fileUrl, tags, location, created_at: createdAt })
        .eq('id', id)
        .select();
      if (updateError) throw updateError;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries", project.id] });
      showSuccess("Screenshot updated.");
      setIsEditScreenshotDialogOpen(false);
      setEditingScreenshot(null);
    },
    onError: () => showError("Could not update screenshot."),
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

  // Mutations for Decisions
  const addDecisionMutation = useMutation({
    mutationFn: async (decisionData: Omit<Decision, 'id' | 'user_id' | 'project_id' | 'created_at'> & { createdAt: string }) => {
      if (!session) throw new Error("User not authenticated");
      const { createdAt, ...rest } = decisionData;
      const { data, error } = await supabase
        .from("decisions")
        .insert([{ ...rest, project_id: project.id, user_id: session.user.id, created_at: createdAt }])
        .select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decisions", project.id] });
      showSuccess("Decision logged.");
      setIsDecisionWizardOpen(false);
    },
    onError: () => showError("Could not log decision."),
  });

  const updateDecisionMutation = useMutation({
    mutationFn: async (decisionData: Omit<Decision, 'project_id' | 'user_id'> & { createdAt: string }) => { // Adjusted type to omit project_id and user_id from input
      if (!session) throw new Error("User not authenticated");
      const { id, createdAt, ...rest } = decisionData;
      const { data, error } = await supabase
        .from("decisions")
        .update({ ...rest, created_at: createdAt })
        .eq('id', id)
        .select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decisions", project.id] });
      showSuccess("Decision updated.");
      setIsEditDecisionWizardOpen(false);
      setEditingDecision(null);
    },
    onError: () => showError("Could not update decision."),
  });

  const deleteDecisionMutation = useMutation({
    mutationFn: async (decisionId: string) => {
      const { error } = await supabase.from('decisions').delete().eq('id', decisionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisions', project.id] });
      showSuccess("Decision deleted.");
    },
    onError: () => showError("Could not delete decision."),
  });

  // Mutations for Journal Entries
  const addJournalEntryMutation = useMutation({
    mutationFn: async (journalEntryData: Omit<JournalEntry, 'id' | 'user_id' | 'project_id' | 'created_at'> & { createdAt: string }) => {
      if (!session) throw new Error("User not authenticated");
      const { createdAt, ...rest } = journalEntryData;
      const { data, error } = await supabase
        .from("journal_entries")
        .insert([{ ...rest, project_id: project.id, user_id: session.user.id, created_at: createdAt }])
        .select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal_entries", project.id] });
      showSuccess("Journal entry added.");
      setIsJournalEntryDialogOpen(false);
    },
    onError: () => showError("Could not add journal entry."),
  });

  const updateJournalEntryMutation = useMutation({
    mutationFn: async (journalEntryData: Omit<JournalEntry, 'project_id' | 'user_id'> & { createdAt: string }) => { // Adjusted type to omit project_id and user_id from input
      if (!session) throw new Error("User not authenticated");
      const { id, createdAt, ...rest } = journalEntryData;
      const { data, error } = await supabase
        .from("journal_entries")
        .update({ ...rest, created_at: createdAt })
        .eq('id', id)
        .select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal_entries", project.id] });
      showSuccess("Journal entry updated.");
      setIsEditJournalEntryDialogOpen(false);
      setEditingJournalEntry(null);
    },
    onError: () => showError("Could not update journal entry."),
  });

  const deleteJournalEntryMutation = useMutation({
    mutationFn: async (journalEntryId: string) => {
      const { error } = await supabase.from('journal_entries').delete().eq('id', journalEntryId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal_entries', project.id] });
      showSuccess("Journal entry deleted.");
    },
    onError: () => showError("Could not delete journal entry."),
  });

  // Mutations for Problem Solutions
  const addProblemSolutionMutation = useMutation({
    mutationFn: async (problemSolutionData: Omit<ProblemSolution, 'id' | 'user_id' | 'project_id' | 'created_at'> & { createdAt: string }) => {
      if (!session) throw new Error("User not authenticated");
      const { createdAt, ...rest } = problemSolutionData;
      const { data, error } = await supabase
        .from("problem_solutions")
        .insert([{ ...rest, project_id: project.id, user_id: session.user.id, created_at: createdAt }])
        .select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problem_solutions", project.id] });
      showSuccess("Problem/Solution logged.");
      setIsProblemSolutionDialogOpen(false);
    },
    onError: () => showError("Could not log problem/solution."),
  });

  const updateProblemSolutionMutation = useMutation({
    mutationFn: async (problemSolutionData: Omit<ProblemSolution, 'project_id' | 'user_id'> & { createdAt: string }) => { // Adjusted type to omit project_id and user_id from input
      if (!session) throw new Error("User not authenticated");
      const { id, createdAt, ...rest } = problemSolutionData;
      const { data, error } = await supabase
        .from("problem_solutions")
        .update({ ...rest, created_at: createdAt })
        .eq('id', id)
        .select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problem_solutions", project.id] });
      showSuccess("Problem/Solution updated.");
      setIsEditProblemSolutionDialogOpen(false);
      setEditingProblemSolution(null);
    },
    onError: () => showError("Could not update problem/solution."),
  });

  if (isLoadingEntries || isLoadingDecisions || isLoadingJournalEntries || isLoadingProblemSolutions) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
  }

  // Filter entries based on selectedTag
  const allEntries = (entries || []).concat(
    (decisions || []).map(d => ({ ...d, type: 'decision', content: d.title, tags: d.tags || [] })),
    (journalEntries || []).map(j => ({ ...j, type: 'journal', content: j.content, tags: j.tags || [] })),
    (problemSolutions || []).map(p => ({ ...p, type: 'problem_solution', content: p.title, tags: p.tags || [] }))
  );

  const filteredEntries = selectedTag
    ? allEntries.filter(entry => entry.tags?.includes(selectedTag))
    : allEntries;

  const groupedEntries = groupEntriesByDate(filteredEntries || []);
  const groupedDecisions = groupEntriesByDate(decisions || []);
  const groupedJournalEntries = groupEntriesByDate(journalEntries || []);
  const groupedProblemSolutions = groupEntriesByDate(problemSolutions || []);

  // Extract unique tags for pills (from all types of entries)
  const allUniqueTags = Array.from(new Set(allEntries.flatMap(entry => entry.tags || []).filter(tag => tag !== '')));

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <AddActionsDropdown
            onAddNote={() => setIsNoteDialogOpen(true)}
            onAddScreenshot={() => setIsScreenshotDialogOpen(true)}
            onAddDecision={() => setIsDecisionWizardOpen(true)}
            onAddJournalEntry={() => setIsJournalEntryDialogOpen(true)}
            onAddProblemSolution={() => setIsProblemSolutionDialogOpen(true)}
          />
        </div>
      </div>
      <div className="flex-grow overflow-y-auto p-8 bg-background">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="notes-screenshots">Notes & Screenshots</TabsTrigger>
            <TabsTrigger value="decisions">Decisions</TabsTrigger>
            <TabsTrigger value="journal-entries">Journal Entries</TabsTrigger>
            <TabsTrigger value="problem-solutions">Problem Solutions</TabsTrigger>
          </TabsList>

          <TabsContent value="notes-screenshots">
            {allUniqueTags.length > 0 && (
              <div className="mb-8 flex flex-wrap gap-2">
                <Badge
                  variant={selectedTag === null ? "default" : "outline"}
                  className={cn("cursor-pointer rounded-full px-3 py-1 text-sm", selectedTag === null && "bg-primary text-primary-foreground hover:bg-primary/90")}
                  onClick={() => setSelectedTag(null)}
                >
                  All
                </Badge>
                {allUniqueTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    className={cn("cursor-pointer rounded-full px-3 py-1 text-sm", selectedTag === tag && "bg-primary text-primary-foreground hover:bg-primary/90")}
                    onClick={() => setSelectedTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {Object.keys(groupedEntries).length === 0 ? (
              <div className="text-center text-muted-foreground mt-12">
                <p className="text-lg">{getRandomMessage(notesScreenshotsMessages)}</p>
                <p className="text-md mt-2">Add one to get started.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {Object.entries(groupedEntries).map(([date, entriesOnDate]) => (
                  <div key={date}>
                    <h3 className="text-xl font-semibold mb-6 pb-2 border-b border-border/50">{date}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {entriesOnDate.map((entry, index) => {
                        if (entry.type === 'note') {
                          return <NoteCard key={entry.id} note={entry} onDelete={deleteEntryMutation.mutate} onEdit={(note) => { setEditingNote(note); setIsEditNoteDialogOpen(true); }} index={index} />;
                        } else if (entry.type === 'screenshot') {
                          return <ScreenshotCard key={entry.id} screenshot={entry} onDelete={deleteEntryMutation.mutate} onEdit={(screenshot) => { setEditingScreenshot(screenshot); setIsEditScreenshotDialogOpen(true); }} index={index} />;
                        }
                        return null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="decisions">
            {Object.keys(groupedDecisions).length === 0 ? (
              <div className="text-center text-muted-foreground mt-12">
                <p className="text-lg">{getRandomMessage(decisionsMessages)}</p>
                <p className="text-md mt-2">Add a decision to document your design choices.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {Object.entries(groupedDecisions).map(([date, decisionsOnDate]) => (
                  <div key={date}>
                    <h3 className="text-xl font-semibold mb-6 pb-2 border-b border-border/50">{date}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {decisionsOnDate.map((decision, index) => (
                        <DecisionCard key={decision.id} decision={decision} onDelete={deleteDecisionMutation.mutate} onEdit={(decision) => { setEditingDecision(decision); setIsEditDecisionWizardOpen(true); }} index={index} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="journal-entries">
            {Object.keys(groupedJournalEntries).length === 0 ? (
              <div className="text-center text-muted-foreground mt-12">
                <p className="text-lg">{getRandomMessage(journalEntriesMessages)}</p>
                <p className="text-md mt-2">Add an entry to log your thoughts and progress.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {Object.entries(groupedJournalEntries).map(([date, journalEntriesOnDate]) => (
                  <div key={date}>
                    <h3 className="text-xl font-semibold mb-6 pb-2 border-b border-border/50">{date}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {journalEntriesOnDate.map((journalEntry, index) => (
                        <JournalEntryCard key={journalEntry.id} journalEntry={journalEntry} onDelete={(id) => deleteJournalEntryMutation.mutate(id)} onEdit={(journalEntry) => { setEditingJournalEntry(journalEntry); setIsEditJournalEntryDialogOpen(true); }} index={index} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="problem-solutions">
            {Object.keys(groupedProblemSolutions).length === 0 ? (
              <div className="text-center text-muted-foreground mt-12">
                <p className="text-lg">{getRandomMessage(problemSolutionsMessages)}</p>
                <p className="text-md mt-2">Add one to document UX challenges and their resolutions.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {Object.entries(groupedProblemSolutions).map(([date, problemSolutionsOnDate]) => (
                  <div key={date}>
                    <h3 className="text-xl font-semibold mb-6 pb-2 border-b border-border/50">{date}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {problemSolutionsOnDate.map((ps, index) => (
                        <ProblemSolutionCard key={ps.id} problemSolution={ps} onDelete={(id) => deleteProblemSolutionMutation.mutate(id)} onEdit={(problemSolution) => { setEditingProblemSolution(problemSolution); setIsEditProblemSolutionDialogOpen(true); }} index={index} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      {/* Add Dialogs */}
      <AddNoteDialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen} onAddNote={(content, tags, location, createdAt) => addNoteMutation.mutate({ content, tags, location, createdAt })} />
      <AddScreenshotDialog open={isScreenshotDialogOpen} onOpenChange={setIsScreenshotDialogOpen} onAddScreenshot={(file, caption, tags, location, createdAt) => addScreenshotMutation.mutate({ file, caption, tags, location, createdAt })} />
      <AddDecisionWizardDialog open={isDecisionWizardOpen} onOpenChange={setIsDecisionWizardOpen} onAddDecision={(title, summary, context, alternatives, createdAt) => addDecisionMutation.mutate({ title, summary, context, alternatives, createdAt })} />
      <AddJournalEntryDialog open={isJournalEntryDialogOpen} onOpenChange={setIsJournalEntryDialogOpen} onAddJournalEntry={(content, mood, tags, createdAt) => addJournalEntryMutation.mutate({ content, mood, tags, createdAt })} />
      <AddProblemSolutionDialog open={isProblemSolutionDialogOpen} onOpenChange={setIsProblemSolutionDialogOpen} onAddProblemSolution={(title, problem_description, occurrence_location, solution, outcome, tags, createdAt) => addProblemSolutionMutation.mutate({ title, problem_description, occurrence_location, solution, outcome, tags, createdAt })} />
      
      {/* Edit Dialogs */}
      {editingNote && (
        <EditNoteDialog 
          open={isEditNoteDialogOpen} 
          onOpenChange={setIsEditNoteDialogOpen} 
          initialData={editingNote} 
          onUpdateNote={(id, content, tags, location, createdAt) => updateNoteMutation.mutate({ id, content, tags, location, createdAt })} 
        />
      )}
      {editingScreenshot && (
        <EditScreenshotDialog 
          open={isEditScreenshotDialogOpen} 
          onOpenChange={setIsEditScreenshotDialogOpen} 
          initialData={editingScreenshot} 
          onUpdateScreenshot={(id, file, caption, tags, location, createdAt) => updateScreenshotMutation.mutate({ id, file, caption, tags, location, createdAt, oldFileUrl: editingScreenshot.file_url })} 
        />
      )}
      {editingDecision && (
        <EditDecisionWizardDialog 
          open={isEditDecisionWizardOpen} 
          onOpenChange={setIsEditDecisionWizardOpen} 
          initialData={editingDecision} 
          onUpdateDecision={(id, title, summary, context, alternatives, rationale, tags, createdAt) => updateDecisionMutation.mutate({ id, title, summary, context, alternatives, rationale, tags, created_at: createdAt })} 
        />
      )}
      {editingJournalEntry && (
        <EditJournalEntryDialog 
          open={isEditJournalEntryDialogOpen} 
          onOpenChange={setIsEditJournalEntryDialogOpen} 
          initialData={editingJournalEntry} 
          onUpdateJournalEntry={(id, content, mood, tags, createdAt) => updateJournalEntryMutation.mutate({ id, content, mood, tags, created_at: createdAt })} 
        />
      )}
      {editingProblemSolution && (
        <EditProblemSolutionDialog 
          open={isEditProblemSolutionDialogOpen} 
          onOpenChange={setIsEditProblemSolutionDialogOpen} 
          initialData={editingProblemSolution} 
          onUpdateProblemSolution={(id, title, problem_description, occurrence_location, solution, outcome, tags, createdAt) => updateProblemSolutionMutation.mutate({ id, title, problem_description, occurrence_location, solution, outcome, tags, created_at: createdAt })} 
        />
      )}
    </div>
  );
}