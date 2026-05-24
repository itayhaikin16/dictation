import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types';

export async function getOrCreateProfile(nickname: string): Promise<{ data: UserProfile | null, error: any }> {
  // 1. Try to find profile by nickname
  const { data: existingProfile, error: searchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('nickname', nickname)
    .single();

  if (existingProfile) {
    return { data: existingProfile, error: null };
  }

  // 2. If not found, create a new profile
  // Note: Since we aren't using auth.users for this simple version, 
  // we might need to adjust the schema or use a random UUID.
  // For the sake of this implementation, we'll assume a 'profiles' table 
  // where ID is just a UUID.
  
  const { data: newProfile, error: createError } = await supabase
    .from('profiles')
    .insert({ nickname })
    .select()
    .single();

  return { data: newProfile, error: createError };
}

export async function saveScore(userId: string, score: number, mode: string) {
  const { error } = await supabase
    .from('scores')
    .insert({ 
      user_id: userId, 
      score: score, 
      mode: mode 
    });
  
  return { error };
}

export async function fetchLeaderboard() {
  const { data, error } = await supabase
    .from('scores')
    .select(`
      score,
      mode,
      profiles (
        nickname
      )
    `)
    .order('score', { ascending: false })
    .limit(200);

  if (error) throw error;
  
  return data.map((item: any) => ({
    id: item.id,
    score: item.score,
    mode: item.mode,
    user_id: item.profiles?.nickname || 'Unknown'
  }));
}
