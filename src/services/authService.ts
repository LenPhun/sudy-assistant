import { supabase } from '../lib/supabase';

export const authService = {
  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: email,
          full_name: fullName,
          free_hours_per_day: 4,
        });

      if (profileError) throw profileError;

      const { error: preferencesError } = await supabase
        .from('user_preferences')
        .insert({
          user_id: data.user.id,
        });

      if (preferencesError) throw preferencesError;
    }

    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  onAuthStateChange(callback: (user: any) => void) {
    supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        callback(session?.user || null);
      })();
    });
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
};
