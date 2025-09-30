// frontend/src/components/stats/GeneralStatsSection.tsx
import { useEffect, useState } from 'react';
import { BarChart3, Users, Trophy } from 'lucide-react';
import { fetchGeneralStats } from '../../services/statsService';

interface GeneralStats {
  totalGames: number;
  totalPlayers: number;
}

const GeneralStatsSection = () => {
  const [generalStats, setGeneralStats] = useState<GeneralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGeneralStats = async () => { // Cambia el nombre de la función interna
      try {
        setIsLoading(true);
        // Usa el servicio que creaste
        const data = await fetchGeneralStats();
        setGeneralStats({
          totalGames: data.totalGames,
          totalPlayers: data.totalPlayers
        });
      } catch (err: any) {
        console.error('Error fetching general stats:', err);
        setError(err.message || 'Failed to load general statistics');
      } finally {
        setIsLoading(false);
      }
    };

    loadGeneralStats(); // Llama a la función con el nuevo nombre
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="text-purple-500" size={24} />
          General Statistics
        </h2>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="text-purple-500" size={24} />
          General Statistics
        </h2>
        <div className="text-center py-4 text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BarChart3 className="text-purple-500" size={24} />
        General Statistics
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="flex justify-center mb-2">
            <Users className="text-purple-600 dark:text-purple-400" size={32} />
          </div>
          <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
            {generalStats?.totalPlayers.toLocaleString() || 0}
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-400 mt-1">
            Total Players
          </div>
        </div>
        
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex justify-center mb-2">
            <Trophy className="text-blue-600 dark:text-blue-400" size={32} />
          </div>
          <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
            {generalStats?.totalGames.toLocaleString() || 0}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
            Total Games Played
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralStatsSection;