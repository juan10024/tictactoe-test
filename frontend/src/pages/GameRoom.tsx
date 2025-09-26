// frontend/src/pages/GameRoom.tsx
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import Board from '../components/Board';
import GameInfo from '../components/GameInfo';
import { ArrowLeft, Clipboard } from 'lucide-react';

const GameRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const connect = useGameStore((state) => state.connect);
  const disconnect = useGameStore((state) => state.disconnect);
  const error = useGameStore((state) => state.error);
  const resetError = useGameStore((state) => state.resetError);
  const isConnected = useGameStore((state) => state.isConnected); 

  useEffect(() => {
    const playerName = localStorage.getItem('playerName');
    if (!roomId || !playerName) {
      navigate('/');
      return;
    }

    connect(roomId, playerName);

    return () => {
      disconnect();
    };
  }, [roomId, connect, disconnect, navigate]);

  const handleCopyRoomId = () => {
    if (roomId) {
      navigator.clipboard
        .writeText(roomId)
        .then(() => alert('Room ID copied!'))
        .catch((err) => console.error('Failed to copy ID: ', err));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
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

        <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-8">
          <Board />
          <GameInfo />
        </div>
      </div>
    </div>
  );
};

export default GameRoom;