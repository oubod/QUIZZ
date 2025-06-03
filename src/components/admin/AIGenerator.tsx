import React, { useState, useEffect } from 'react';
import { generateQuestions } from '../../services/aiService';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../../context/AuthContext';

// Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface Category {
  id: string;
  name: string;
}

interface GeneratedQuestion {
  id?: string;
  text: string;
  choices: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  level: string;
  isAIGenerated: boolean;
}

const AIGenerator: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [count, setCount] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    // Fetch categories on mount
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      
      if (data && !error) {
        setCategories(data);
        if (data.length > 0) {
          setSelectedCategory(data[0].name);
        }
      } else if (error) {
        setError('Erreur lors du chargement des catégories');
        console.error(error);
      }
    };

    fetchCategories();
  }, []);

  const handleGenerate = async () => {
    if (!selectedCategory) {
      setError('Veuillez sélectionner une catégorie');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const questions = await generateQuestions(selectedCategory, count);
      setGeneratedQuestions(questions);
    } catch (err) {
      console.error('Error generating questions:', err);
      setError('Erreur lors de la génération des questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestions = async () => {
    if (!user || generatedQuestions.length === 0) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Prepare questions for saving
      const questionsToSave = generatedQuestions.map(q => ({
        ...q,
        createdBy: user.id,
        isAIGenerated: true,
        createdAt: new Date().toISOString()
      }));
      
      // Save to database
      const { error } = await supabase
        .from('questions')
        .insert(questionsToSave);
      
      if (error) {
        throw error;
      }
      
      setSuccess(`${generatedQuestions.length} questions ont été enregistrées avec succès!`);
      setGeneratedQuestions([]);
    } catch (err) {
      console.error('Error saving questions:', err);
      setError('Erreur lors de l\'enregistrement des questions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Générateur de Questions IA</h2>
      <p className="text-gray-400 mb-6">
        Utilisez l'IA Gemini pour générer des questions médicales de haute qualité pour votre plateforme.
      </p>
      
      {error && (
        <div className="mb-6 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-200">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-3 bg-green-900/30 border border-green-800 rounded-lg text-green-200">
          {success}
        </div>
      )}
      
      <div className="bg-gray-700 rounded-xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-300 mb-2">Catégorie</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Nombre de questions</label>
            <input
              type="number"
              min="1"
              max="20"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-primary-600 hover:bg-primary-500 disabled:bg-primary-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition"
        >
          {loading ? 'Génération en cours...' : 'Générer des questions'}
        </button>
      </div>
      
      {generatedQuestions.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Questions générées</h3>
            <button
              onClick={handleSaveQuestions}
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-green-800 disabled:cursor-not-allowed rounded-lg transition"
            >
              Enregistrer toutes les questions
            </button>
          </div>
          
          <div className="space-y-4">
            {generatedQuestions.map((question, index) => (
              <div key={index} className="bg-gray-700 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-primary-900 text-primary-400 py-1 px-3 rounded-full text-sm">
                    {question.category}
                  </span>
                  <span className="text-sm text-gray-400">
                    Niveau: {question.level}
                  </span>
                </div>
                
                <h4 className="text-lg mb-3">{question.text}</h4>
                
                <div className="space-y-2 mb-4">
                  {question.choices.map((choice, choiceIndex) => (
                    <div 
                      key={choiceIndex} 
                      className={`p-3 rounded-lg ${
                        choiceIndex === question.correctAnswer 
                          ? 'bg-green-900/30 border border-green-800' 
                          : 'bg-gray-800'
                      }`}
                    >
                      {choice}
                    </div>
                  ))}
                </div>
                
                <div className="bg-gray-800 p-3 rounded-lg">
                  <div className="font-medium mb-1">Explication:</div>
                  <p className="text-gray-300 text-sm">{question.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIGenerator;