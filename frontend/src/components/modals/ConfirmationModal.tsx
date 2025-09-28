// frontend/src/components/ConfirmationModals.tsx
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
  const showConfirmationModal = useGameStore((state) => state.showConfirmationModal);
  const confirmationOpponent = useGameStore((state) => state.confirmationOpponent);
  const confirmGameStart = useGameStore((state) => state.confirmGameStart);

  return (
    <>
      {/* Modal para confirmar salida de sala */}
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

      {/* Modal de confirmación de inicio de juego */}
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

      {/* Modal de confirmación para salir del juego */}
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