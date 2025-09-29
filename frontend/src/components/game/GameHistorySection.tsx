/*
 * file: GameHistorySection.tsx
 * component: GameHistorySection
 * description:
 *     Displays a list of past games for a given room. Fetches the game history
 *     from the backend API and shows information such as players, winner, number
 *     of moves, date, and duration. Includes loading state and error handling.
 */

import { useEffect, useState } from 'react';
import { BarChart3, Trophy, Users, RotateCcw } from 'lucide-react';

interface GameHistoryItem {
  id: number;
  roomID: string;
  winner: string | null;
  playerX: string;
  playerO: string;
  moves: number;
  date: string;
  duration: string;
}

/*
 * GameHistorySection fetches and displays a list of games for a specific room.
 *
 * Parameters:
 *   - roomId (string): The unique room identifier for which to fetch game history.
 *
 * Returns:
 *   - JSX.Element: A section with game history, loading indicator, or error message.
 */
const GameHistorySection = ({ roomId }: { roomId: string; playerName: string }) => {
  const [gameHistory, setGameHistory] = useState<GameHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGameHistory = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/rooms/${roomId}/history`);

        if (response.status === 404) {
          setGameHistory([]);
          setError(null);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch game history');
        }

        const data = await response.json();
        setGameHistory(data.games || []);
      } catch (err) {
        console.error('Error fetching game history:', err);
        setError('Failed to load game history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameHistory();
  }, [roomId]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="text-purple-500" size={24} />
          Game History
        </h2>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BarChart3 className="text-purple-500" size={24} />
        Game History
      </h2>

      {error ? (
        <div className="text-center py-4 text-red-500">
          {error}
        </div>
      ) : gameHistory.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No game history available for this room
        </div>
      ) : (
        <div className="space-y-4">
          {gameHistory.map((game) => (
            <div
              key={game.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                    {game.roomID}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {game.date}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <RotateCcw size={14} className="text-gray-400" />
                  <span>{game.duration}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="text-center">
                  <div className="font-semibold text-cyan-600 dark:text-cyan-400">Player X</div>
                  <div>{game.playerX}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-rose-600 dark:text-rose-400">Player O</div>
                  <div>{game.playerO}</div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {game.winner ? (
                    <>
                      <Trophy className="text-yellow-500" size={16} />
                      <span className="font-semibold">
                        {game.winner} won
                      </span>
                    </>
                  ) : (
                    <>
                      <Users className="text-yellow-500" size={16} />
                      <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                        Draw
                      </span>
                    </>
                  )}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {game.moves} moves
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GameHistorySection;
