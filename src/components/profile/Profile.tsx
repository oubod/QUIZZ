import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-8">
        <div 
          className={`w-24 h-24 ${user.avatarConfig.bgColor} rounded-full flex items-center justify-center mb-4 text-3xl font-bold`}
        >
          {user.avatarConfig.initial}
        </div>
        <h2 className="text-2xl font-bold">{user.name}</h2>
        <p className="text-gray-400">Interne en {user.specialty}</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-xl p-6 flex flex-col items-center">
          <div className="radial-progress mb-4" style={{ '--progress': '70%' } as React.CSSProperties}>
            <span className="radial-value text-xl font-bold text-white">70%</span>
          </div>
          <h3 className="font-semibold mb-1">Expertise générale</h3>
          <p className="text-gray-400 text-center">Niveau {user.level}</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 flex flex-col items-center">
          <div className="radial-progress mb-4" style={{ '--progress': '85%' } as React.CSSProperties}>
            <span className="radial-value text-xl font-bold text-white">85%</span>
          </div>
          <h3 className="font-semibold mb-1">{user.specialty}</h3>
          <p className="text-gray-400 text-center">Spécialiste</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 flex flex-col items-center">
          <div className="radial-progress mb-4" style={{ '--progress': `${(user.xp / 1000) * 100}%` } as React.CSSProperties}>
            <span className="radial-value text-xl font-bold text-white">{user.xp} XP</span>
          </div>
          <h3 className="font-semibold mb-1">Progression</h3>
          <p className="text-gray-400 text-center">Prochain niveau: {user.level + 1}</p>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Trophy className="text-yellow-500 mr-3 h-5 w-5" />
          Récompenses
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <div className="bg-gray-700 rounded-lg p-4 flex flex-col items-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mb-2">
              <Medal className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium">Première victoire</span>
            <span className="text-xs text-gray-400">Niveau 1</span>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4 flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-2">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium">Expert {user.specialty}</span>
            <span className="text-xs text-gray-400">Niveau 3</span>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4 flex flex-col items-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-2">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium">Série de 5</span>
            <span className="text-xs text-gray-400">Niveau 2</span>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4 flex flex-col items-center">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-2">
              <Users className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium">Social</span>
            <span className="text-xs text-gray-400">Niveau 1</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <LineChart className="text-primary-500 mr-3 h-5 w-5" />
          Statistiques
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-xl font-bold text-primary-500">42</div>
            <p className="text-gray-400 text-sm">Parties jouées</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-xl font-bold text-green-500">86%</div>
            <p className="text-gray-400 text-sm">Taux de victoire</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-xl font-bold text-yellow-500">11</div>
            <p className="text-gray-400 text-sm">Top 3 classement</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-xl font-bold text-purple-500">7</div>
            <p className="text-gray-400 text-sm">Série de victoires</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;