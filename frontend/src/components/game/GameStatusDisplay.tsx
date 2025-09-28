// frontend/src/components/GameStatusDisplay.tsx
import { useGameStore } from '../../store/gameStore';

const GameStatusDisplay = () => {
  const gameState = useGameStore((state) => state.gameState);
  const isObserver = useGameStore((state) => state.isObserver);

  return (
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
  );
};

export default GameStatusDisplay;