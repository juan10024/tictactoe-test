// frontend/src/components/Board.tsx
import React, { memo } from 'react';
import { useGameStore } from '../store/gameStore';
import Cell from './Cell';
import WinningLine from './WinningLine';

interface BoardProps {
  playerName: string;
  isObserver?: boolean;
}

const Board = memo(({ playerName, isObserver = false }: BoardProps) => {
  const gameState = useGameStore((state) => state.gameState);
  const makeMove = useGameStore((state) => state.makeMove);
  const players = useGameStore((state) => state.players);
  const winningLine = useGameStore((state) => state.winningLine);

  // Memoizar el estado del tablero para evitar re-renders innecesarios
  const boardState = React.useMemo(() => {
    return gameState?.Board || '         ';
  }, [gameState?.Board]);

  // Memoizar mi símbolo para evitar cálculos repetidos
  const mySymbol = React.useMemo((): 'X' | 'O' | null => {
    if (isObserver || !playerName) return null;
    if (players.X?.name === playerName) return 'X';
    if (players.O?.name === playerName) return 'O';
    return null;
  }, [players, playerName, isObserver]);

  const isGameActive = gameState?.Status === 'in_progress';

  return (
    <div className="relative">
      <div className="grid grid-cols-3 gap-3 p-4 bg-gray-300 dark:bg-gray-950 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-4 border-cyan-500/50">
        {boardState.split('').map((cell, index) => {
          const isMyTurn = isGameActive && !isObserver && mySymbol === gameState?.CurrentTurn;
          const disabled = cell !== ' ' || !isMyTurn || isObserver;

          return (
            <Cell
              key={index}
              value={cell}
              onClick={() => makeMove(index)}
              disabled={disabled}
              isWinningCell={winningLine ? winningLine.includes(index) : false}
              isCurrentTurn={isGameActive && !isObserver && gameState.CurrentTurn === mySymbol}
            />
          );
        })}
        {winningLine && <WinningLine positions={winningLine} />}
      </div>
      
      {isObserver && (
        <div className="mt-4 text-center text-yellow-600 font-semibold">
          You are observing this game
        </div>
      )}
    </div>
  );
});

export default Board;