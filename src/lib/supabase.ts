import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  student_id: string | null;
  free_hours_per_day: number;
  created_at: string;
  updated_at: string;
};

export type Subject = {
  id: string;
  user_id: string;
  name: string;
  exam_date: string;
  difficulty_level: number;
  chapters_count: number;
  study_days_per_week: number;
  color: string;
  created_at: string;
  updated_at: string;
};

export type StudySession = {
  id: string;
  user_id: string;
  subject_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  chapter_topic: string;
  is_completed: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type UserPreferences = {
  id: string;
  user_id: string;
  available_days: number[];
  preferred_start_time: string;
  preferred_end_time: string;
  session_duration_minutes: number;
  break_duration_minutes: number;
  created_at: string;
  updated_at: string;
};

export type Reminder = {
  id: string;
  user_id: string;
  study_session_id: string | null;
  reminder_time: string;
  reminder_type: 'session' | 'exam_warning';
  is_sent: boolean;
  created_at: string;
};
