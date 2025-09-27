// frontend/src/pages/GameRoom.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import Board from '../components/Board';
import GameInfo from '../components/GameInfo';
import { ArrowLeft, Clipboard, Trophy, BarChart3, LogOut, Check, X } from 'lucide-react';

const GameRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const connect = useGameStore((state) => state.connect);
  const disconnect = useGameStore((state) => state.disconnect);
  const error = useGameStore((state) => state.error);
  const resetError = useGameStore((state) => state.resetError);
  const isConnected = useGameStore((state) => state.isConnected);
  const gameState = useGameStore((state) => state.gameState);
  const isObserver = useGameStore((state) => state.isObserver);
  const showConfirmationModal = useGameStore((state) => state.showConfirmationModal);
  const confirmationOpponent = useGameStore((state) => state.confirmationOpponent);
  const confirmGameStart = useGameStore((state) => state.confirmGameStart);

  const [showMenu, setShowMenu] = useState(true);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  useEffect(() => {
    const playerName = new URLSearchParams(location.search).get('playerName');
    if (!roomId || !playerName) {
      navigate('/');
      return;
    }

    connect(roomId, playerName);

    return () => {
      disconnect();
    };
  }, [roomId, connect, disconnect, navigate, location]);

  const handleCopyRoomId = () => {
    if (roomId) {
      navigator.clipboard
        .writeText(roomId)
        .then(() => alert('Room ID copied!'))
        .catch((err) => console.error('Failed to copy ID: ', err));
    }
  };

  const handleLeaveRoom = () => {
    disconnect();
    navigate('/');
  };

  const handlePlayGame = () => {
    setShowMenu(false);
  };

  const handleViewStats = () => {
    // Aquí puedes navegar a una página de estadísticas o abrir un modal
    alert('Ver estadísticas - Esta funcionalidad se implementaría aquí');
  };

  const playerName = new URLSearchParams(location.search).get('playerName') || '';

  if (showMenu) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-200 p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} /> Home
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
              onClick={handleCopyRoomId}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <Clipboard size={18} />
              <span className="font-mono font-bold">{roomId}</span>
            </button>
          </div>

          {error && (
            <div
              className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg relative mb-4 text-center"
              role="alert"
            >
              <strong className="font-bold">Error: </strong>
              <span>{error}</span>
              <button onClick={resetError} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                <span>×</span>
              </button>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-center mb-6">Game Room</h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
              Room ID: <span className="font-mono font-bold">{roomId}</span>
            </p>

            <div className="space-y-4">
              <button
                onClick={handlePlayGame}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg"
              >
                <BarChart3 size={24} />
                Play Game
              </button>

              <button
                onClick={handleViewStats}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all transform hover:scale-105 shadow-lg"
              >
                <Trophy size={24} />
                View Stats
              </button>

              <button
                onClick={() => setShowLeaveModal(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
              >
                <LogOut size={24} />
                Leave Room
              </button>
            </div>

            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold mb-2">Game Status:</h3>
              <p className="text-center">
                {isObserver ? (
                  <span className="text-yellow-600">You are an observer</span>
                ) : gameState?.Status === 'waiting' 
                  ? 'Waiting for opponent...' 
                  : gameState?.Status === 'in_progress' 
                  ? 'Game in progress'
                  : 'Game finished'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal para confirmar salida */}
        {showLeaveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Leave Room?</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Are you sure you want to leave this room? You'll lose your connection to the game.
                </p>
                
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setShowLeaveModal(false)}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLeaveRoom}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                  >
                    Leave
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación de inicio de juego */}
        {showConfirmationModal && confirmationOpponent && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Game Start Confirmation</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {confirmationOpponent} wants to start the game
                </p>
                
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => confirmGameStart(false)}
                    className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                  >
                    <X size={20} /> Decline
                  </button>
                  <button
                    onClick={() => confirmGameStart(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                  >
                    <Check size={20} /> Accept
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vista del juego
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-200 p-4">
      <div className="w-full max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setShowMenu(true)}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} /> Menu
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
            onClick={handleCopyRoomId}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <Clipboard size={18} />
            <span className="font-mono font-bold">{roomId}</span>
          </button>
        </div>

        {error && (
          <div
            className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg relative mb-4 text-center"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span>{error}</span>
            <button onClick={resetError} className="absolute top-0 bottom-0 right-0 px-4 py-3">
              <span>×</span>
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8">
          <Board playerName={playerName} isObserver={isObserver} />
          <GameInfo />
        </div>
      </div>
    </div>
  );
};

export default GameRoom;