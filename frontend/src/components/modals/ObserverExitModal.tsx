/*
 * file: ObserverExitModal.tsx
 * component: ObserverExitModal
 * description:
 *     Modal that appears for observers when a game ends and no rematch is initiated.
 *     Allows the observer to choose whether to stay in the room (to watch future games)
 *     or leave the room and return to the main menu.
 *     This improves the observer experience by providing clear navigation options
 *     after a game concludes.
 *
 * props:
 *   - isOpen (boolean): Controls visibility of the modal.
 *   - onStay (function): Callback when observer chooses to stay in the room.
 *   - onLeave (function): Callback when observer chooses to leave the room.
 *
 * events:
 *   - Calls onStay() to remain in the current room view.
 *   - Calls onLeave() to disconnect and navigate back to the main menu.
 */

import { memo } from 'react';
import { Eye, DoorOpen } from 'lucide-react';

interface ObserverExitModalProps {
  isOpen: boolean;
  onStay: () => void;
  onLeave: () => void;
}

const ObserverExitModal = memo(({ isOpen, onStay, onLeave }: ObserverExitModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <div className="text-center">
          {/* Icon & visual indicator */}
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Eye className="text-white" size={32} />
            </div>
          </div>
          
          {/* Modal title */}
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Game Finished
          </h3>
          
          {/* Message */}
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The match has ended. Would you like to stay and watch future games?
          </p>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onLeave}
              className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <DoorOpen size={18} />
              Leave
            </button>
            <button
              onClick={onStay}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-indigo-600 transition-all shadow-md"
            >
              Stay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ObserverExitModal;