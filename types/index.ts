export type UserProfile = {
  id: string;
  nickname: string;
  xp: number;
  level: number;
  avatar_color: string;
};

export type Word = {
  id: string;
  text_with_niqqud: string;
  text_plain: string;
  category: string;
  difficulty: number;
  audio_url: string | null;
  sentence: string | null;
};

export type GameState = {
  currentWordIndex: number;
  score: number;
  streak: number;
  lives: number;
  gameState: 'idle' | 'playing' | 'feedback' | 'gameOver';
  incorrectWordIds: string[];
};

export type ScoreEntry = {
  id: string;
  user_id: string;
  score: number;
  mode: 'practice' | 'timed' | 'survival';
  created_at: string;
};
