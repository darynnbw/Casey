export interface Project {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export interface Entry {
  id: string;
  project_id: string;
  user_id: string;
  type: 'note' | 'screenshot' | 'decision' | 'journal' | 'problem_solution'; // Added new types
  content?: string;
  file_url?: string;
  created_at: string;
  tags?: string[];
  location?: string;
}

export interface Decision {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  summary?: string;
  context?: string;
  alternatives?: string;
  rationale?: string;
  tags?: string[];
  created_at: string;
}

export interface JournalEntry {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  mood?: string;
  tags?: string[];
  created_at: string;
}

export interface ProblemSolution {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  problem_description?: string;
  occurrence_location?: string;
  possible_solutions?: string;
  chosen_solution?: string;
  outcome?: string;
  tags?: string[];
  created_at: string;
}