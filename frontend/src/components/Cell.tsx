// frontend/src/components/Cell.tsx

interface CellProps {
  value: string;
  onClick: () => void;
  disabled: boolean;
  isWinningCell: boolean;
  isCurrentTurn: boolean;
}

const Cell = ({
  value,
  onClick,
  disabled,
  isWinningCell,
  isCurrentTurn,
}: CellProps) => {
  const symbolClass = isWinningCell
    ? value === 'X'
      ? 'text-cyan-400 shadow-cyan-500/80 scale-110'
      : 'text-rose-400 shadow-rose-500/80 scale-110'
    : value === 'X'
      ? 'text-cyan-400 shadow-cyan-500/50'
      : value === 'O'
      ? 'text-rose-400 shadow-rose-500/50'
      : 'text-transparent';

  return (
    <button
      onClick={onClick}
      className={`
        w-24 h-24 md:w-32 md:h-32 flex items-center justify-center
        bg-gray-200 dark:bg-gray-800 rounded-xl
        text-5xl md:text-6xl font-extrabold
        transition-all duration-300 ease-in-out
        hover:bg-gray-300 dark:hover:bg-gray-700
        transform hover:scale-[1.02] active:scale-95
        disabled:opacity-60 disabled:cursor-not-allowed
        ${value !== ' ' ? 'shadow-inner' : 'shadow-lg hover:shadow-xl'}
        ${isWinningCell ? 'animate-pulse bg-gradient-to-br from-yellow-400/20 to-orange-500/20' : ''}
        ${isCurrentTurn ? 'ring-4 ring-cyan-400 dark:ring-cyan-500 ring-opacity-80' : ''}
      `}
      disabled={disabled}
      aria-label={`Casilla ${value === ' ' ? 'vacía' : value}`}
    >
      <span 
        className={`${symbolClass} transition-all duration-500 
                    ${value !== ' ' ? 'drop-shadow-lg' : ''}`}
      >
        {value}
      </span>
    </button>
  );
};

export default Cell;