'use client';
import React, { useState, useEffect } from 'react';
import { ScoreEntry } from '@/types';
import { cn } from '@/lib/utils';
import { fetchLeaderboard } from '@/lib/supabase-service';

export function Leaderboard() {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadScores() {
      try {
        const data = await fetchLeaderboard();
        setScores(data);
      } catch (e) {
        console.error("Failed to fetch leaderboard", e);
      } finally {
        setLoading(false);
      }
    }
    loadScores();
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-3xl shadow-xl border border-gray-100" dir="rtl">
      <h2 className="text-3xl font-black text-center text-gray-800 mb-8">האלופים של השבוע</h2>
      
      {loading ? (
        <div className="text-center py-10 text-gray-400">טוען נתונים...</div>
      ) : (
        <div className="space-y-3">
          {scores.length === 0 ? (
            <p className="text-center text-gray-400 py-10">עדיין אין נתונים בלוח התוצאות</p>
          ) : (
            scores.map((score, index) => (
              <div 
                key={score.id} 
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl transition-all",
                  index === 0 ? "bg-yellow-50 border-2 border-yellow-200" : "bg-gray-50 border border-transparent"
                )}
              >
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-full font-bold",
                    index === 0 ? "bg-yellow-400 text-white" : "bg-gray-300 text-gray-600"
                  )}>
                    {index + 1}
                  </span>
                  <span className="font-bold text-gray-700 text-lg">{score.user_id}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-blue-600 font-black text-xl">{score.score}</span>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-bold uppercase">
                    {score.mode}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
