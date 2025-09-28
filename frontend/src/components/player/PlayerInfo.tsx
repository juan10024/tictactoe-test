// frontend/src/components/PlayerInfo.tsx
import { useGameStore } from '../../store/gameStore';

interface PlayerInfoProps {
  playerName: string;
}

const PlayerInfo = ({ playerName }: PlayerInfoProps) => {
  const players = useGameStore((state) => state.players);
  
  // Buscar las estadísticas del jugador
  let playerStats = null;
  if (players.X?.name === playerName) {
    playerStats = players.X;
  } else if (players.O?.name === playerName) {
    playerStats = players.O;
  }

  return (
    <div className="mb-4 text-center">
      <h3 className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
        {playerName}
      </h3>
      {playerStats && (
        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
          <span>W: {playerStats.wins}</span>
          <span>L: {playerStats.losses}</span>
          <span>D: {playerStats.draws}</span>
        </div>
      )}
    </div>
  );
};

export default PlayerInfo;