/*
 * file: GameHistorySection.tsx
 * component: GameHistorySection
 * description:
 *     Displays a list of past games for a given room. Fetches the game history
 *     from the backend API and shows information such as players, winner, number
 *     of moves, date, and duration. Includes loading state and error handling.
 */

import { useEffect, useState } from 'react';
import { BarChart3, Trophy, Users  } from 'lucide-react';
import { fetchGameHistory } from '../../services/statsService'; // Importa el servicio

interface Player {
  id: number;
  name: string;
  wins: number;
  draws: number;
  losses: number;
}

interface GameHistoryItem {
  id: number;
  roomID: string;
  playerX: Player;
  playerO: Player;
  winner: Player | null;
  status: string;
  board: string;
  createdAt: string;
  winnerID: number | null;
  playerXID: number | null;
  playerOID: number | null;
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
const GameHistorySection = ({ roomId }: { roomId: string; }) => {
  const [gameHistory, setGameHistory] = useState<GameHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGameHistory = async () => {
      try {
        setIsLoading(true);
        // Usa el servicio para obtener el historial
        const data = await fetchGameHistory(roomId);
        // Ajusta según la estructura de respuesta del backend
        setGameHistory(data.games || []);
      } catch (err: any) {
        console.error('Error fetching game history:', err);
        setError(err.message || 'Failed to load game history');
      } finally {
        setIsLoading(false);
      }
    };

    loadGameHistory();
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
                    {new Date(game.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="text-center">
                  <div className="font-semibold text-cyan-600 dark:text-cyan-400">Player X</div>
                  <div>{game.playerX?.name || 'N/A'}</div>
                  <div className="text-xs text-gray-500">
                    W:{game.playerX?.wins || 0} D:{game.playerX?.draws || 0} L:{game.playerX?.losses || 0}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-rose-600 dark:text-rose-400">Player O</div>
                  <div>{game.playerO?.name || 'N/A'}</div>
                  <div className="text-xs text-gray-500">
                    W:{game.playerO?.wins || 0} D:{game.playerO?.draws || 0} L:{game.playerO?.losses || 0}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {game.winner ? (
                    <>
                      <Trophy className="text-yellow-500" size={16} />
                      <span className="font-semibold">
                        {game.winner.name} won
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
                  Status: {game.status}
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