/*
 * file: LeaveGameConfirmationModal.tsx
 * component: LeaveGameConfirmationModal
 * description:
 *     Modal that asks the user to confirm whether they want to leave the current game.
 *     If confirmed, it disconnects the player from the game session, navigates back
 *     to the room URL with the player name preserved, and closes the modal.
 *
 * props:
 *   - show (boolean): Determines whether the modal is visible.
 *   - onClose (function): Callback function to close the modal without leaving the game.
 *
 * state (from store):
 *   - disconnect (function): Disconnects the current player from the WebSocket/game session.
 *
 * utilities:
 *   - getRoomIdFromUrl: Extracts the room ID from the current URL.
 */

import { useGameStore } from '../../store/gameStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRoomIdFromUrl } from '../../utils/urlUtils';

interface LeaveGameConfirmationModalProps {
  show: boolean;
  onClose: () => void;
}

const LeaveGameConfirmationModal = ({ show, onClose }: LeaveGameConfirmationModalProps) => {
  // Hooks
  const navigate = useNavigate();
  const location = useLocation();

  // Zustand store: disconnect action
  const disconnect = useGameStore((state) => state.disconnect);

  // Extract roomId and playerName from URL
  const roomId = getRoomIdFromUrl();
  const playerName = new URLSearchParams(location.search).get('playerName') || '';

  // Handles user confirmation to leave the game
  const handleConfirmLeave = () => {
    disconnect();
    navigate(`/room/${roomId}?playerName=${encodeURIComponent(playerName)}`);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-md w-full mx-4">
        {/* Modal title */}
        <h2 className="text-xl font-bold text-center mb-4 text-gray-800 dark:text-gray-200">
          Do you want to leave the game?
        </h2>

        {/* Action buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            No
          </button>
          <button
            onClick={handleConfirmLeave}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveGameConfirmationModal;
