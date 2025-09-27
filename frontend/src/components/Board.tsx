// frontend/src/components/Board.tsx
import { useGameStore } from '../store/gameStore';

interface BoardProps {
  playerName: string;
}

// Componente para la línea ganadora con animación
const WinningLine = ({ positions, boardSize = 3 }: { positions: number[]; boardSize?: number }) => {
  if (positions.length < 3) return null;

  // Calcular posición de la línea ganadora
  const [start, , end] = positions; // Eliminé 'middle' ya que no se usaba
  const cellSize = 100 / boardSize; // Tamaño de cada celda en porcentaje

  // Calcular coordenadas para la línea
  const getCoordinates = (position: number) => {
    const row = Math.floor(position / boardSize);
    const col = position % boardSize;
    // Ajustar para que esté en el centro de la celda
    return {
      x: (col + 0.5) * cellSize,
      y: (row + 0.5) * cellSize
    };
  };

  const startCoord = getCoordinates(start);
  const endCoord = getCoordinates(end);

  // Calcular la línea
  const length = Math.sqrt(
    Math.pow(endCoord.x - startCoord.x, 2) + 
    Math.pow(endCoord.y - startCoord.y, 2)
  );

  const angle = Math.atan2(endCoord.y - startCoord.y, endCoord.x - startCoord.x) * 180 / Math.PI;

  return (
    <div 
      className="absolute pointer-events-none"
      style={{
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
      }}
    >
      <div
        className="absolute bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse"
        style={{
          top: `${startCoord.y}%`,
          left: `${startCoord.x}%`,
          width: `${length}%`,
          height: '8px',
          transform: `translate(-50%, -50%) rotate(${angle}deg)`,
          transformOrigin: '0 0',
          zIndex: 10,
          boxShadow: '0 0 10px rgba(72, 187, 120, 0.8)',
          animation: 'drawLine 1s ease-in-out forwards'
        }}
      />
    </div>
  );
};

// Cell component for individual squares on the board
const Cell = ({
  value,
  onClick,
  disabled,
  isWinningCell,
}: {
  value: string;
  onClick: () => void;
  disabled: boolean;
  isWinningCell: boolean;
}) => {
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

// Main Board component
const Board = ({ playerName }: BoardProps) => {
  const gameState = useGameStore((state) => state.gameState);
  const makeMove = useGameStore((state) => state.makeMove);
  const players = useGameStore((state) => state.players);
  const winningLine = useGameStore((state) => state.winningLine);

  // Asegura el estado del tablero
  const boardState = gameState?.Board || '         ';

  // O(1) Lookup: Identificar mi símbolo en base al nombre
  let mySymbol: 'X' | 'O' | null = null;
  if (playerName) { 
      if (players.X?.name === playerName) mySymbol = 'X';
      else if (players.O?.name === playerName) mySymbol = 'O';
  }

  // Si no hay juego, la cuadrícula está inactiva.
  const isGameActive = gameState?.Status === 'in_progress';

  return (
    <div className="relative">
      <div className="grid grid-cols-3 gap-3 p-4 bg-gray-300 dark:bg-gray-950 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-4 border-cyan-500/50">
        {boardState.split('').map((cell, index) => {
          // Validación de turno
          const isMyTurn = isGameActive && mySymbol === gameState?.CurrentTurn;
          // La celda está deshabilitada si no está vacía O no es mi turno.
          const disabled = cell !== ' ' || !isMyTurn;
          const isWinningCell = winningLine ? winningLine.includes(index) : false;

          return (
            <Cell
              key={index}
              value={cell}
              onClick={() => makeMove(index)}
              disabled={disabled}
              isWinningCell={isWinningCell}
            />
          );
        })}
        {winningLine && <WinningLine positions={winningLine} />}
      </div>
      
      <style >{`
        @keyframes drawLine {
          0% {
            width: 0;
            opacity: 0;
          }
          100% {
            width: 100%;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Board;