// frontend/src/components/GameRoomGameView.tsx
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