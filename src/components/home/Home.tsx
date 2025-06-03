import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQuiz } from '../../context/QuizContext';
import { Brain, Users, Trophy, Calendar, Heart, Filter, Brush as Virus, Settings as Lungs, Activity, ArrowRight } from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();
  const { startGame, categories } = useQuiz();
  const navigate = useNavigate();
  
  const handleSoloGame = async (category?: string) => {
    await startGame('solo', category);
    navigate(`/play/${category || 'all'}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Bienvenue, {user?.name || 'Docteur'}!</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Testez vos connaissances médicales, affrontez vos collègues et progressez dans votre spécialité.
        </p>
      </div>
      
      {/* Game Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div 
          className="bg-gray-800 rounded-xl p-6 cursor-pointer hover:bg-gray-700 transition transform hover:-translate-y-1 flex flex-col items-center"
          onClick={() => handleSoloGame()}
        >
          <div className="bg-primary-900 p-4 rounded-full mb-4">
            <Brain className="text-primary-400 h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Jouer en solo</h3>
          <p className="text-gray-400 text-center mb-4">
            Entraînez-vous avec nos cas cliniques dans un environnement sans pression
          </p>
          <span className="text-primary-500 mt-auto flex items-center">
            Commencer <ArrowRight className="ml-2 h-4 w-4" />
          </span>
        </div>
        
        <div 
          className="bg-gray-800 rounded-xl p-6 cursor-pointer hover:bg-gray-700 transition transform hover:-translate-y-1 flex flex-col items-center"
          onClick={() => navigate('/multiplayer')}
        >
          <div className="bg-green-900 p-4 rounded-full mb-4">
            <Users className="text-green-400 h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Jouer contre un ami</h3>
          <p className="text-gray-400 text-center mb-4">
            Défiez un collègue dans un quiz en temps réel
          </p>
          <span className="text-green-500 mt-auto flex items-center">
            Commencer <ArrowRight className="ml-2 h-4 w-4" />
          </span>
        </div>
        
        <div 
          className="bg-gray-800 rounded-xl p-6 cursor-pointer hover:bg-gray-700 transition transform hover:-translate-y-1 flex flex-col items-center"
          onClick={() => navigate('/leaderboard')}
        >
          <div className="bg-yellow-900 p-4 rounded-full mb-4">
            <Trophy className="text-yellow-400 h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Classement</h3>
          <p className="text-gray-400 text-center mb-4">
            Consultez les meilleurs internes de chaque spécialité
          </p>
          <span className="text-yellow-500 mt-auto flex items-center">
            Voir <ArrowRight className="ml-2 h-4 w-4" />
          </span>
        </div>
        
        <div 
          className="bg-gray-800 rounded-xl p-6 cursor-pointer hover:bg-gray-700 transition transform hover:-translate-y-1 flex flex-col items-center"
          onClick={() => navigate('/daily-challenge')}
        >
          <div className="bg-purple-900 p-4 rounded-full mb-4">
            <Calendar className="text-purple-400 h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Défi quotidien</h3>
          <p className="text-gray-400 text-center mb-4">
            Obtenez des points bonus avec notre défi quotidien
          </p>
          <span className="text-purple-500 mt-auto flex items-center">
            Participer <ArrowRight className="ml-2 h-4 w-4" />
          </span>
        </div>
      </div>
      
      {/* Specialties */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-4">Explorez par spécialité</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <div 
            className="bg-gray-800 rounded-lg p-4 flex items-center cursor-pointer hover:bg-gray-700 transition"
            onClick={() => handleSoloGame('Cardiologie')}
          >
            <Heart className="text-red-500 mr-2 h-5 w-5" />
            <span>Cardiologie</span>
          </div>
          <div 
            className="bg-gray-800 rounded-lg p-4 flex items-center cursor-pointer hover:bg-gray-700 transition"
            onClick={() => handleSoloGame('Néphrologie')}
          >
            <Filter className="text-blue-500 mr-2 h-5 w-5" />
            <span>Néphrologie</span>
          </div>
          <div 
            className="bg-gray-800 rounded-lg p-4 flex items-center cursor-pointer hover:bg-gray-700 transition"
            onClick={() => handleSoloGame('Infectiologie')}
          >
            <Virus className="text-green-500 mr-2 h-5 w-5" />
            <span>Infectiologie</span>
          </div>
          <div 
            className="bg-gray-800 rounded-lg p-4 flex items-center cursor-pointer hover:bg-gray-700 transition"
            onClick={() => handleSoloGame('Pneumologie')}
          >
            <Lungs className="text-teal-500 mr-2 h-5 w-5" />
            <span>Pneumologie</span>
          </div>
          <div 
            className="bg-gray-800 rounded-lg p-4 flex items-center cursor-pointer hover:bg-gray-700 transition"
            onClick={() => handleSoloGame('Gastro-entérologie')}
          >
            <Activity className="text-purple-500 mr-2 h-5 w-5" />
            <span>Gastro-entérologie</span>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">Votre activité récente</h3>
        <div className="space-y-4">
          <div className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
            <div>
              <div className="font-medium">Quiz Cardiologie</div>
              <div className="text-sm text-gray-400">8/10 questions correctes</div>
            </div>
            <div className="text-right">
              <div className="text-primary-500 font-bold">800 pts</div>
              <div className="text-xs text-gray-400">il y a 2 heures</div>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
            <div>
              <div className="font-medium">Défi quotidien</div>
              <div className="text-sm text-gray-400">Complété avec succès</div>
            </div>
            <div className="text-right">
              <div className="text-purple-500 font-bold">200 pts</div>
              <div className="text-xs text-gray-400">hier</div>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
            <div>
              <div className="font-medium">Match multijoueur</div>
              <div className="text-sm text-gray-400">Victoire contre Dr. Sophie</div>
            </div>
            <div className="text-right">
              <div className="text-green-500 font-bold">750 pts</div>
              <div className="text-xs text-gray-400">il y a 2 jours</div>
            </div>
          </div>
        </div>
        
        <Link 
          to="/profile" 
          className="flex items-center justify-center mt-6 text-primary-400 hover:text-primary-300 transition"
        >
          Voir toute l'activité <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default Home;