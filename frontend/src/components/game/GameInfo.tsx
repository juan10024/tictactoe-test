// frontend/src/components/GameInfo.tsx
import { memo, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Trophy, BarChart3 } from 'lucide-react';

const GameInfo = memo(() => {
  const gameState = useGameStore((state) => state.gameState);
  const players = useGameStore((state) => state.players);

  const currentPlayerName = useMemo(() => {
    if (!gameState) return '';
    return gameState.CurrentTurn === 'X' 
      ? players.X?.name || 'Player X'
      : players.O?.name || 'Player O';
  }, [gameState, players]);

  if (!gameState) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 min-w-[320px] h-fit">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Connecting to game...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 min-w-[320px] h-fit">
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
                <div>{players.X?.losses || 0}</div>
              </div>
              <div className="text-center bg-yellow-100 dark:bg-yellow-800/50 p-1 rounded">
                <div className="font-semibold">D</div>
                <div>{players.X?.draws || 0}</div>
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
                <div>{players.O?.losses || 0}</div>
              </div>
              <div className="text-center bg-yellow-100 dark:bg-yellow-800/50 p-1 rounded">
                <div className="font-semibold">D</div>
                <div>{players.O?.draws || 0}</div>
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
    </div>
  );
});

export default GameInfo;