'use client';
import React, { useState } from 'react';
import { GameEngine } from '@/components/game/engine';
import { Leaderboard } from '@/components/game/leaderboard';
import { Word } from '@/types';
import seedWords from '@/data/seed_words.json';

export default function Home() {
  const [gameMode, setGameMode] = useState<'menu' | 'practice' | 'timed' | 'survival' | 'leaderboard'>('menu');
  const [score, setScore] = useState(0);

  const handleGameOver = (finalScore: number) => {
    setScore(finalScore);
    setGameMode('menu');
    // Here you would typically call supabase.from('scores').insert(...)
  };

  return (
    <main className="min-h-screen bg-blue-50 text-gray-900 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header */}
        <header className="flex flex-col items-center text-center mb-12 animate-in slide-in-from-top duration-700">
          <h1 className="text-6xl font-black text-blue-600 mb-2 tracking-tight">
            מלך ההכתבה 👑
          </h1>
          <p className="text-xl text-gray-500 font-medium">שכלל את הכתיב שלך והיה אלוף!</p>
        </header>

        {gameMode === 'menu' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto animate-in fade-in zoom-in duration-300">
            <MenuButton 
              title="תרגול חופשי" 
              description="התאמן בלי לחץ ובלי הגבלה" 
              icon="✍️" 
              color="bg-green-500" 
              onClick={() => setGameMode('practice')} 
            />
            <MenuButton 
              title="אתגר זמן" 
              description="כמה מילים תצליח לכתוב בדקה?" 
              icon="⏱️" 
              color="bg-blue-500" 
              onClick={() => setGameMode('timed')} 
            />
            <MenuButton 
              title="מצב הישרדות" 
              description="שמור על החיים שלך וכתוב נכון!" 
              icon="❤️" 
              color="bg-red-500" 
              onClick={() => setGameMode('survival')} 
            />
            <MenuButton 
              title="לוח תוצאות" 
              description="מי הכי טוב במחלקה?" 
              icon="🏆" 
              color="bg-yellow-500" 
              onClick={() => setGameMode('leaderboard')} 
            />
          </div>
        )}

        {(gameMode === 'practice' || gameMode === 'timed' || gameMode === 'survival') && (
          <GameEngine 
            initialWords={seedWords} 
            mode={gameMode as any} 
            onGameOver={handleGameOver} 
            onQuit={() => setGameMode('menu')}
          />
        )}

        {gameMode === 'leaderboard' && (
          <div className="flex flex-col items-center gap-8">
            <Leaderboard scores={[]} title="האלופים של השבוע" />
            <button 
              onClick={() => setGameMode('menu')}
              className="px-8 py-3 bg-gray-800 text-white font-bold rounded-2xl hover:bg-gray-700 transition-all"
            >
              חזור לתפריט
            </button>
          </div>
        )}

      </div>
    </main>
  );
}

function MenuButton({ title, description, icon, color, onClick }: { 
  title: string, description: string, icon: string, color: string, onClick: () => void 
}) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center p-6 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 group text-right"
    >
      <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4", color)}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </button>
  );
}

// Helper for Tailwind classes in MenuButton since I haven't imported cn here
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
