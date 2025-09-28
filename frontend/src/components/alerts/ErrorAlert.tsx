// frontend/src/components/ErrorAlert.tsx
import { useGameStore } from '../../store/gameStore';

const ErrorAlert = () => {
  const error = useGameStore((state) => state.error);
  const resetError = useGameStore((state) => state.resetError);

  if (!error) return null;

  return (
    <div
      className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg relative mb-4 text-center"
      role="alert"
    >
      <strong className="font-bold">Error: </strong>
      <span>{error}</span>
      <button onClick={resetError} className="absolute top-0 bottom-0 right-0 px-4 py-3">
        <span>×</span>
      </button>
    </div>
  );
};

export default ErrorAlert;