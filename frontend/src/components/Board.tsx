// frontend/src/components/Board.tsx
/*
 * Tic-Tac-Toe Board Component
 *
 * Renders the interactive 3x3 game grid. It gets the board state from the
 * Zustand store and calls the `makeMove` action when a player clicks on a cell.
 * The styling provides a clean, modern look with clear visual feedback for
 * player moves.
 */
import { useGameStore } from '../store/gameStore';

// Cell component for individual squares on the board
const Cell = ({ value, onClick }: { value: string; onClick: () => void }) => {
  const symbolClass = value === 'X'
    ? 'text-cyan-400'
    : value === 'O'
      ? 'text-rose-400'
      : '';
  return (
    <button
      onClick={onClick}
      className={`w-24 h-24 md:w-32 md:h-32 flex items-center justify-center
                  bg-gray-200 dark:bg-gray-800 rounded-lg
                  text-5xl md:text-6xl font-bold
                  transition-all duration-200 ease-in-out
                  hover:bg-gray-300 dark:hover:bg-gray-700
                  transform hover:scale-105
                  disabled:cursor-not-allowed`}
      disabled={value !== ' '}
    >
      <span className={symbolClass}>{value}</span>
    </button>
  );
};

// Main Board component
const Board = () => {
  const boardState = useGameStore((state) => state.gameState?.Board) || '         ';
  const makeMove = useGameStore((state) => state.makeMove);

  return (
    <div className="grid grid-cols-3 gap-3 p-3 bg-gray-300 dark:bg-gray-900 rounded-xl shadow-lg">
      {boardState.split('').map((cell, index) => (
        <Cell key={index} value={cell} onClick={() => makeMove(index)} />
      ))}
    </div>
  );
};

export default Board;
