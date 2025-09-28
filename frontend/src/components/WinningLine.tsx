// frontend/src/components/WinningLine.tsx

interface WinningLineProps {
  positions: number[];
  boardSize?: number;
}

const WinningLine = ({ positions, boardSize = 3 }: WinningLineProps) => {
  if (positions.length < 3) return null;

  const [start, , end] = positions;
  const cellSize = 100 / boardSize;

  const getCoordinates = (position: number) => {
    const row = Math.floor(position / boardSize);
    const col = position % boardSize;
    return {
      x: (col + 0.5) * cellSize,
      y: (row + 0.5) * cellSize
    };
  };

  const startCoord = getCoordinates(start);
  const endCoord = getCoordinates(end);

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
      
      <style>{`
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

export default WinningLine;