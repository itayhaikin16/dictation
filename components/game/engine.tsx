'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Word, GameState } from '@/types';
import { validateWord } from '@/lib/hebrew';
import { WordInput, FeedbackOverlay } from './core';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface GameEngineProps {
  initialWords: Word[];
  mode: 'practice' | 'timed' | 'survival';
  onGameOver: (finalScore: number) => void;
  onQuit: () => void;
}

export function GameEngine({ initialWords, mode, onGameOver, onQuit }: GameEngineProps) {
  const [words] = useState(() => {
    // Shuffle and take a random sample of 50 words
    const shuffled = [...initialWords].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 50);
  });
  const [state, setState] = useState<GameState>({
    currentWordIndex: 0,
    score: 0,
    streak: 0,
    lives: 3,
    gameState: 'playing',
    incorrectWordIds: [],
  });
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [timeLeft, setTimeLeft] = useState(mode === 'timed' ? 60 : 0);

  const currentWord = words[state.currentWordIndex];

  // Audio Playback
  const playWordAudio = useCallback(async () => {
    if (currentWord?.audio_url) {
      const audio = new Audio(currentWord.audio_url);
      audio.play().catch(e => console.error("Audio playback failed:", e));
    } else {
      // Fallback to Browser TTS
      // We use text_plain instead of text_with_niqqud because most TTS engines 
      // struggle with diacritics/niqqud and may remain silent or mispronounce.
      const utterance = new SpeechSynthesisUtterance(currentWord?.text_plain || '');
      utterance.lang = 'he-IL';
      utterance.rate = 0.8; // Slightly slower for clear dictation
      window.speechSynthesis.speak(utterance);
    }
  }, [currentWord]);

  // Initial audio play
  useEffect(() => {
    if (state.gameState === 'playing') {
      playWordAudio();
    }
  }, [state.currentWordIndex, state.gameState, playWordAudio]);

  // Timer for timed mode
  useEffect(() => {
    if (mode === 'timed' && state.gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (mode === 'timed' && timeLeft === 0) {
      setState(s => ({ ...s, gameState: 'gameOver' }));
    }
  }, [mode, state.gameState, timeLeft]);

  const handleConfirm = () => {
    if (!currentWord) return;

    const isCorrect = validateWord(userInput, currentWord.text_plain);
    
    if (isCorrect) {
      setFeedback('correct');
      setState(prev => ({
        ...prev,
        score: prev.score + (10 * (prev.streak + 1)),
        streak: prev.streak + 1,
      }));
    } else {
      setFeedback('incorrect');
      setState(prev => ({
        ...prev,
        streak: 0,
        lives: mode === 'survival' ? prev.lives - 1 : prev.lives,
        incorrectWordIds: [...prev.incorrectWordIds, currentWord.id],
      }));
      if (mode === 'survival' && state.lives <= 1) {
        // Game over logic will be handled after feedback
      }
    }
  };

  const nextWord = () => {
    setFeedback(null);
    setUserInput('');
    
    setState(prev => {
      const nextIndex = prev.currentWordIndex + 1;
      if (nextIndex >= words.length) {
        // Shuffle or loop for practice mode
        if (mode === 'practice') {
          return { ...prev, currentWordIndex: 0 };
        } else {
          return { ...prev, gameState: 'gameOver' };
        }
      }
      
      // Survival mode game over check
      if (mode === 'survival' && prev.lives <= 0) {
        return { ...prev, gameState: 'gameOver' };
      }

      return { ...prev, currentWordIndex: nextIndex };
    });
  };

  if (state.gameState === 'gameOver') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
        <h2 className="text-5xl font-black text-gray-800 mb-4">המשחק נגמר!</h2>
        <p className="text-2xl text-gray-600 mb-8">הניקוד שלך: <span className="font-bold text-blue-600">{state.score}</span></p>
        <button 
          onClick={() => onGameOver(state.score)}
          className="px-10 py-4 bg-blue-600 text-white text-2xl font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl"
        >
          חזור לתפריט
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto p-4" dir="rtl">
      {/* Header / Stats */}
      <div className="w-full flex justify-between items-center px-4 py-2 bg-white rounded-2xl shadow-sm border border-gray-100">
        <button 
          onClick={onQuit}
          className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors font-bold"
        >
          <span>✕</span>
          <span className="text-sm">יציאה</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400 font-bold uppercase">ניקוד</span>
            <span className="text-xl font-black text-blue-600">{state.score}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400 font-bold uppercase">סטריק</span>
            <span className="text-xl font-black text-orange-500">🔥 {state.streak}</span>
          </div>
        </div>

        {mode === 'timed' && (
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400 font-bold uppercase">זמן נותר</span>
            <span className={cn(
              "text-xl font-black", 
              timeLeft < 10 ? "text-red-500 animate-pulse" : "text-gray-700"
            )}>{timeLeft}ש</span>
          </div>
        )}

        {mode === 'survival' && (
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400 font-bold uppercase">חיים</span>
            <span className="text-xl font-black text-red-500">❤️ {state.lives}</span>
          </div>
        )}
      </div>

      {/* Word Interaction Area */}
      <div className="flex flex-col items-center gap-8 w-full">
        <div className="flex items-center gap-4">
          <button 
            onClick={playWordAudio}
            className="w-20 h-20 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-all active:scale-90 shadow-inner text-4xl"
          >
            🔊
          </button>
          <div className="text-right">
            <p className="text-sm text-gray-400 font-medium">הקשב למילה והקלד אותה</p>
          </div>
        </div>

        <WordInput 
          value={userInput} 
          onChange={setUserInput} 
          onConfirm={handleConfirm} 
          disabled={!!feedback}
        />
      </div>

      <FeedbackOverlay 
        status={feedback} 
        correctWord={currentWord?.text_plain || ''} 
        onClose={nextWord} 
      />
    </div>
  );
}
