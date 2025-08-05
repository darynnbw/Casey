import { Project, Entry, Decision, JournalEntry, ProblemSolution } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { showSuccess, showError } from "@/utils/toast";
import LoadingSpinner from "./LoadingSpinner";
import { AddNoteDialog } from "./AddNoteDialog";
import { AddScreenshotDialog } from "./AddScreenshotDialog";
import { DecisionWizardDialog } from "./DecisionWizardDialog";
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

  // State to control dialogs
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isScreenshotDialogOpen, setIsScreenshotDialogOpen] = useState(false);
  const [isDecisionWizardOpen, setIsDecisionWizardOpen] = useState(false);
  const [isJournalEntryDialogOpen, setIsJournalEntryDialogOpen] = useState(false);
  const [isProblemSolutionDialogOpen, setIsProblemSolutionDialogOpen] = useState(false);

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

  const deleteProblemSolutionMutation = useMutation({
    mutationFn: async (problemSolutionId: string) => {
      const { error } = await supabase.from('problem_solutions').delete().eq('id', problemSolutionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problem_solutions', project.id] });
      showSuccess("Problem/Solution deleted.");
    },
    onError: () => showError("Could not delete problem/solution."),
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
                      {entriesOnDate.map((entry, index) => (
                        <div key={entry.id} className={cn(
                          "bg-card border border-border/50 shadow-lg shadow-gray-100/50 dark:shadow-none p-6 rounded-xl group relative transform transition-all duration-300 hover:scale-[1.02] flex flex-col gap-4",
                          index % 2 === 0 ? "rotate-1" : "-rotate-1"
                        )}>
                          <div className="flex justify-between items-start">
                            <p className="text-sm text-muted-foreground">{format(new Date(entry.created_at), "h:mm a")}</p>
                            <Button variant="ghost" size="icon" className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" onClick={() => deleteEntryMutation.mutate(entry)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          
                          {entry.location && (
                            <Badge variant="outline" className="w-fit px-3 py-1 text-xs font-medium rounded-full bg-blue-50/50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800">
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

                          {entry.type === 'note' && <p className="whitespace-pre-wrap text-base text-foreground">{entry.content}</p>}
                          {entry.type === 'screenshot' && (
                            <div className="space-y-3">
                              <img src={entry.file_url} alt={entry.content || 'Screenshot'} className="w-full object-contain rounded-lg border border-border/50 bg-white shadow-sm" />
                              {entry.content && <p className="text-sm italic text-muted-foreground">{entry.content}</p>}
                            </div>
                          )}

                          {entry.tags && entry.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-auto pt-2">
                              {entry.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="secondary" className="rounded-full px-3 py-1 text-xs">{tag}</Badge>
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
                        <div key={decision.id} className={cn(
                          "bg-card border border-border/50 shadow-lg shadow-gray-100/50 dark:shadow-none p-6 rounded-xl group relative transform transition-all duration-300 hover:scale-[1.02] flex flex-col gap-4",
                          index % 2 === 0 ? "rotate-1" : "-rotate-1"
                        )}>
                          <div className="flex justify-between items-start">
                            <p className="text-sm text-muted-foreground">{format(new Date(decision.created_at), "h:mm a")}</p>
                            <Button variant="ghost" size="icon" className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" onClick={() => deleteDecisionMutation.mutate(decision.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <h4 className="text-lg font-semibold text-foreground">{decision.title}</h4>
                          {decision.summary && <p className="text-sm text-muted-foreground">{decision.summary}</p>}
                          {decision.context && (
                            <div>
                              <p className="text-sm font-medium text-foreground">Context:</p>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{decision.context}</p>
                            </div>
                          )}
                          {decision.alternatives && (
                            <div>
                              <p className="text-sm font-medium text-foreground">Alternatives:</p>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{decision.alternatives}</p>
                            </div>
                          )}
                          {decision.rationale && (
                            <div>
                              <p className="text-sm font-medium text-foreground">Rationale:</p>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{decision.rationale}</p>
                            </div>
                          )}
                          {/* Removed decision.status display */}
                          {decision.tags && decision.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-auto pt-2">
                              {decision.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="secondary" className="rounded-full px-3 py-1 text-xs">{tag}</Badge>
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
                        <div key={journalEntry.id} className={cn(
                          "bg-card border border-border/50 shadow-lg shadow-gray-100/50 dark:shadow-none p-6 rounded-xl group relative transform transition-all duration-300 hover:scale-[1.02] flex flex-col gap-4",
                          index % 2 === 0 ? "rotate-1" : "-rotate-1"
                        )}>
                          <div className="flex justify-between items-start">
                            <p className="text-sm text-muted-foreground">{format(new Date(journalEntry.created_at), "h:mm a")}</p>
                            <Button variant="ghost" size="icon" className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" onClick={() => deleteJournalEntryMutation.mutate(journalEntry.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <p className="whitespace-pre-wrap text-base text-foreground">{journalEntry.content}</p>
                          {journalEntry.mood && (
                            <Badge variant="outline" className="w-fit px-3 py-1 text-xs font-medium rounded-full bg-purple-50/50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800">
                              Mood: {journalEntry.mood}
                            </Badge>
                          )}
                          {journalEntry.tags && journalEntry.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-auto pt-2">
                              {journalEntry.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="secondary" className="rounded-full px-3 py-1 text-xs">{tag}</Badge>
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
                        <div key={ps.id} className={cn(
                          "bg-card border border-border/50 shadow-lg shadow-gray-100/50 dark:shadow-none p-6 rounded-xl group relative transform transition-all duration-300 hover:scale-[1.02] flex flex-col gap-4",
                          index % 2 === 0 ? "rotate-1" : "-rotate-1"
                        )}>
                          <div className="flex justify-between items-start">
                            <p className="text-sm text-muted-foreground">{format(new Date(ps.created_at), "h:mm a")}</p>
                            <Button variant="ghost" size="icon" className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" onClick={() => deleteProblemSolutionMutation.mutate(ps.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <h4 className="text-lg font-semibold text-foreground">{ps.title}</h4>
                          {ps.problem_description && (
                            <div>
                              <p className="text-sm font-medium text-foreground">Problem:</p>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ps.problem_description}</p>
                            </div>
                          )}
                          {ps.occurrence_location && (
                            <Badge variant="outline" className="w-fit px-3 py-1 text-xs font-medium rounded-full bg-blue-50/50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800">
                              Location: {ps.occurrence_location}
                            </Badge>
                          )}
                          {ps.possible_solutions && (
                            <div>
                              <p className="text-sm font-medium text-foreground">Possible Solutions:</p>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ps.possible_solutions}</p>
                            </div>
                          )}
                          {ps.chosen_solution && (
                            <div>
                              <p className="text-sm font-medium text-foreground">Chosen Solution:</p>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ps.chosen_solution}</p>
                            </div>
                          )}
                          {ps.outcome && (
                            <div>
                              <p className="text-sm font-medium text-foreground">Outcome:</p>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ps.outcome}</p>
                            </div>
                          )}
                          {ps.tags && ps.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-auto pt-2">
                              {ps.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="secondary" className="rounded-full px-3 py-1 text-xs">{tag}</Badge>
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
          </TabsContent>
        </Tabs>
      </div>
      {/* Dialogs are now controlled by state */}
      <AddNoteDialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen} onAddNote={(content, tags, location, createdAt) => addNoteMutation.mutate({ content, tags, location, createdAt })} />
      <AddScreenshotDialog open={isScreenshotDialogOpen} onOpenChange={setIsScreenshotDialogOpen} onAddScreenshot={(file, caption, tags, location, createdAt) => addScreenshotMutation.mutate({ file, caption, tags, location, createdAt })} />
      <DecisionWizardDialog open={isDecisionWizardOpen} onOpenChange={setIsDecisionWizardOpen} onAddDecision={(title, summary, context, alternatives, createdAt) => addDecisionMutation.mutate({ title, summary, context, alternatives, createdAt })} />
      <AddJournalEntryDialog open={isJournalEntryDialogOpen} onOpenChange={setIsJournalEntryDialogOpen} onAddJournalEntry={(content, mood, tags, createdAt) => addJournalEntryMutation.mutate({ content, mood, tags, createdAt })} />
      <AddProblemSolutionDialog open={isProblemSolutionDialogOpen} onOpenChange={setIsProblemSolutionDialogOpen} onAddProblemSolution={(title, problem_description, occurrence_location, possible_solutions, chosen_solution, outcome, tags, createdAt) => addProblemSolutionMutation.mutate({ title, problem_description, occurrence_location, possible_solutions, chosen_solution, outcome, tags, createdAt })} />
    </div>
  );
}