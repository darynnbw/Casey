import { Project, Entry, Decision, JournalEntry, ProblemSolution } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { showSuccess, showError } from "@/utils/toast";
import LoadingSpinner from "./LoadingSpinner";
import { AddNoteDialog } from "./AddNoteDialog";
import { AddScreenshotDialog } from "./AddScreenshotDialog";
import { AddDecisionWizardDialog } from "./AddDecisionWizardDialog";
import { AddJournalEntryDialog } from "./AddJournalEntryDialog";
import { AddProblemSolutionDialog } from "./AddProblemSolutionDialog";
import { AddActionsDropdown } from "./AddActionsDropdown";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { Trash2, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState, Fragment } from "react"; // Import Fragment
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Removed Tabs
import { NoteCard } from "./NoteCard";
import { ScreenshotCard } from "./ScreenshotCard";
import { DecisionCard } from "./DecisionCard"; // Fixed import syntax
import { JournalEntryCard } from "./JournalEntryCard";
import { ProblemSolutionCard } from "./ProblemSolutionCard";
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

// Import new edit dialogs
import { EditNoteDialog } from "./EditNoteDialog";
import { EditScreenshotDialog } from "./EditScreenshotDialog";
import { EditDecisionWizardDialog } from "./EditDecisionWizardDialog";
import { EditJournalEntryDialog } from "./EditJournalEntryDialog";
import { EditProblemSolutionDialog } from "./EditProblemSolutionDialog";

interface ProjectDetailProps {
  project: Project;
}

type FilterType = 'tag' | 'location' | 'mood' | 'occurrence_location' | 'type'; // Added 'type' for filtering

