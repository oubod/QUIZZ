import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuiz } from '../../context/QuizContext';
import { Lightbulb, ArrowLeft, ArrowRight } from 'lucide-react';

const Game: React.FC = () => {
  const { category } = useParams<{ category?: string }>();
  const { gameState, startGame, answerQuestion, nextQuestion, endGame } = useQuiz();
  const navigate = useNavigate();
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [fadeIn, setFadeIn] = useState(true);
  
  useEffect(() => {
    if (!gameState) {
      const initializeGame = async () => {
        await startGame('solo', category !== 'all' ? category : undefined);
      };
      
      initializeGame();
    }
  }, [gameState, startGame, category]);

  useEffect(() => {
    // Reset fade-in animation when question changes
    if (gameState && !showExplanation) {
      setFadeIn(true);
      setTimeout(() => setFadeIn(false), 500);
    }
  }, [gameState?.currentQuestionIndex, showExplanation]);

  const handleSelectAnswer = (index: number) => {
    if (!gameState || gameState.answered) return;
    
    setSelectedAnswer(index);
    answerQuestion(index);
    
    // Show explanation after a short delay
    setTimeout(() => {
      setShowExplanation(true);
    }, 1000);
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
    setSelectedAnswer(null);
    nextQuestion();
  };

  const handleEndGame = () => {
    endGame();
    navigate('/');
  };

  if (!gameState) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
        <p className="mt-4 text-gray-400">Chargement du quiz...</p>
      </div>
    );
  }

  const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
  const isLastQuestion = gameState.currentQuestionIndex === gameState.questions.length - 1;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Score and Timer */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-lg">
          <span className="font-bold">Score:</span>
          <span className="ml-2">{gameState.score} pts</span>
        </div>
        <div className="text-lg flex items-center">
          <span className="font-bold mr-2">Question:</span>
          <span>{gameState.currentQuestionIndex + 1}/{gameState.questions.length}</span>
        </div>
        <div className="text-lg flex items-center">
          <span className="font-bold mr-2">Temps:</span>
          <div className="w-20 h-6 rounded-full bg-gray-800 overflow-hidden">
            <div 
              className="h-full bg-primary-600 transition-all duration-1000" 
              style={{ width: `${(gameState.timeLeft / 10) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Question Card */}
      {!showExplanation ? (
        <div className={`bg-gray-800 rounded-xl p-6 mb-6 ${fadeIn ? 'animate-fadeIn' : ''}`}>
          <div className="flex items-start mb-4">
            <span className="bg-primary-900 text-primary-400 py-1 px-3 rounded-full text-sm">
              {currentQuestion.category}
            </span>
          </div>
          
          <h3 className="text-xl mb-6">{currentQuestion.text}</h3>
          
          <div className="space-y-3">
            {currentQuestion.choices.map((choice, index) => (
              <div 
                key={index}
                className={`choice-item bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition ${
                  selectedAnswer === index && gameState.answered ? 
                    (index === currentQuestion.correctAnswer ? 'bg-green-900/30 border border-green-800' : 'bg-red-900/30 border border-red-800') : 
                    ''
                }`}
                onClick={() => handleSelectAnswer(index)}
              >
                {choice}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Explanation Section */
        <div className="bg-gray-800 rounded-xl p-6 animate-fadeIn">
          <div className="flex items-center text-lg font-semibold mb-3">
            <Lightbulb className="text-yellow-400 mr-2 h-5 w-5" />
            Explication
          </div>
          <p>{currentQuestion.explanation}</p>
          
          <div className="flex justify-between mt-6">
            <button 
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition flex items-center"
              onClick={() => setShowExplanation(false)}
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Retour
            </button>
            <button 
              className="px-4 py-2 bg-primary-700 rounded-lg hover:bg-primary-600 transition flex items-center"
              onClick={isLastQuestion ? handleEndGame : handleNextQuestion}
            >
              {isLastQuestion ? 'Terminer' : 'Question suivante'} 
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      
      {/* Progress Bar */}
      <div className="bg-gray-800 rounded-full h-2 mt-8">
        <div 
          className="bg-primary-600 h-full rounded-full transition-all duration-500"
          style={{ width: `${((gameState.currentQuestionIndex + 1) / gameState.questions.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default Game;