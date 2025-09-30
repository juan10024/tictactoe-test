/*
 * file: WelcomeModal.tsx
 * component: WelcomeModal
 * description:
 *     Modal shown when a player enters a room for the first time or as a returning player.
 *     Displays a welcome message including the player's name and a button to proceed.
 *
 * props:
 *   - playerName (string): Name of the current player, displayed in the welcome message.
 *   - isOpen (boolean): Controls whether the modal is visible.
 *   - onClose (function): Callback triggered when the player clicks "Continue".
 */

import { useGameStore } from '../../store/gameStore';

interface WelcomeModalProps {
  playerName: string;
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeModal = ({ playerName, isOpen, onClose }: WelcomeModalProps) => {
  const isReturningPlayer = useGameStore((state) => state.isReturningPlayer);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-md w-full mx-4">
        
        <h2 className="text-xl font-bold text-center mb-4 text-gray-800 dark:text-gray-200">
          {isReturningPlayer
            ? `Welcome Back to a New Room: ${playerName}`
            : `Welcome to the Room: ${playerName}`}
        </h2>

        
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default WelcomeModal;
