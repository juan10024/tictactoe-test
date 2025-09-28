// frontend/src/components/stats/StatsHeader.tsx
import { ArrowLeft } from 'lucide-react';

interface StatsHeaderProps {
  onBackClick: () => void;
}

const StatsHeader = ({ onBackClick }: StatsHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <button
        onClick={onBackClick}
        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <ArrowLeft size={20} /> Back to Game
      </button>
      <h1 className="text-3xl font-bold text-center">Player Statistics</h1>
      <div className="w-32"></div>
    </div>
  );
};

export default StatsHeader;