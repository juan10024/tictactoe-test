// frontend/src/components/GameRoomMenuView.tsx
import GameRoomHeader from './GameRoomHeader';
import ErrorAlert from '../alerts/ErrorAlert';
import ActionButtons from '../ui/ActionButtons';
import GameStatusDisplay from './GameStatusDisplay';
import WelcomeModal from '../modals/WelcomeModal';

interface GameRoomMenuViewProps {
  roomId: string;
  playerName: string;
  onCopyRoomId: () => void;
  onPlayGame: () => void;
  onViewStats: () => void;
  onLeaveRoom: () => void;
  shouldShowContinueButton: boolean;
  welcomeModalShown: boolean;
  onCloseWelcomeModal: () => void;
}

const GameRoomMenuView = ({ 
  roomId, 
  playerName, 
  onCopyRoomId, 
  onPlayGame, 
  onViewStats, 
  onLeaveRoom, 
  shouldShowContinueButton,
  welcomeModalShown,
  onCloseWelcomeModal
}: GameRoomMenuViewProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-200 p-4">
      <div className="w-full max-w-md">
        <GameRoomHeader 
          roomId={roomId} 
          onCopyRoomId={onCopyRoomId} 
          onBackClick={() => {}} 
          showBackToHome={true} 
        />
        
        <ErrorAlert />
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-6">Game Room</h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Room ID: <span className="font-mono font-bold">{roomId}</span>
          </p>

          <ActionButtons 
            onPlayGame={onPlayGame}
            onViewStats={onViewStats}
            onLeaveRoom={onLeaveRoom}
            shouldShowContinueButton={shouldShowContinueButton}
          />

          <GameStatusDisplay />
        </div>
      </div>

      <WelcomeModal 
        playerName={playerName}
        isOpen={welcomeModalShown}
        onClose={onCloseWelcomeModal}
      />
    </div>
  );
};

export default GameRoomMenuView;