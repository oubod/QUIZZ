import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Medal, Star } from 'lucide-react';

// Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [category, setCategory] = useState('général');
  const [timeframe, setTimeframe] = useState('all');
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    fetchLeaderboardData();
  }, [category, timeframe]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('games')
        .select(`
          id,
          score,
          user_id,
          users (
            name,
            specialty,
            avatar_config
          )
        `)
        .order('score', { ascending: false })
        .limit(50);

      if (category !== 'général') {
        query = query.eq('category', category);
      }

      if (timeframe === 'week') {
        query = query.gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      } else if (timeframe === 'month') {
        query = query.gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Process and aggregate scores by user
      const userScores = data.reduce((acc: any, game: any) => {
        const userId = game.user_id;
        if (!acc[userId]) {
          acc[userId] = {
            user_id: userId,
            total_score: 0,
            name: game.users.name,
            specialty: game.users.specialty,
            avatar_config: game.users.avatar_config,
            games_played: 0
          };
        }
        acc[userId].total_score += game.score;
        acc[userId].games_played += 1;
        return acc;
      }, {});

      // Convert to array and sort
      const leaderboard = Object.values(userScores)
        .sort((a: any, b: any) => b.total_score - a.total_score);

      setLeaderboardData(leaderboard);

      // Find user's rank
      if (user) {
        const rank = leaderboard.findIndex((item: any) => item.user_id === user.id) + 1;
        setUserRank(rank > 0 ? rank : null);
      }

    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Classement {category}</h2>
        <div className="flex space-x-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-gray-800 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="général">Général</option>
            <option value="Cardiologie">Cardiologie</option>
            <option value="Néphrologie">Néphrologie</option>
            <option value="Infectiologie">Infectiologie</option>
            <option value="Pneumologie">Pneumologie</option>
          </select>
          
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-gray-800 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Tout le temps</option>
            <option value="month">Ce mois</option>
            <option value="week">Cette semaine</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-400">Chargement du classement...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaderboardData.map((item, index) => (
            <div 
              key={item.user_id}
              className={`${
                index < 3 
                  ? 'bg-gradient-to-r from-gray-800 to-gray-700' 
                  : 'bg-gray-800'
              } ${
                user && item.user_id === user.id
                  ? 'border-l-4 border-primary-500'
                  : ''
              } rounded-xl p-4 flex items-center`}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center mr-4
                ${index === 0 ? 'bg-yellow-500' : ''}
                ${index === 1 ? 'bg-gray-400' : ''}
                ${index === 2 ? 'bg-amber-600' : ''}
                ${index > 2 ? 'bg-gray-700' : ''}
              `}>
                {index === 0 && <Trophy className="h-5 w-5 text-white" />}
                {index === 1 && <Medal className="h-5 w-5 text-white" />}
                {index === 2 && <Star className="h-5 w-5 text-white" />}
                {index > 2 && <span className="font-bold">{index + 1}</span>}
              </div>

              <div className="flex-1">
                <div className="flex items-center">
                  <div 
                    className={`w-8 h-8 rounded-full mr-3 flex items-center justify-center text-sm font-bold ${item.avatar_config?.bgColor || 'bg-primary-600'}`}
                  >
                    {item.avatar_config?.initial || item.name[0]}
                  </div>
                  <div>
                    <span className="font-semibold">{item.name}</span>
                    <div className="text-sm text-gray-400">{item.specialty}</div>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-primary-400">{item.total_score} pts</div>
                <div className="text-sm text-gray-400">{item.games_played} parties</div>
              </div>
            </div>
          ))}

          {userRank && userRank > 10 && (
            <div className="mt-4 p-4 bg-gray-800 rounded-xl">
              <div className="text-center text-gray-400">
                Votre position : <span className="font-bold text-primary-400">#{userRank}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;