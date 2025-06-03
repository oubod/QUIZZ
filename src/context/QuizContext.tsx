import React, { createContext, useState, useContext, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from './AuthContext';

// Types
interface Question {
  id: string;
  category: string;
  level: string;
  text: string;
  choices: string[];
  correctAnswer: number;
  explanation: string;
  createdBy: string;
  isAIGenerated: boolean;
}

interface GameState {
  mode: 'solo' | 'multi' | 'daily';
  category: string | null;
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  timer: any;
  timeLeft: number;
  answered: boolean;
}

interface QuizContextType {
  categories: string[];
  gameState: GameState | null;
  startGame: (mode: 'solo' | 'multi' | 'daily', category?: string) => Promise<void>;
  answerQuestion: (choiceIndex: number) => void;
  nextQuestion: () => void;
  endGame: () => void;
  generateAIQuestions: (category: string, count: number) => Promise<Question[]>;
}

// Create context
const QuizContext = createContext<QuizContextType | undefined>(undefined);

// Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<string[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('name');
      
      if (data && !error) {
        setCategories(data.map(cat => cat.name));
      }
    };

    fetchCategories();
  }, []);

  const startGame = async (mode: 'solo' | 'multi' | 'daily', category?: string) => {
    // Fetch questions based on mode and category
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .eq(category ? 'category' : 'id', category || '*')
      .limit(mode === 'daily' ? 5 : 10);

    if (error || !questions) {
      console.error('Error fetching questions:', error);
      return;
    }

    // Shuffle questions
    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);

    setGameState({
      mode,
      category: category || null,
      questions: shuffledQuestions,
      currentQuestionIndex: 0,
      score: 0,
      timer: null,
      timeLeft: 10,
      answered: false
    });

    // Start timer
    startTimer();
  };

  const startTimer = () => {
    if (gameState) {
      // Clear existing timer if any
      if (gameState.timer) {
        clearInterval(gameState.timer);
      }

      // Set up new timer
      const timer = setInterval(() => {
        setGameState(prev => {
          if (!prev) return null;
          
          const newTimeLeft = prev.timeLeft - 1;
          
          if (newTimeLeft <= 0) {
            clearInterval(timer);
            return {
              ...prev,
              timeLeft: 0,
              answered: true
            };
          }
          
          return {
            ...prev,
            timeLeft: newTimeLeft
          };
        });
      }, 1000);

      setGameState(prev => prev ? { ...prev, timer, timeLeft: 10 } : null);
    }
  };

  const answerQuestion = (choiceIndex: number) => {
    if (!gameState || gameState.answered) return;

    // Clear timer
    if (gameState.timer) {
      clearInterval(gameState.timer);
    }

    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    const isCorrect = choiceIndex === currentQuestion.correctAnswer;
    
    // Calculate points based on time left
    const points = isCorrect ? Math.round((gameState.timeLeft / 10) * 100) + 50 : 0;

    setGameState({
      ...gameState,
      score: gameState.score + points,
      answered: true,
      timeLeft: gameState.timeLeft
    });

    // Save answer in database for stats
    if (user) {
      supabase.from('user_answers').insert({
        user_id: user.id,
        question_id: currentQuestion.id,
        is_correct: isCorrect,
        time_taken: 10 - gameState.timeLeft,
        points_earned: points,
        game_mode: gameState.mode
      });
    }
  };

  const nextQuestion = () => {
    if (!gameState) return;

    const nextIndex = gameState.currentQuestionIndex + 1;
    
    if (nextIndex < gameState.questions.length) {
      setGameState({
        ...gameState,
        currentQuestionIndex: nextIndex,
        answered: false
      });
      startTimer();
    } else {
      // Game completed
      endGame();
    }
  };

  const endGame = () => {
    if (!gameState || !user) return;
    
    // Save game results
    supabase.from('games').insert({
      user_id: user.id,
      mode: gameState.mode,
      category: gameState.category,
      score: gameState.score,
      questions_answered: gameState.questions.length,
      completed: true
    });

    // Update user XP
    supabase.from('users')
      .update({ xp: user.xp + gameState.score })
      .eq('id', user.id);

    // Clear game state
    setGameState(null);
  };

  const generateAIQuestions = async (category: string, count: number): Promise<Question[]> => {
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category, count }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }
      
      const generatedQuestions = await response.json();
      
      // Save AI-generated questions to database
      if (user) {
        const { error } = await supabase
          .from('questions')
          .insert(generatedQuestions.map((q: Question) => ({
            ...q,
            createdBy: user.id,
            isAIGenerated: true
          })));
          
        if (error) {
          console.error('Error saving AI questions:', error);
        }
      }
      
      return generatedQuestions;
    } catch (error) {
      console.error('Error generating AI questions:', error);
      return [];
    }
  };

  return (
    <QuizContext.Provider value={{ 
      categories, 
      gameState, 
      startGame, 
      answerQuestion, 
      nextQuestion, 
      endGame,
      generateAIQuestions
    }}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};