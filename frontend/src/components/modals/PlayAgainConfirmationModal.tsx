/*
 * file: PlayAgainConfirmationModal.tsx
 * component: PlayAgainConfirmationModal
 * description:
 *     Modal that appears when an opponent requests to play again after a game ends.
 *     Allows the current player to accept or decline the rematch request.
 *     On acceptance, it resets the game state and dispatches an event to show the game board.
 *
 * state (from store):
 *   - playAgainRequestingPlayer (string | null): Name of the opponent requesting a rematch.
 *   - clearPlayAgainRequest (function): Clears the current play-again request from state.
 *   - resetGame (function): Resets the game state for a new match.
 *   - respondToPlayAgain (function): Sends a response (accept/decline) to the opponent.
 *
 * events:
 *   - Dispatches a custom event `showGameBoard` on acceptance to re-render the board view.
 */

import { memo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Gamepad2 } from 'lucide-react';

const PlayAgainConfirmationModal = memo(() => {
  // Zustand store: state & actions
  const playAgainRequestingPlayer = useGameStore(state => state.playAgainRequestingPlayer);
  const clearPlayAgainRequest = useGameStore(state => state.clearPlayAgainRequest);
  const restarGame = useGameStore(state => state.resetGame);
  const respondToPlayAgain = useGameStore(state => state.respondToPlayAgain);

  if (!playAgainRequestingPlayer) return null;

  // Handle accept: reset game, notify backend, clear modal
  const handleAccept = () => {
    restarGame();
    respondToPlayAgain(true); 
    clearPlayAgainRequest();

    const event = new CustomEvent('showGameBoard');
    window.dispatchEvent(event);
  };

  // Handle decline: notify backend and close modal
  const handleDecline = () => {
    respondToPlayAgain(false); 
    clearPlayAgainRequest();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <div className="text-center">
          {/* Icon & visual indicator */}
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
              <Gamepad2 className="text-white" size={32} />
            </div>
          </div>
          
          {/* Modal title */}
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Play Again Request
          </h3>
          
          {/* Requesting player name */}
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            <span className="font-semibold text-cyan-600 dark:text-cyan-400">
              {playAgainRequestingPlayer}
            </span> wants to play another game!
          </p>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleDecline}
              className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all shadow-md"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PlayAgainConfirmationModal;
