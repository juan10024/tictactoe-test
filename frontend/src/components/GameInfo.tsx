// frontend/src/components/GameInfo.tsx
/*
 * Game Information Panel Component (Corrected)
 *
 * Major Corrections:
 * - Fixed type-only import for `Player` to comply with `verbatimModuleSyntax`.
 * - Refactored the `PlayerDisplay` component:
 * - It now accepts a single prop `player` which can be `Player | null`.
 * - It correctly handles the `null` case (when a player hasn't joined yet).
 * - It derives the symbol and other info directly from the `player` object,
 * removing redundant props and fixing all related type errors.
 */
import { useGameStore } from '../store/gameStore';
import type { Player } from '../store/gameStore'; // Corrected type-only import
import { Award, User, Circle, X } from 'lucide-react';

// Simplified and type-safe component for displaying a player
const PlayerDisplay = ({ player }: { player: Player | null }) => {
  if (!player) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse">
        <User size={24} className="text-gray-500" />
        <span className="text-gray-500">Waiting for Player...</span>
      </div>
    );
  }
  
  const SymbolIcon = player.symbol === 'X' ? X : Circle;
  const color = player.symbol === 'X' ? 'text-cyan-400' : 'text-rose-400';

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-200 dark:bg-gray-700 rounded-lg">
      <SymbolIcon size={24} className={color} />
      <div>
        <p className="font-bold text-lg">{player.name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Wins: {player.wins}</p>
      </div>
    </div>
  );
};


const GameInfo = () => {
  const gameState = useGameStore((state) => state.gameState);
  const players = useGameStore((state) => state.players);

  const getStatusMessage = () => {
    if (!gameState) return 'Loading...';

    switch (gameState.Status) {
      case 'waiting':
        return 'Waiting for another player...';
      case 'in_progress':
        const turnPlayerName = gameState.CurrentTurn === 'X' ? players.X?.name : players.O?.name;
        return `It's ${turnPlayerName || 'a player'}'s turn (${gameState.CurrentTurn})`;
      case 'finished':
        if (gameState.WinnerID) {
          const winnerName = gameState.WinnerID === players.X?.id ? players.X?.name : players.O?.name;
          return (
            <div className="flex items-center gap-2 text-yellow-400">
              <Award size={24} /> {winnerName} wins!
            </div>
          );
        }
        return "It's a draw!";
      default:
        return 'Game status is unknown.';
    }
  };

  return (
    <div className="w-full md:w-80 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-center border-b pb-3 border-gray-300 dark:border-gray-600">Game Info</h2>
      
      <div className="text-center text-xl font-semibold p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
        {getStatusMessage()}
      </div>

      <div className="space-y-4">
        <PlayerDisplay player={players.X} />
        <PlayerDisplay player={players.O} />
      </div>
    </div>
  );
};

export default GameInfo;

