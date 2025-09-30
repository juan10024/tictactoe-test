// frontend/src/pages/PlayerStatsPage.tsx
import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import StatsHeader from '../components/stats/StatsHeader';
import PlayerStatsSummary from '../components/stats/PlayerStatsSummary';
import GameHistorySection from '../components/game/GameHistorySection';
import GeneralStatsSection from '../components/stats/GeneralStatsSection';
import { useGameStore } from '../store/gameStore';
import PlayAgainConfirmationModal from '../components/modals/PlayAgainConfirmationModal';

const PlayerStatsPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { disconnect, showPlayAgainConfirmation } = useGameStore(); 
  
  const playerName = new URLSearchParams(location.search).get('playerName') || '';

  useEffect(() => {
    if (!roomId || !playerName) {
      navigate('/');
      return;
    }

    disconnect(); 
  }, [roomId, playerName, navigate]);

  const handleBackToGame = () => {
    navigate(`/room/${roomId}?playerName=${encodeURIComponent(playerName)}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-200 p-4">
      <div className="w-full max-w-4xl">
        <StatsHeader onBackClick={handleBackToGame} />
        <PlayerStatsSummary playerName={playerName} />
        <GeneralStatsSection />
        <GameHistorySection roomId={roomId || ''} />
      </div>

      {showPlayAgainConfirmation && (
        <PlayAgainConfirmationModal />
      )}
    </div>
  );
};

export default PlayerStatsPage;