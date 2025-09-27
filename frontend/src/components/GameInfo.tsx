// frontend/src/components/GameInfo.tsx
import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { RotateCcw, Trophy, Users, BarChart3 } from 'lucide-react';

interface PlayerStats {
  name: string;
  wins: number;
  losses: number;
  draws: number;
  totalPoints: number;
}

const GameInfo = () => {
  const gameState = useGameStore((state) => state.gameState);
  const players = useGameStore((state) => state.players);
  const resetGame = useGameStore((state) => state.resetGame);
  const winningLine = useGameStore((state) => state.winningLine);

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [playerStats, setPlayerStats] = useState<{ X: PlayerStats | null; O: PlayerStats | null }>({ X: null, O: null });

  // Calcular estadísticas de los jugadores basadas en el estado actual
  useEffect(() => {
    if (players.X || players.O) {
      const newXStats: PlayerStats = {
        name: players.X?.name || 'Player X',
        wins: players.X?.wins || 0,
        losses: 0, // Se calculará cuando haya partidas
        draws: 0, // Se calculará cuando haya empates
        totalPoints: (players.X?.wins || 0) * 2 // 2 puntos por victoria
      };

      const newOStats: PlayerStats = {
        name: players.O?.name || 'Player O',
        wins: players.O?.wins || 0,
        losses: 0, // Se calculará cuando haya partidas
        draws: 0, // Se calculará cuando haya empates
        totalPoints: (players.O?.wins || 0) * 2 // 2 puntos por victoria
      };

      setPlayerStats({ X: newXStats, O: newOStats });
    }
  }, [players]);

  // Detectar fin del juego y mostrar modal
  useEffect(() => {
    if (gameState && gameState.Status === 'finished') {
      let message = '';
      
      if (gameState.WinnerID) {
        const winnerSymbol = gameState.WinnerID === gameState.PlayerXID ? 'X' : 'O';
        const winnerName = winnerSymbol === 'X' 
          ? players.X?.name || 'Player X' 
          : players.O?.name || 'Player O';
        message = `${winnerName} Wins!`;
      } else {
        message = "It's a TIE!!";
      }
      
      setModalMessage(message);
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [gameState, players, winningLine]);

  const handlePlayAgain = () => {
    resetGame();
    setShowModal(false);
  };

  if (!gameState) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 min-w-[320px]">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Connecting to game...
        </div>
      </div>
    );
  }

  const currentPlayerName = gameState.CurrentTurn === 'X' 
    ? players.X?.name 
    : players.O?.name;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 min-w-[320px]">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-center mb-4 flex items-center justify-center gap-2">
          <BarChart3 className="text-cyan-500" size={24} />
          Game Stats
        </h2>
        
        <div className="space-y-4">
          {/* Player X Stats */}
          <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-lg border border-cyan-200 dark:border-cyan-800">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold">X</div>
                <span className="font-semibold text-cyan-800 dark:text-cyan-200">
                  {players.X?.name || 'Player X'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="text-yellow-500" size={16} />
                <span className="font-bold text-cyan-700 dark:text-cyan-300">
                  {players.X?.wins || 0}
                </span>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div className="text-center bg-cyan-100 dark:bg-cyan-800/50 p-1 rounded">
                <div className="font-semibold">W</div>
                <div>{players.X?.wins || 0}</div>
              </div>
              <div className="text-center bg-red-100 dark:bg-red-800/50 p-1 rounded">
                <div className="font-semibold">L</div>
                <div>{playerStats.X?.losses || 0}</div>
              </div>
              <div className="text-center bg-yellow-100 dark:bg-yellow-800/50 p-1 rounded">
                <div className="font-semibold">D</div>
                <div>{playerStats.X?.draws || 0}</div>
              </div>
            </div>
          </div>
          
          {/* Player O Stats */}
          <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30 rounded-lg border border-rose-200 dark:border-rose-800">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold">O</div>
                <span className="font-semibold text-rose-800 dark:text-rose-200">
                  {players.O?.name || 'Player O'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="text-yellow-500" size={16} />
                <span className="font-bold text-rose-700 dark:text-rose-300">
                  {players.O?.wins || 0}
                </span>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div className="text-center bg-cyan-100 dark:bg-cyan-800/50 p-1 rounded">
                <div className="font-semibold">W</div>
                <div>{players.O?.wins || 0}</div>
              </div>
              <div className="text-center bg-red-100 dark:bg-red-800/50 p-1 rounded">
                <div className="font-semibold">L</div>
                <div>{playerStats.O?.losses || 0}</div>
              </div>
              <div className="text-center bg-yellow-100 dark:bg-yellow-800/50 p-1 rounded">
                <div className="font-semibold">D</div>
                <div>{playerStats.O?.draws || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <p className="text-lg font-semibold">
            Status: 
            <span className={`
              ml-2 px-3 py-1 rounded-full text-sm font-bold
              ${gameState.Status === 'waiting' ? 'bg-yellow-100 text-yellow-800' : 
                gameState.Status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                'bg-green-100 text-green-800'}
            `}>
              {gameState.Status === 'waiting' ? 'Waiting for players' : 
               gameState.Status === 'in_progress' ? 'In Progress' : 
               'Finished'}
            </span>
          </p>
        </div>

        {gameState.Status === 'in_progress' && (
          <div className="text-center">
            <p className="text-lg font-semibold">
              Current Turn:
              <span className={`
                ml-2 px-4 py-2 rounded-lg text-xl font-bold
                ${gameState.CurrentTurn === 'X' ? 
                  'bg-cyan-100 text-cyan-800' : 
                  'bg-rose-100 text-rose-800'}
              `}>
                {gameState.CurrentTurn}
              </span>
            </p>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {currentPlayerName}'s turn
            </p>
          </div>
        )}
      </div>

      {/* Modal para mostrar el resultado del juego */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full transform transition-all duration-300 scale-100">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                {modalMessage.includes('Wins') ? (
                  <Trophy className="text-yellow-500" size={64} />
                ) : (
                  <Users className="text-yellow-500" size={64} />
                )}
              </div>
              
              <h3 className="text-3xl font-bold mb-2">
                {modalMessage.includes('Wins') ? (
                  <span className="text-green-600 dark:text-green-400">{modalMessage}</span>
                ) : (
                  <span className="text-yellow-600 dark:text-yellow-400">{modalMessage}</span>
                )}
              </h3>
              
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={handlePlayAgain}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg"
                >
                  <RotateCcw size={20} />
                  Play Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameInfo;