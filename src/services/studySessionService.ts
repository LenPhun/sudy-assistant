import { supabase, StudySession } from '../lib/supabase';

export const studySessionService = {
  async getStudySessions(userId: string, startDate?: string, endDate?: string): Promise<StudySession[]> {
    let query = supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('session_date', startDate);
    }
    if (endDate) {
      query = query.lte('session_date', endDate);
    }

    const { data, error } = await query.order('session_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createStudySession(session: Omit<StudySession, 'id' | 'created_at' | 'updated_at'>): Promise<StudySession> {
    const { data, error } = await supabase
      .from('study_sessions')
      .insert(session)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createMultipleSessions(sessions: Omit<StudySession, 'id' | 'created_at' | 'updated_at'>[]): Promise<StudySession[]> {
    const { data, error } = await supabase
      .from('study_sessions')
      .insert(sessions)
      .select();

    if (error) throw error;
    return data || [];
  },

  async updateStudySession(id: string, updates: Partial<StudySession>): Promise<StudySession> {
    const { data, error } = await supabase
      .from('study_sessions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteStudySession(id: string): Promise<void> {
    const { error } = await supabase
      .from('study_sessions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async deleteAllSessionsForSubject(subjectId: string): Promise<void> {
    const { error } = await supabase
      .from('study_sessions')
      .delete()
      .eq('subject_id', subjectId);

    if (error) throw error;
  },
};
