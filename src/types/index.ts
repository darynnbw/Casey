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
  type: 'note' | 'screenshot';
  content?: string;
  file_url?: string;
  created_at: string;
}