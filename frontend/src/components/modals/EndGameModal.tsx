/*
 * file: EndGameModal.tsx
 * component: EndGameModal
 * description:
 *     Modal that appears at the end of a match showing the result (win, lose, or draw),
 *     displaying player statistics, and providing actions to either exit or play again.
 *
 * props:
 *   - playerName (string): Name of the current player, used to determine if they are the winner.
 *
 * state (from store):
 *   - gameState (object): Current game state, including winner information.
 *   - players (object): Player data for X and O (name, wins, losses, draws).
 *   - setShowEndGameModal (function): Toggles the modal visibility.
 *   - setPlayAgainRequest (function): Triggers a new play-again request.
 */

import { useGameStore } from '../../store/gameStore';
import { Trophy, Users, RotateCcw, LogOut } from 'lucide-react';

interface EndGameModalProps {
  playerName: string;
}

const EndGameModal = ({ playerName }: EndGameModalProps) => {
  // Zustand store selectors
  const gameState = useGameStore((state) => state.gameState);
  const players = useGameStore((state) => state.players);
  const setShowEndGameModal = useGameStore((state) => state.setShowEndGameModal);
  const setPlayAgainRequest = useGameStore((state) => state.setPlayAgainRequest);

  // Determine winner and match outcome
  const getWinnerName = () => {
    if (!gameState?.WinnerID) return null;
    if (players.X?.id === gameState.WinnerID) return players.X.name;
    if (players.O?.id === gameState.WinnerID) return players.O.name;
    return null;
  };

  const winnerName = getWinnerName();
  const isDraw = !winnerName;
  const isWinner = winnerName === playerName;

  // Actions
  const handlePlayAgain = () => {
    setPlayAgainRequest(playerName);
    setShowEndGameModal(false);
  };

  const handleExit = () => {
    setShowEndGameModal(false);
    const event = new CustomEvent('showGameMenu');
    window.dispatchEvent(event);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full transform transition-all duration-300 scale-100 animate-fade-in">
        <div className="text-center">
          {/* Result icon and status */}
          <div className="mb-6 flex justify-center">
            {isDraw ? (
              <div className="relative">
                <Users className="text-yellow-500" size={64} />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">=</span>
                </div>
              </div>
            ) : isWinner ? (
              <div className="relative animate-bounce">
                <Trophy className="text-yellow-500" size={64} />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">W</span>
                </div>
              </div>
            ) : (
              <div className="relative">
                <Trophy className="text-gray-400" size={64} />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">L</span>
                </div>
              </div>
            )}
          </div>

          {/* Result message */}
          <h3 className="text-2xl font-bold mb-4">
            {isDraw ? (
              <span className="text-yellow-600 dark:text-yellow-400">It's a TIE!</span>
            ) : isWinner ? (
              <span className="text-green-600 dark:text-green-400">You Won!</span>
            ) : (
              <span className="text-red-600 dark:text-red-400">You Lost!</span>
            )}
          </h3>

          {/* Winner details */}
          {!isDraw && winnerName && (
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {isWinner ? 'Congratulations!' : `${winnerName} wins!`}
            </p>
          )}

          {/* Players statistics */}
          <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-cyan-600 dark:text-cyan-400">Player X</div>
                <div className="text-lg font-bold">{players.X?.name || '---'}</div>
                {players.X && (
                  <div className="text-xs mt-1">
                    W:{players.X.wins} L:{players.X.losses} D:{players.X.draws}
                  </div>
                )}
              </div>
              <div className="text-center">
                <div className="font-semibold text-rose-600 dark:text-rose-400">Player O</div>
                <div className="text-lg font-bold">{players.O?.name || '---'}</div>
                {players.O && (
                  <div className="text-xs mt-1">
                    W:{players.O.wins} L:{players.O.losses} D:{players.O.draws}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handleExit}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all transform hover:scale-105 shadow-lg"
            >
              <LogOut size={20} />
              Exit
            </button>
            <button
              onClick={handlePlayAgain}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg animate-pulse"
            >
              <RotateCcw size={20} />
              Play Again
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EndGameModal;
