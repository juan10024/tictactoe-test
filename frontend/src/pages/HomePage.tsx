// frontend/src/pages/HomePage.tsx
/*
 * Home Page Component
 *
 * This is the application's entry point for users. It allows them to:
 * - Set their player name (persisted in localStorage).
 * - Create a new game room (generates a unique ID).
 * - Join an existing game room by entering an ID.
 * Features a clean, modern UI with theme toggling capabilities.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useThemeStore } from '../hooks/useTheme';
import { Sun, Moon, LogIn, PlusCircle } from 'lucide-react';
import { joinRoom } from '../services/roomService'; // Asegúrate de tener esta función

const HomePage = () => {
  const [playerName, setPlayerName] = useState(localStorage.getItem('playerName') || '');
  const [roomId, setRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter a player name.');
      return;
    }
    
    // Validación de longitud del nombre
    if (playerName.length > 15) {
      setError('Player name must be 15 characters or less.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const newRoomId = uuidv4().substring(0, 8);
      
      // Intentar unirse a la sala recién creada para validar el nombre
      const response = await joinRoom(newRoomId, playerName);
      
      if (response.error) {
        setError(response.message);
        return;
      }

      localStorage.setItem('playerName', playerName);
      // Navegar a la sala - la conexión WebSocket se hará en la página de la sala
      navigate(`/room/${newRoomId}?playerName=${encodeURIComponent(playerName)}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create room');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !roomId.trim()) {
      setError('Please enter a player name and a room ID.');
      return;
    }
    
    // Validación de longitud del nombre
    if (playerName.length > 15) {
      setError('Player name must be 15 characters or less.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Validar el nombre antes de unirse
      const response = await joinRoom(roomId, playerName);
      
      if (response.error) {
        setError(response.message);
        return;
      }

      localStorage.setItem('playerName', playerName);
      // Navegar a la sala - la conexión WebSocket se hará en la página de la sala
      navigate(`/room/${roomId}?playerName=${encodeURIComponent(playerName)}`);
    } catch (err: any) {
      setError(err.message || 'Failed to join room');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Placeholder for the company logo
  const CompanyLogo = () => (
    <svg height="60" width="60" className="text-cyan-500 dark:text-cyan-300" viewBox="0 0 100 100">
      <path fill="currentColor" d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z M50 15 L85 32.5 L85 67.5 L50 85 L15 67.5 L15 32.5 Z" />
      <text x="55" y="62" fontSize="30" fill="currentColor" color='white' textAnchor="middle" fontWeight="bold">T³</text>
    </svg>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <div className="absolute top-4 right-4">
        <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
          {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </div>
      
      <div className="text-center">
        <CompanyLogo />
        <h1 className="text-5xl font-bold mt-4">Tic-Tac-Toe</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Pro Edition</p>
      </div>

      <div className="w-full max-w-sm p-8 mt-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="mb-6">
          <label htmlFor="playerName" className="block text-sm font-medium mb-2">Player Name</label>
          <input
            id="playerName"
            type="text"
            value={playerName}
            onChange={(e) => {
              setPlayerName(e.target.value);
              setError(''); // Limpiar error cuando cambia el nombre
            }}
            placeholder="Enter your name (max 15 chars)"
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            maxLength={15}
          />
        </div>

        <button
          onClick={handleCreateRoom}
          disabled={!playerName.trim() || isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 font-bold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-400 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </span>
          ) : (
            <>
              <PlusCircle size={20} /> Create New Room
            </>
          )}
        </button>

        <div className="flex items-center my-6">
          <hr className="w-full border-gray-300 dark:border-gray-600"/>
          <span className="px-2 text-sm text-gray-500">OR</span>
          <hr className="w-full border-gray-300 dark:border-gray-600"/>
        </div>

        <form onSubmit={handleJoinRoom} className="space-y-4">
          <input
            type="text"
            value={roomId}
            onChange={(e) => {
              setRoomId(e.target.value);
              setError(''); // Limpiar error cuando cambia el ID
            }}
            placeholder="Enter Room ID to join"
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={!playerName.trim() || !roomId.trim() || isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-400 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Joining...
              </span>
            ) : (
              <>
                <LogIn size={20} /> Join Room
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HomePage;