'use client';
import React, { useEffect, useRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Utility for tailwind classes */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface WordInputProps {
  value: string;
  onChange: (val: string) => void;
  onConfirm: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function WordInput({ value, onChange, onConfirm, disabled, placeholder = 'הקלד כאן...' }: WordInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      <input
        ref={inputRef}
        type="text"
        dir="rtl"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onConfirm();
        }}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          "w-full px-6 py-4 text-3xl text-center font-bold rounded-2xl border-4 transition-all outline-none",
          "focus:ring-4 ring-blue-300",
          disabled ? "bg-gray-100 border-gray-300 opacity-50" : "bg-white border-blue-500 shadow-lg"
        )}
      />
      <button
        onClick={onConfirm}
        disabled={disabled}
        className="px-8 py-3 bg-blue-600 text-white text-xl font-bold rounded-full hover:bg-blue-700 transition-transform active:scale-95 disabled:bg-gray-400 shadow-md"
      >
        בדיקה ✓
      </button>
    </div>
  );
}

interface FeedbackOverlayProps {
  status: 'correct' | 'incorrect' | null;
  correctWord: string;
  onClose: () => void;
}

export function FeedbackOverlay({ status, correctWord, onClose }: FeedbackOverlayProps) {
  if (!status) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-in fade-in duration-200">
      <div className={cn(
        "bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full mx-4 animate-in zoom-in-95 duration-300",
        status === 'correct' ? "border-t-8 border-green-500" : "border-t-8 border-red-500"
      )}>
        <div className="text-6xl mb-4">
          {status === 'correct' ? '🌟' : '❌'}
        </div>
        <h2 className={cn(
          "text-3xl font-bold mb-2",
          status === 'correct' ? "text-green-600" : "text-red-600"
        )}>
          {status === 'correct' ? 'כל הכבוד!' : 'טעות קטנה'}
        </h2>
        
        {status === 'incorrect' && (
          <div className="mt-4 p-4 bg-gray-100 rounded-xl">
            <p className="text-gray-600 mb-1">המילה הנכונה היא:</p>
            <p className="text-2xl font-bold text-gray-800" dir="rtl">{correctWord}</p>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-colors"
        >
          המשך לשאלה הבאה
        </button>
      </div>
    </div>
  );
}
