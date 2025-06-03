import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Users, Brain, Trophy, Calendar, ArrowUp, ArrowDown } from 'lucide-react';

// Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface Stats {
  totalUsers: number;
  totalQuestions: number;
  totalGames: number;
  averageScore: number;
  activeUsers: number;
  completionRate: number;
}

interface Trend {
  label: string;
  current: number;
  previous: number;
  change: number;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalQuestions: 0,
    totalGames: 0,
    averageScore: 0,
    activeUsers: 0,
    completionRate: 0
  });
  const [trends, setTrends] = useState<Trend[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch total users
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact' });

      // Fetch total questions
      const { count: questionCount } = await supabase
        .from('questions')
        .select('*', { count: 'exact' });

      // Fetch game statistics
      const { data: games } = await supabase
        .from('games')
        .select('score, completed')
        .order('created_at', { ascending: false });

      // Calculate statistics
      const totalGames = games?.length || 0;
      const completedGames = games?.filter(g => g.completed).length || 0;
      const totalScore = games?.reduce((sum, game) => sum + (game.score || 0), 0) || 0;

      // Calculate trends (last 7 days vs previous 7 days)
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const { data: recentGames } = await supabase
        .from('games')
        .select('created_at')
        .gte('created_at', fourteenDaysAgo.toISOString());

      const currentPeriodGames = recentGames?.filter(g => 
        new Date(g.created_at) >= sevenDaysAgo
      ).length || 0;

      const previousPeriodGames = recentGames?.filter(g =>
        new Date(g.created_at) >= fourteenDaysAgo && new Date(g.created_at) < sevenDaysAgo
      ).length || 0;

      const gamesTrend = {
        label: 'Parties jouées',
        current: currentPeriodGames,
        previous: previousPeriodGames,
        change: ((currentPeriodGames - previousPeriodGames) / previousPeriodGames) * 100
      };

      setStats({
        totalUsers: userCount || 0,
        totalQuestions: questionCount || 0,
        totalGames,
        averageScore: totalGames ? Math.round(totalScore / totalGames) : 0,
        activeUsers: 0, // Would need more complex query
        completionRate: totalGames ? (completedGames / totalGames) * 100 : 0
      });

      setTrends([gamesTrend]);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
        <p className="mt-2 text-gray-400">Chargement des statistiques...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Tableau de bord</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-700 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <div className="bg-blue-900/30 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-400">Utilisateurs</div>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            {stats.activeUsers} actifs cette semaine
          </div>
        </div>

        <div className="bg-gray-700 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <div className="bg-green-900/30 p-3 rounded-lg">
              <Brain className="h-6 w-6 text-green-400" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-400">Questions</div>
              <div className="text-2xl font-bold">{stats.totalQuestions}</div>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Score moyen: {stats.averageScore}
          </div>
        </div>

        <div className="bg-gray-700 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <div className="bg-purple-900/30 p-3 rounded-lg">
              <Trophy className="h-6 w-6 text-purple-400" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-400">Parties jouées</div>
              <div className="text-2xl font-bold">{stats.totalGames}</div>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Taux de complétion: {Math.round(stats.completionRate)}%
          </div>
        </div>

        <div className="bg-gray-700 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <div className="bg-yellow-900/30 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-400">Cette semaine</div>
              <div className="text-2xl font-bold">{trends[0]?.current || 0}</div>
            </div>
          </div>
          {trends[0] && (
            <div className="flex items-center text-sm">
              {trends[0].change >= 0 ? (
                <>
                  <ArrowUp className="h-4 w-4 text-green-400 mr-1" />
                  <span className="text-green-400">+{Math.abs(Math.round(trends[0].change))}%</span>
                </>
              ) : (
                <>
                  <ArrowDown className="h-4 w-4 text-red-400 mr-1" />
                  <span className="text-red-400">-{Math.abs(Math.round(trends[0].change))}%</span>
                </>
              )}
              <span className="text-gray-400 ml-2">vs semaine précédente</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Questions populaires</h3>
          <div className="space-y-4">
            {/* Add popular questions list here */}
          </div>
        </div>

        <div className="bg-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Activité récente</h3>
          <div className="space-y-4">
            {/* Add recent activity list here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;