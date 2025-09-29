/*
 * file: GameRoomHeader.tsx
 * component: GameRoomHeader
 * description:
 *     Renders the top bar of the game room. Includes navigation back to menu/home,
 *     connection status indicator, observer badge, and the ability to copy the room ID.
 */

import { useGameStore } from '../../store/gameStore';
import { ArrowLeft, Clipboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GameRoomHeaderProps {
  roomId: string;
  onCopyRoomId: () => void;
  onBackClick: () => void;
  showBackToHome?: boolean;
}

/*
 * GameRoomHeader displays the header section for a game room.
 *
 * Parameters:
 *   - roomId (string): Unique identifier of the current game room.
 *   - onCopyRoomId (function): Callback triggered when user clicks to copy the room ID.
 *   - onBackClick (function): Callback triggered when user clicks "back" (if showBackToHome is false).
 *   - showBackToHome (boolean, optional): When true, clicking back navigates to home screen instead of menu.
 *
 * Returns:
 *   - JSX.Element: Header bar with navigation, connection status, observer badge, and room ID copy button.
 */
const GameRoomHeader = ({ 
  roomId, 
  onCopyRoomId, 
  onBackClick, 
  showBackToHome = false 
}: GameRoomHeaderProps) => {
  const navigate = useNavigate();
  const isConnected = useGameStore((state) => state.isConnected);
  const isObserver = useGameStore((state) => state.isObserver);

  return (
    <div className="flex justify-between items-center mb-6">
      <button
        onClick={showBackToHome ? () => navigate('/') : onBackClick}
        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <ArrowLeft size={20} /> {showBackToHome ? 'Home' : 'Menu'}
      </button>

      <div className="flex items-center gap-2">
        <span
          className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
        ></span>
        <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
        {isObserver && (
          <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded">Observer</span>
        )}
      </div>

      <button
        onClick={onCopyRoomId}
        className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      >
        <Clipboard size={18} />
        <span className="font-mono font-bold">{roomId}</span>
      </button>
    </div>
  );
};

export default GameRoomHeader;
