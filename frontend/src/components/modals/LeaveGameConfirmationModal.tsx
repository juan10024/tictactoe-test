// frontend/src/components/LeaveGameConfirmationModal.tsx
import { useGameStore } from '../../store/gameStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRoomIdFromUrl } from '../../utils/urlUtils';

interface LeaveGameConfirmationModalProps {
  show: boolean;
  onClose: () => void;
}

const LeaveGameConfirmationModal = ({ show, onClose }: LeaveGameConfirmationModalProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const disconnect = useGameStore((state) => state.disconnect);
  const roomId = getRoomIdFromUrl();
  const playerName = new URLSearchParams(location.search).get('playerName') || '';

  const handleConfirmLeave = () => {
    disconnect();
    navigate(`/room/${roomId}?playerName=${encodeURIComponent(playerName)}`);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-center mb-4 text-gray-800 dark:text-gray-200">
          Do you want to leave the game?
        </h2>
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