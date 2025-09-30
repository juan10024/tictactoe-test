/*
 * file: ConfirmationModals.tsx
 * component: ConfirmationModals
 * description:
 *     This component centralizes all confirmation modals for the game room.
 *     It includes:
 *       - Confirmation to leave a room.
 *       - Confirmation to start a game when invited by an opponent.
 *       - Confirmation to leave an active game.
 *
 * props:
 *   - showLeaveModal (boolean): Controls the display of the leave-room modal.
 *   - onLeaveModalClose (function): Callback to close the leave-room modal.
 *   - onLeaveRoom (function): Callback to confirm leaving the room.
 *   - showLeaveGameModal (boolean): Controls the display of the leave-game modal.
 *   - onLeaveGameModalClose (function): Callback to close the leave-game modal.
 *   - onConfirmLeaveGame (function): Callback to confirm leaving the game.
 *
 * state (from store):
 *   - showConfirmationModal (boolean): Controls game start confirmation modal.
 *   - confirmationOpponent (string): Opponent name requesting to start the game.
 *   - confirmGameStart (function): Store action to accept or reject game start.
 */

import { useGameStore } from '../../store/gameStore';
import { X, Check } from 'lucide-react';

interface ConfirmationModalsProps {
  showLeaveModal: boolean;
  onLeaveModalClose: () => void;
  onLeaveRoom: () => void;
  showLeaveGameModal: boolean;
  onLeaveGameModalClose: () => void;
  onConfirmLeaveGame: () => void;
}

const ConfirmationModals = ({ 
  showLeaveModal, 
  onLeaveModalClose, 
  onLeaveRoom,
  showLeaveGameModal,
  onLeaveGameModalClose,
  onConfirmLeaveGame
}: ConfirmationModalsProps) => {
  // Zustand store selectors
  const showConfirmationModal = useGameStore((state) => state.showConfirmationModal);
  const confirmationOpponent = useGameStore((state) => state.confirmationOpponent);
  const confirmGameStart = useGameStore((state) => state.confirmGameStart);

  return (
    <>
      {/* Modal to confirm leaving the room */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Leave Room?</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to leave this room? You'll lose your connection to the game.
              </p>

              <div className="flex justify-center gap-4">
                <button
                  onClick={onLeaveModalClose}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onLeaveRoom}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal to confirm starting the game */}
      {showConfirmationModal && confirmationOpponent && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Game Start Confirmation</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {confirmationOpponent} wants to start the game
              </p>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => confirmGameStart(false)}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                >
                  <X size={20} /> Decline
                </button>
                <button
                  onClick={() => confirmGameStart(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  <Check size={20} /> Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal to confirm leaving the active game */}
      {showLeaveGameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Leave Game?</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Do you want to leave the game?
              </p>

              <div className="flex justify-center gap-4">
                <button
                  onClick={onLeaveGameModalClose}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirmLeaveGame}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConfirmationModals;
