// frontend/src/components/PlayAgainConfirmationModal.tsx
import { memo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Gamepad2 } from 'lucide-react';

const PlayAgainConfirmationModal = memo(() => {
  const playAgainRequestingPlayer = useGameStore(state => state.playAgainRequestingPlayer);
  const clearPlayAgainRequest = useGameStore(state => state.clearPlayAgainRequest);
  const restarGame = useGameStore(state => state.resetGame);
  const respondToPlayAgain = useGameStore(state => state.respondToPlayAgain);

  if (!playAgainRequestingPlayer) return null;

  const handleAccept = () => {
    restarGame();
    respondToPlayAgain(true); 
    clearPlayAgainRequest();

    const event = new CustomEvent('showGameBoard');
    window.dispatchEvent(event);
  };

  const handleDecline = () => {
    respondToPlayAgain(false); 
    clearPlayAgainRequest();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
              <Gamepad2 className="text-white" size={32} />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Play Again Request
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            <span className="font-semibold text-cyan-600 dark:text-cyan-400">
              {playAgainRequestingPlayer}
            </span> wants to play another game!
          </p>

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