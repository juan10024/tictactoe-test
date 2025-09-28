// frontend/src/components/stats/PlayerStatsSummary.tsx
import { useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';

interface PlayerStatsData {
  name: string;
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
  winRate: number;
}

const PlayerStatsSummary = () => {
  const players = useGameStore((state) => state.players);

  const playerStats = useMemo((): { X: PlayerStatsData; O: PlayerStatsData } | null => {
    if (!players.X && !players.O) return null;
    
    const calculateStats = (player: typeof players.X, isPlayerX: boolean): PlayerStatsData => {
      const wins = player?.wins || 0;
      const losses = player?.losses || 0;
      const draws = player?.draws || 0;
      const totalGames = wins + losses + draws;
      const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
      
      return {
        name: player?.name || (isPlayerX ? 'Player X' : 'Player O'),
        wins,
        losses,
        draws,
        totalGames,
        winRate
      };
    };

    return {
      X: calculateStats(players.X, true),
      O: calculateStats(players.O, false)
    };
  }, [players]);

  if (!playerStats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Loading player statistics...
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Player X Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-lg">X</div>
          <h2 className="text-xl font-bold text-cyan-700 dark:text-cyan-300">
            {playerStats.X.name}
          </h2>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="font-semibold">Total Games:</span>
            <span>{playerStats.X.totalGames}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-green-600 dark:text-green-400">Wins:</span>
            <span className="font-bold">{playerStats.X.wins}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-red-600 dark:text-red-400">Losses:</span>
            <span className="font-bold">{playerStats.X.losses}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-yellow-600 dark:text-yellow-400">Draws:</span>
            <span className="font-bold">{playerStats.X.draws}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Win Rate:</span>
            <span className="font-bold text-cyan-600 dark:text-cyan-400">
              {playerStats.X.winRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Player O Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold text-lg">O</div>
          <h2 className="text-xl font-bold text-rose-700 dark:text-rose-300">
            {playerStats.O.name}
          </h2>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="font-semibold">Total Games:</span>
            <span>{playerStats.O.totalGames}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-green-600 dark:text-green-400">Wins:</span>
            <span className="font-bold">{playerStats.O.wins}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-red-600 dark:text-red-400">Losses:</span>
            <span className="font-bold">{playerStats.O.losses}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-yellow-600 dark:text-yellow-400">Draws:</span>
            <span className="font-bold">{playerStats.O.draws}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Win Rate:</span>
            <span className="font-bold text-rose-600 dark:text-rose-400">
              {playerStats.O.winRate}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStatsSummary;