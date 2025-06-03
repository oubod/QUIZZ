import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../../context/AuthContext';
import { 
  CheckCircle, 
  XCircle, 
  Edit, 
  Trash, 
  Plus, 
  Search,
  Filter,
  Save,
  X
} from 'lucide-react';

// Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface Category {
  id: string;
  name: string;
}

interface Question {
  id: string;
  text: string;
  choices: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  level: string;
  isAIGenerated: boolean;
  createdBy: string;
  createdAt: string;
}

const QuestionManager: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  
  // Edit/Create Mode
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    text: '',
    choices: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    category: '',
    level: 'Interne'
  });

  useEffect(() => {
    // Fetch categories and questions on mount
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*');
        
        if (categoriesError) {
          throw categoriesError;
        }
        
        setCategories(categoriesData || []);
        
        // Fetch questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .order('createdAt', { ascending: false });
        
        if (questionsError) {
          throw questionsError;
        }
        
        setQuestions(questionsData || []);
        setFilteredQuestions(questionsData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    // Apply filters when any filter changes
    let filtered = [...questions];
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(q => 
        q.text.toLowerCase().includes(searchLower) || 
        q.explanation.toLowerCase().includes(searchLower)
      );
    }
    
    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(q => q.category === categoryFilter);
    }
    
    // Level filter
    if (levelFilter) {
      filtered = filtered.filter(q => q.level === levelFilter);
    }
    
    // Source filter (AI or Manual)
    if (sourceFilter) {
      filtered = filtered.filter(q => 
        (sourceFilter === 'ai' && q.isAIGenerated) ||
        (sourceFilter === 'manual' && !q.isAIGenerated)
      );
    }
    
    setFilteredQuestions(filtered);
  }, [search, categoryFilter, levelFilter, sourceFilter, questions]);

  const handleCreateQuestion = () => {
    setCurrentQuestion({
      text: '',
      choices: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      category: categories.length > 0 ? categories[0].name : '',
      level: 'Interne'
    });
    setIsEditing(true);
  };

  const handleEditQuestion = (question: Question) => {
    setCurrentQuestion(question);
    setIsEditing(true);
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette question?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setQuestions(questions.filter(q => q.id !== id));
      setSuccess('Question supprimée avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting question:', err);
      setError('Erreur lors de la suppression de la question');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSaveQuestion = async () => {
    if (!currentQuestion.text || !currentQuestion.explanation || !currentQuestion.category ||
        currentQuestion.choices?.some(c => !c) || currentQuestion.correctAnswer === undefined) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    try {
      if (currentQuestion.id) {
        // Update existing question
        const { error } = await supabase
          .from('questions')
          .update({
            text: currentQuestion.text,
            choices: currentQuestion.choices,
            correctAnswer: currentQuestion.correctAnswer,
            explanation: currentQuestion.explanation,
            category: currentQuestion.category,
            level: currentQuestion.level
          })
          .eq('id', currentQuestion.id);
        
        if (error) {
          throw error;
        }
        
        // Update local state
        setQuestions(questions.map(q => 
          q.id === currentQuestion.id ? { ...q, ...currentQuestion as Question } : q
        ));
        
        setSuccess('Question mise à jour avec succès');
      } else {
        // Create new question
        const newQuestion = {
          ...currentQuestion,
          isAIGenerated: false,
          createdBy: user?.id || '',
          createdAt: new Date().toISOString()
        };
        
        const { data, error } = await supabase
          .from('questions')
          .insert([newQuestion])
          .select();
        
        if (error) {
          throw error;
        }
        
        // Update local state
        if (data && data.length > 0) {
          setQuestions([data[0], ...questions]);
        }
        
        setSuccess('Question créée avec succès');
      }
      
      // Reset form
      setIsEditing(false);
      setCurrentQuestion({
        text: '',
        choices: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
        category: '',
        level: 'Interne'
      });
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving question:', err);
      setError('Erreur lors de l\'enregistrement de la question');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gestionnaire de Questions</h2>
      
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
      
      {isEditing ? (
        // Question Editor
        <div className="bg-gray-700 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">
              {currentQuestion.id ? 'Modifier' : 'Créer'} une question
            </h3>
            <button 
              onClick={() => setIsEditing(false)}
              className="p-2 rounded-full hover:bg-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2">Question</label>
              <textarea
                value={currentQuestion.text}
                onChange={(e) => setCurrentQuestion({...currentQuestion, text: e.target.value})}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Options</label>
              {currentQuestion.choices?.map((choice, index) => (
                <div key={index} className="flex items-center mb-3">
                  <div className="mr-3">
                    <input
                      type="radio"
                      checked={currentQuestion.correctAnswer === index}
                      onChange={() => setCurrentQuestion({...currentQuestion, correctAnswer: index})}
                      className="w-5 h-5 text-primary-500"
                    />
                  </div>
                  <input
                    value={choice}
                    onChange={(e) => {
                      const newChoices = [...(currentQuestion.choices || [])];
                      newChoices[index] = e.target.value;
                      setCurrentQuestion({...currentQuestion, choices: newChoices});
                    }}
                    className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder={`Option ${index + 1}`}
                  />
                </div>
              ))}
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Explication</label>
              <textarea
                value={currentQuestion.explanation}
                onChange={(e) => setCurrentQuestion({...currentQuestion, explanation: e.target.value})}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 mb-2">Catégorie</label>
                <select
                  value={currentQuestion.category}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, category: e.target.value})}
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
                <label className="block text-gray-300 mb-2">Niveau</label>
                <select
                  value={currentQuestion.level}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, level: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Débutant">Débutant</option>
                  <option value="Interne">Interne</option>
                  <option value="Confirmé">Confirmé</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg mr-3"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveQuestion}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg flex items-center"
              >
                <Save className="h-5 w-5 mr-2" />
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Questions List
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher des questions..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            
            <button
              onClick={handleCreateQuestion}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nouvelle question
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Tous les niveaux</option>
                <option value="Débutant">Débutant</option>
                <option value="Interne">Interne</option>
                <option value="Confirmé">Confirmé</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
            
            <div>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Toutes les sources</option>
                <option value="ai">Générées par IA</option>
                <option value="manual">Créées manuellement</option>
              </select>
            </div>
            
            <div className="flex items-center justify-end">
              <button
                onClick={() => {
                  setSearch('');
                  setCategoryFilter('');
                  setLevelFilter('');
                  setSourceFilter('');
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center"
              >
                <Filter className="h-5 w-5 mr-2" />
                Réinitialiser
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
              <p className="mt-2 text-gray-400">Chargement des questions...</p>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-400 mb-4">
                Affichage de {filteredQuestions.length} sur {questions.length} questions
              </div>
              
              <div className="space-y-4">
                {filteredQuestions.length === 0 ? (
                  <div className="bg-gray-700 rounded-xl p-6 text-center">
                    <p className="text-gray-400">Aucune question ne correspond à vos critères de recherche</p>
                  </div>
                ) : (
                  filteredQuestions.map((question) => (
                    <div key={question.id} className="bg-gray-700 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <span className="bg-primary-900 text-primary-400 py-1 px-3 rounded-full text-sm mr-2">
                            {question.category}
                          </span>
                          <span className="bg-gray-800 text-gray-300 py-1 px-3 rounded-full text-sm">
                            {question.level}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditQuestion(question)}
                            className="p-1.5 rounded-full hover:bg-gray-600"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="p-1.5 rounded-full hover:bg-gray-600"
                            title="Supprimer"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <h4 className="text-lg mb-3">{question.text}</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                        {question.choices.map((choice, index) => (
                          <div 
                            key={index} 
                            className={`p-2 rounded-lg flex items-center ${
                              index === question.correctAnswer 
                                ? 'bg-green-900/30 border border-green-800' 
                                : 'bg-gray-800'
                            }`}
                          >
                            {index === question.correctAnswer ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                            )}
                            <span className="text-sm">{choice}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-xs text-gray-400 mt-2">
                        {question.isAIGenerated ? 'Générée par IA' : 'Créée manuellement'} · 
                        {new Date(question.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default QuestionManager;