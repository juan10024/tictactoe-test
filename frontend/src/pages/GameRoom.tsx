// frontend/src/pages/GameRoom.tsx
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import GameRoomMenuView from '../components/game/GameRoomMenuView';
import GameRoomGameView from '../components/game/GameRoomGameView';
import ConfirmationModals from '../components/modals/ConfirmationModal';
import EndGameModal from '../components/modals/EndGameModal';
import PlayAgainConfirmationModal from '../components/modals/PlayAgainConfirmationModal';
import ObserverExitModal from '../components/modals/ObserverExitModal';

const GameRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const connect = useGameStore((state) => state.connect);
  const disconnect = useGameStore((state) => state.disconnect);
  const gameState = useGameStore((state) => state.gameState);
  const showEndGameModal = useGameStore((state) => state.showEndGameModal);
  const showPlayAgainConfirmation = useGameStore((state) => state.showPlayAgainConfirmation);

  const [welcomeModalShown, setWelcomeModalShown] = useState(false);
  const isObserverFromStore = useGameStore.getState().isObserver;
  const [showMenu, setShowMenu] = useState(!isObserverFromStore);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showLeaveGameModal, setShowLeaveGameModal] = useState(false);
  const [showObserverExitModal, setShowObserverExitModal] = useState(false);

  const playerName = new URLSearchParams(location.search).get('playerName') || '';

  useEffect(() => {
    if (!roomId || !playerName) {
      navigate('/');
      return;
    }

    connect(roomId, playerName);

    return () => {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/stats')) {
        disconnect();
      }
    };
  }, [roomId, connect, disconnect, navigate, location, playerName]);

  useEffect(() => {
    const handleShowGameMenu = () => {
      setShowMenu(true);
    };

    window.addEventListener('showGameMenu', handleShowGameMenu);
    return () => window.removeEventListener('showGameMenu', handleShowGameMenu);
  }, []);

  useEffect(() => {
    const handleShowGameBoard = () => {
      setShowMenu(false);
    };

    window.addEventListener('showGameBoard', handleShowGameBoard);
    return () => window.removeEventListener('showGameBoard', handleShowGameBoard);
  }, []);

  useEffect(() => {
    const currentGameState = useGameStore.getState().gameState;
    if (showMenu && currentGameState?.status === 'in_progress') {
      setShowMenu(false);
    }
  }, [showMenu]);

  // Mostrar modal de bienvenida después de la conexión
  useEffect(() => {
    const isConnected = useGameStore.getState().isConnected;
    if (isConnected && !welcomeModalShown) {
      if (!sessionStorage.getItem('welcomeModalShown')) {
        const timer = setTimeout(() => {
          setWelcomeModalShown(true);
          sessionStorage.setItem('welcomeModalShown', 'true');
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [welcomeModalShown]);

  useEffect(() => {
    const { isObserver, gameState } = useGameStore.getState();
    if (isObserver) {
      // Observadores van directo al tablero
      setShowMenu(false);
    } else if (gameState?.status === 'in_progress') {
      // Jugadores activos entran al juego si ya está en progreso
      setShowMenu(false);
    }
  }, []);

  // Nuevo useEffect para observadores
  useEffect(() => {
    const unsubscribe = useGameStore.subscribe((state) => {
      if (state.isObserver && state.gameState?.status === 'finished') {
        // Solo mostrar si no hay solicitud de "jugar de nuevo" en curso
        if (!state.showPlayAgainConfirmation && !state.playAgainRequestingPlayer) {
          const timer = setTimeout(() => {
            setShowObserverExitModal(true);
          }, 1000);
          return () => clearTimeout(timer);
        }
      } else {
        setShowObserverExitModal(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCopyRoomId = useCallback(() => {
    if (roomId) {
      navigator.clipboard
        .writeText(roomId)
        .then(() => alert('Room ID copied!'))
        .catch((err) => console.error('Failed to copy ID: ', err));
    }
  }, [roomId]);

  const handleLeaveRoom = useCallback(() => {
    disconnect();
    navigate('/');
  }, [disconnect, navigate]);

  const handlePlayGame = () => {
    const gameState = useGameStore.getState().gameState;
    const playerName = new URLSearchParams(location.search).get('playerName') || '';

    // Si el juego está terminado, enviar solicitud desde el menú
    if (gameState?.status === 'finished') {
      useGameStore.getState().setPlayAgainRequest(playerName);
    }

    setTimeout(() => {
      setShowMenu(false);
    }, 50);
  };

  const handleViewStats = useCallback(() => {
    navigate(`/room/${roomId}/stats?playerName=${encodeURIComponent(playerName)}`);
  }, [roomId, navigate, playerName]);

  const handleCloseWelcomeModal = useCallback(() => {
    setWelcomeModalShown(false);
    sessionStorage.setItem('welcomeModalShown', 'true');
  }, []);

  const handleConfirmLeaveGame = useCallback(() => {
    setShowLeaveGameModal(false);
    setShowMenu(true);
  }, []);

  const handleCancelLeaveGame = useCallback(() => {
    setShowLeaveGameModal(false);
  }, []);

  const handleObserverStay = useCallback(() => {
    setShowObserverExitModal(false);
  }, []);

  const handleObserverLeave = useCallback(() => {
    disconnect();
    navigate('/');
  }, [disconnect, navigate]);

  // Determinar si mostrar "Play Game" o "Continue Game"
  const shouldShowContinueButton = useMemo(() => {
    return !!(gameState &&
      gameState.status === 'in_progress' &&
      showMenu);
  }, [gameState, showMenu]);

  const isObserver = useGameStore((state) => state.isObserver);

  if (showMenu) {
    return (
      <>
        <GameRoomMenuView
          roomId={roomId || ''}
          playerName={playerName}
          onCopyRoomId={handleCopyRoomId}
          onPlayGame={handlePlayGame}
          onViewStats={handleViewStats}
          onLeaveRoom={handleLeaveRoom}
          shouldShowContinueButton={shouldShowContinueButton}
          welcomeModalShown={welcomeModalShown}
          onCloseWelcomeModal={handleCloseWelcomeModal}
        />
        <ConfirmationModals
          showLeaveModal={showLeaveModal}
          onLeaveModalClose={() => setShowLeaveModal(false)}
          onLeaveRoom={handleLeaveRoom}
          showLeaveGameModal={showLeaveGameModal}
          onLeaveGameModalClose={handleCancelLeaveGame}
          onConfirmLeaveGame={handleConfirmLeaveGame}
        />

        {showPlayAgainConfirmation && <PlayAgainConfirmationModal />}
        {showObserverExitModal && (
          <ObserverExitModal
            isOpen={showObserverExitModal}
            onStay={handleObserverStay}
            onLeave={handleObserverLeave}
          />
        )}

      </>
    );
  }

  return (
    <>
      <GameRoomGameView
        roomId={roomId || ''}
        playerName={playerName}
        isObserver={isObserver}
        onCopyRoomId={handleCopyRoomId}
        onBackClick={() => setShowLeaveGameModal(true)}
      />
      <ConfirmationModals
        showLeaveModal={showLeaveModal}
        onLeaveModalClose={() => setShowLeaveModal(false)}
        onLeaveRoom={handleLeaveRoom}
        showLeaveGameModal={showLeaveGameModal}
        onLeaveGameModalClose={handleCancelLeaveGame}
        onConfirmLeaveGame={handleConfirmLeaveGame}
      />


      {showEndGameModal && <EndGameModal playerName={playerName} />}
      {showPlayAgainConfirmation && <PlayAgainConfirmationModal />}
      {showObserverExitModal && (
        <ObserverExitModal
          isOpen={showObserverExitModal}
          onStay={handleObserverStay}
          onLeave={handleObserverLeave}
        />
      )}
    </>
  );
};

export default GameRoom;