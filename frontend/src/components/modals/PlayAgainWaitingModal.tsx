// frontend/src/components/modals/PlayAgainWaitingModal.tsx
import { memo } from 'react';

interface PlayAgainWaitingModalProps {
  opponentName: string;
  onClose: () => void;
}

const PlayAgainWaitingModal = memo(({ opponentName  }: PlayAgainWaitingModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-4 flex justify-center">
          <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-lg">...</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          Waiting for Approval
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Waiting for <span className="font-semibold text-cyan-600 dark:text-cyan-400">
            {opponentName}
          </span> to approve your request
        </p>
        
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
});

export default PlayAgainWaitingModal;