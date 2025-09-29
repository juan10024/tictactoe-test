/*
 * file: GameRoomGameView.tsx
 * component: GameRoomGameView
 * description:
 *     Main container for the in-room game experience. Displays the game board,
 *     player/game information, error alerts, and room header with controls
 *     (copy room ID and back navigation).
 */

import { memo } from 'react';
import GameRoomHeader from './GameRoomHeader';
import ErrorAlert from '../alerts/ErrorAlert';
import Board from '../Board';
import GameInfo from './GameInfo';

interface GameRoomGameViewProps {
  roomId: string;
  playerName: string;
  isObserver: boolean;
  onCopyRoomId: () => void;
  onBackClick: () => void;
}

/*
 * GameRoomGameView renders the game room layout with header, board, stats, and alerts.
 *
 * Parameters:
 *   - roomId (string): Unique identifier for the current room.
 *   - playerName (string): Name of the player or observer.
 *   - isObserver (boolean): Whether the current user is just spectating the game.
 *   - onCopyRoomId (function): Callback triggered when user copies room ID.
 *   - onBackClick (function): Callback triggered when user navigates back to home/lobby.
 *
 * Returns:
 *   - JSX.Element: Responsive game room layout with board, stats, and actions.
 */
const GameRoomGameView = memo(({ 
  roomId, 
  playerName, 
  isObserver, 
  onCopyRoomId, 
  onBackClick 
}: GameRoomGameViewProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-200 p-4">
      <div className="w-full max-w-6xl">
        <GameRoomHeader 
          roomId={roomId} 
          onCopyRoomId={onCopyRoomId} 
          onBackClick={onBackClick} 
        />
        
        <ErrorAlert />
        
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8">
          <div className="flex flex-col items-center">
            <Board playerName={playerName} isObserver={isObserver} />
          </div>
          <GameInfo />
        </div>
      </div>
    </div>
  );
});

export default GameRoomGameView;
