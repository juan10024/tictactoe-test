// frontend/src/components/player/PlayerStatsSummary.tsx (si no existe, créalo)
import { useEffect, useState } from 'react';
import { Trophy, RotateCcw, Users } from 'lucide-react';
import { fetchPlayerStats } from '../../services/statsService';

interface PlayerStats {
  id: number;
  name: string;
  wins: number;
  draws: number;
  losses: number;
}

interface PlayerStatsSummaryProps {
  playerName: string;
}

const PlayerStatsSummary: React.FC<PlayerStatsSummaryProps> = ({ playerName }) => {
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlayerStats = async () => {
      try {
        setIsLoading(true);
        const data = await fetchPlayerStats(playerName);
        setPlayerStats(data);
      } catch (err: any) {
        console.error('Error fetching player stats:', err);
        setError(err.message || 'Failed to load player statistics');
      } finally {
        setIsLoading(false);
      }
    };

    if (playerName) {
      loadPlayerStats();
    }
  }, [playerName]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">Player Statistics</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading player statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">Player Statistics</h2>
        <div className="text-center py-8 text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6">Player Statistics</h2>
      
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          {playerStats?.name || playerName}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="flex justify-center mb-2">
            <Trophy className="text-yellow-600 dark:text-yellow-400" size={32} />
          </div>
          <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">
            {playerStats?.wins || 0}
          </div>
          <div className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
            Wins
          </div>
        </div>
        
        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="flex justify-center mb-2">
            <RotateCcw className="text-red-600 dark:text-red-400" size={32} />
          </div>
          <div className="text-3xl font-bold text-red-700 dark:text-red-300">
            {playerStats?.losses || 0}
          </div>
          <div className="text-sm text-red-600 dark:text-red-400 mt-1">
            Losses
          </div>
        </div>
        
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex justify-center mb-2">
            <Users className="text-blue-600 dark:text-blue-400" size={32} />
          </div>
          <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
            {playerStats?.draws || 0}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
            Draws
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStatsSummary;