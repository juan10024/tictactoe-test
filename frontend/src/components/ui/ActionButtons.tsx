/*
 * file: ActionButtons.tsx
 * component: ActionButtons
 * description:
 *     Renders the main action buttons available for the player in the room.
 *     Includes: Play/Continue Game, View Stats, and Leave Room.
 */

import { BarChart3, Trophy, LogOut } from 'lucide-react';

interface ActionButtonsProps {
  onPlayGame: () => void;
  onViewStats: () => void;
  onLeaveRoom: () => void;
  shouldShowContinueButton: boolean;
}

const ActionButtons = ({ 
  onPlayGame, 
  onViewStats, 
  onLeaveRoom, 
  shouldShowContinueButton 
}: ActionButtonsProps) => {
  return (
    <div className="space-y-4">
      {/* Button to start or continue a game */}
      <button
        onClick={onPlayGame}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg"
      >
        <BarChart3 size={24} />
        {shouldShowContinueButton ? 'Continue Game' : 'Play Game'}
      </button>

      {/* Button to view player statistics */}
      <button
        onClick={onViewStats}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all transform hover:scale-105 shadow-lg"
      >
        <Trophy size={24} />
        View Stats
      </button>

      {/* Button to leave the current room */}
      <button
        onClick={onLeaveRoom}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
      >
        <LogOut size={24} />
        Leave Room
      </button>
    </div>
  );
};

export default ActionButtons;