const groupEntriesByDate = <T extends { created_at: string }>(entries: T[]) => {
  // Sort entries by created_at in descending order before grouping
  const sortedEntries = [...entries].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return sortedEntries.reduce((acc, entry) => {
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

// Motivational messages for empty state
const emptyStateMessages = [
  "Your project timeline is ready! Start by adding your first note, screenshot, decision, or journal entry.",
  "Every great project starts with a single step. Let's build something amazing!",
  "Your ideas are waiting to be brought to life. Add your first piece of content now!",
  "The best way to predict the future is to create it. Begin documenting your case study!",
  "Unleash your creativity. Your next breakthrough insight is just a click away!",
  "Transform your vision into reality. Start adding content to your project today!",
  "Great things never came from comfort zones. Add a new entry and explore!",
  "The journey of a thousand miles begins with a single step. Your project journey starts here!",
  "Don't wait for inspiration. Be the inspiration. Add new content to your project!",
  "The only way to do great work is to love what you do. Start documenting what you're passionate about!",
];

const getRandomMessage = (messages: string[]) => {
  return messages[Math.floor(Math.random() * messages.length)];
};

export function ProjectDetail({ project }: ProjectDetailProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<{ type: FilterType, value: string } | null>(null);
  const [randomEmptyMessage] = useState(getRandomMessage(emptyStateMessages)); // Pick one message on component mount

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

      const { data: { publicUrl } = { publicUrl: '' } } = supabase.storage.from("project_files").getPublicUrl(filePath);

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
        const { data: { publicUrl } = { publicUrl: '' } } = supabase.storage.from("project_files").getPublicUrl(filePath);
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
    mutationFn: async (decisionData: Omit<Decision, 'project_id' | 'user_id'>) => {
      if (!session) throw new Error("User not authenticated");
      const { id, created_at, ...rest } = decisionData;
      const { data, error } = await supabase
        .from("decisions")
        .update({ ...rest, created_at: created_at })
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
    mutationFn: async (journalEntryData: Omit<JournalEntry, 'project_id' | 'user_id'>) => {
      if (!session) throw new Error("User not authenticated");
      const { id, created_at, ...rest } = journalEntryData;
      const { data, error } = await supabase
        .from("journal_entries")
        .update({ ...rest, created_at: created_at })
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
    mutationFn: async (problemSolutionData: Omit<ProblemSolution, 'project_id' | 'user_id'>) => {
      if (!session) throw new Error("User not authenticated");
      const { id, created_at, ...rest } = problemSolutionData;
      const { data, error } = await supabase
        .from("problem_solutions")
        .update({ ...rest, created_at: created_at })
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

  // Combine all entries for filtering and display
  const allCombinedEntries = [
    ...(entries || []).map(e => ({ ...e, filterType: e.type as FilterType })),
    ...(decisions || []).map(d => ({ ...d, type: 'decision', content: d.title, filterType: 'type' as FilterType, tags: d.tags || [] })),
    ...(journalEntries || []).map(j => ({ ...j, type: 'journal', content: j.content, filterType: 'type' as FilterType, tags: j.tags || [], mood: j.mood || '' })),
    ...(problemSolutions || []).map(p => ({ ...p, type: 'problem_solution', content: p.title, filterType: 'type' as FilterType, tags: p.tags || [], occurrence_location: p.occurrence_location || '' }))
  ];

  const handlePillClick = (type: FilterType, value: string) => {
    if (activeFilter?.type === type && activeFilter?.value === value) {
      setActiveFilter(null); // Deselect if already active
    } else {
      setActiveFilter({ type, value });
    }
  };

  const getFilteredAndGroupedEntries = (entriesToFilter: any[]) => {
    let filtered = entriesToFilter;

    if (activeFilter) {
      filtered = filtered.filter(entry => {
        if (activeFilter.type === 'tag' && entry.tags?.includes(activeFilter.value)) return true;
        if (activeFilter.type === 'location' && (entry as Entry).location === activeFilter.value) return true;
        if (activeFilter.type === 'mood' && (entry as JournalEntry).mood === activeFilter.value) return true;
        if (activeFilter.type === 'occurrence_location' && (entry as ProblemSolution).occurrence_location === activeFilter.value) return true;
        if (activeFilter.type === 'type' && entry.type === activeFilter.value) return true; // Filter by type
        return false;
      });
    }
    return groupEntriesByDate(filtered);
  };

  const groupedFilteredEntries = getFilteredAndGroupedEntries(allCombinedEntries);

  // Collect all unique filter values for display
  const allUniqueTags = Array.from(new Set(allCombinedEntries.flatMap(entry => entry.tags || []).filter(tag => tag !== '')));
  const allUniqueLocations = Array.from(new Set(allCombinedEntries.filter(e => (e as Entry).location).map(e => (e as Entry).location!)));
  const allUniqueMoods = Array.from(new Set(allCombinedEntries.filter(e => (e as JournalEntry).mood).map(e => (e as JournalEntry).mood!)));
  const allUniqueOccurrenceLocations = Array.from(new Set(allCombinedEntries.filter(e => (e as ProblemSolution).occurrence_location).map(e => (e as ProblemSolution).occurrence_location!)));
  const allUniqueTypes = Array.from(new Set(allCombinedEntries.map(entry => entry.type))).sort(); // Sort types alphabetically

  const renderFilterPills = () => {
    const typePills: { type: FilterType, value: string }[] = [];
    allUniqueTypes.forEach(type => typePills.push({ type: 'type', value: type }));

    const otherPills: { type: FilterType, value: string }[] = [];
    allUniqueTags.forEach(tag => otherPills.push({ type: 'tag', value: tag }));
    allUniqueLocations.forEach(loc => otherPills.push({ type: 'location', value: loc }));
    allUniqueMoods.forEach(mood => otherPills.push({ type: 'mood', value: mood }));
    allUniqueOccurrenceLocations.forEach(occLoc => otherPills.push({ type: 'occurrence_location', value: occLoc }));

    return (
      <div className="mb-8">
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge
            variant={activeFilter === null ? "default" : "outline"}
            className={cn("cursor-pointer rounded-full px-3 py-1 text-sm transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", activeFilter === null && "bg-primary text-primary-foreground hover:bg-primary/90")}
            onClick={() => setActiveFilter(null)}
          >
            All Content
          </Badge>
          {typePills.map((pill, index) => (
            <Badge
              key={`${pill.type}-${pill.value}-${index}`}
              variant={activeFilter?.type === pill.type && activeFilter?.value === pill.value ? "default" : "outline"}
              className={cn(
                "cursor-pointer rounded-full px-3 py-1 text-sm transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                activeFilter?.type === pill.type && activeFilter?.value === pill.value && "bg-primary text-primary-foreground hover:bg-primary/90",
                "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800 hover:bg-blue-200/50 dark:hover:bg-blue-900/50"
              )}
              onClick={() => handlePillClick(pill.type, pill.value)}
            >
              {pill.value.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
            </Badge>
          ))}
        </div>
        {otherPills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {otherPills.map((pill, index) => (
              <Badge
                key={`${pill.type}-${pill.value}-${index}`}
                variant={activeFilter?.type === pill.type && activeFilter?.value === pill.value ? "default" : "outline"}
                className={cn(
                  "cursor-pointer rounded-full px-3 py-1 text-sm transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  activeFilter?.type === pill.type && activeFilter?.value === pill.value && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
                onClick={() => handlePillClick(pill.type, pill.value)}
              >
                {pill.value}
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  };

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
        {renderFilterPills()}

        {Object.keys(groupedFilteredEntries).length === 0 ? (
          <div className="text-center text-muted-foreground mt-12 p-8 border border-dashed border-border rounded-xl bg-muted/20">
            <p className="text-xl font-semibold text-foreground mb-2">No Content Yet!</p>
            <p className="text-lg text-muted-foreground">{randomEmptyMessage}</p>
            <p className="text-md mt-4">Click the "Add" button to get started.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupedFilteredEntries).map(([date, entriesOnDate]) => (
              <div key={date}>
                <h3 className="text-xl font-semibold mb-6 pb-2 border-b border-border/50">{date}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {entriesOnDate.map((item, index) => {
                    switch (item.type) {
                      case 'note':
                        return (
                          <AlertDialog key={item.id}>
                            <NoteCard note={item as Entry} onDelete={() => deleteEntryMutation.mutate(item as Entry)} onEdit={(note) => { setEditingNote(note); setIsEditNoteDialogOpen(true); }} onPillClick={handlePillClick} index={index} />
                            <AlertDialogContent className="rounded-xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete this note.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteEntryMutation.mutate(item as Entry)} className="rounded-lg">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        );
                      case 'screenshot':
                        return (
                          <AlertDialog key={item.id}>
                            <ScreenshotCard screenshot={item as Entry} onDelete={() => deleteEntryMutation.mutate(item as Entry)} onEdit={(screenshot) => { setEditingScreenshot(screenshot); setIsEditScreenshotDialogOpen(true); }} onPillClick={handlePillClick} index={index} />
                            <AlertDialogContent className="rounded-xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete this screenshot.
                                </AlertDialogDescription>
                              </AlertDialogHeader> {/* Corrected closing tag */}
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteEntryMutation.mutate(item as Entry)} className="rounded-lg">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        );
                      case 'decision':
                        return (
                          <AlertDialog key={item.id}>
                            <DecisionCard decision={item as Decision} onDelete={() => deleteDecisionMutation.mutate(item.id)} onEdit={(decision) => { setEditingDecision(decision); setIsEditDecisionWizardOpen(true); }} onPillClick={handlePillClick} index={index} />
                            <AlertDialogContent className="rounded-xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete this decision.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteDecisionMutation.mutate(item.id)} className="rounded-lg">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        );
                      case 'journal':
                        return (
                          <AlertDialog key={item.id}>
                            <JournalEntryCard journalEntry={item as JournalEntry} onDelete={() => deleteJournalEntryMutation.mutate(item.id)} onEdit={(journalEntry) => { setEditingJournalEntry(journalEntry); setIsEditJournalEntryDialogOpen(true); }} onPillClick={handlePillClick} index={index} />
                            <AlertDialogContent className="rounded-xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete this journal entry.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteJournalEntryMutation.mutate(item.id)} className="rounded-lg">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        );
                      case 'problem_solution':
                        return (
                          <AlertDialog key={item.id}>
                            <ProblemSolutionCard problemSolution={item as ProblemSolution} onDelete={() => deleteProblemSolutionMutation.mutate(item.id)} onEdit={(problemSolution) => { setEditingProblemSolution(problemSolution); setIsEditProblemSolutionDialogOpen(true); }} onPillClick={handlePillClick} index={index} />
                            <AlertDialogContent className="rounded-xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete this problem/solution entry.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteProblemSolutionMutation.mutate(item.id)} className="rounded-lg">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        );
                      default:
                        return null;
                    }
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Add Dialogs */}
      <Fragment> {/* Wrap multiple top-level JSX elements */}
        <AddNoteDialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen} onAddNote={(content, tags, location, createdAt) => addNoteMutation.mutate({ content, tags, location, createdAt })} />
        <AddScreenshotDialog open={isScreenshotDialogOpen} onOpenChange={setIsScreenshotDialogOpen} onAddScreenshot={(file, caption, tags, location, createdAt) => addScreenshotMutation.mutate({ file, caption, tags, location, createdAt })} />
        <AddDecisionWizardDialog open={isDecisionWizardOpen} onOpenChange={setIsDecisionWizardOpen} onAddDecision={(title, summary, context, alternatives, createdAt) => addDecisionMutation.mutate({ title, summary, context, alternatives, createdAt })} />
        <AddJournalEntryDialog open={isJournalEntryDialogOpen} onOpenChange={setIsJournalEntryDialogOpen} onAddJournalEntry={(content, mood, tags, createdAt) => addJournalEntryMutation.mutate({ content, mood, tags, createdAt })} />
        <AddProblemSolutionDialog open={isProblemSolutionDialogOpen} onOpenChange={setIsProblemSolutionDialogOpen} onAddProblemSolution={(title, problem_description, occurrence_location, solution, tags, createdAt) => addProblemSolutionMutation.mutate({ title, problem_description, occurrence_location, solution, tags, createdAt })} />
        
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
            onUpdateDecision={(id, title, summary, context, alternatives, rationale, tags, created_at) => updateDecisionMutation.mutate({ id, title, summary, context, alternatives, rationale, tags, created_at: created_at })} 
          />
        )}
        {editingJournalEntry && (
          <EditJournalEntryDialog 
            open={isEditJournalEntryDialogOpen} 
            onOpenChange={setIsEditJournalEntryDialogOpen} 
            initialData={editingJournalEntry} 
            onUpdateJournalEntry={(id, content, mood, tags, created_at) => updateJournalEntryMutation.mutate({ id, content, mood, tags, created_at: created_at })} 
          />
        )}
        {editingProblemSolution && (
          <EditProblemSolutionDialog 
            open={isEditProblemSolutionDialogOpen} 
            onOpenChange={setIsEditProblemSolutionDialogOpen} 
            initialData={editingProblemSolution} 
            onUpdateProblemSolution={(id, title, problem_description, occurrence_location, solution, tags, created_at) => updateProblemSolutionMutation.mutate({ id, title, problem_description, occurrence_location, solution, tags, created_at: created_at })} 
          />
        )}
      </Fragment>
    </div>
  );
}