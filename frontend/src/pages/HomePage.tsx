/*
 * file: HomePage.tsx
 * page: HomePage
 * description:
 *    Entry page of the application where users can:
 *    - Set their player name (stored in localStorage)
 *    - Create a new game room (with a unique ID)
 *    - Join an existing game room via a room ID
 *    Features:
 *    - Clean, modern UI with dark mode support
 *    - Input validation (player name length, required fields)
 *    - Loading states for create/join actions
 *
 * usage:
 *    Route definition:
 *       <Route path="/" element={<HomePage />} />
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { LogIn, PlusCircle } from 'lucide-react'
import { joinRoom } from '../services/roomService'

// Main Page Component

const HomePage = () => {
  // Local UI states
  const [playerName, setPlayerName] = useState(
    localStorage.getItem('playerName') || ''
  )
  const [roomId, setRoomId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Event Handlers

  /** Create a new room */
  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter a player name.')
      return
    }

    if (playerName.length > 15) {
      setError('Player name must be 15 characters or less.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const newRoomId = uuidv4().substring(0, 8)

      // Attempt to join the newly created room to validate the player name
      const response = await joinRoom(newRoomId, playerName)

      if (response.error) {
        setError(response.message)
        return
      }

      localStorage.setItem('playerName', playerName)

      // Navigate to the new room (WebSocket connection happens in GameRoom)
      navigate(`/room/${newRoomId}?playerName=${encodeURIComponent(playerName)}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create room')
    } finally {
      setIsLoading(false)
    }
  }

  /** Join an existing room */
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!playerName.trim() || !roomId.trim()) {
      setError('Please enter a player name and a room ID.')
      return
    }

    if (playerName.length > 15) {
      setError('Player name must be 15 characters or less.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await joinRoom(roomId, playerName)

      if (response.error) {
        setError(response.message)
        return
      }

      localStorage.setItem('playerName', playerName)

      // Navigate to the target room
      navigate(`/room/${roomId}?playerName=${encodeURIComponent(playerName)}`)
    } catch (err: any) {
      setError(err.message || 'Failed to join room')
    } finally {
      setIsLoading(false)
    }
  }

  // Subcomponents

  /** Placeholder company logo (SVG) */
  const CompanyLogo = () => (
    <svg
      height="60"
      width="60"
      className="text-cyan-500 dark:text-cyan-300"
      viewBox="0 0 100 100"
    >
      <path
        fill="currentColor"
        d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z M50 15 L85 32.5 L85 67.5 L50 85 L15 67.5 L15 32.5 Z"
      />
      <text
        x="55"
        y="62"
        fontSize="30"
        fill="currentColor"
        textAnchor="middle"
        fontWeight="bold"
      >
        T³
      </text>
    </svg>
  )

  // Render

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">
          <CompanyLogo />
          <span className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
            Tic-Tac-Toe
          </span>
          <span className="block text-2xl mt-2 text-gray-700 dark:text-gray-300 font-normal">
            Pro Edition
          </span>
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          The ultimate gaming experience
        </p>
      </div>

      <div className="w-full max-w-sm p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Player name input */}
        <div className="mb-6">
          <label
            htmlFor="playerName"
            className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
          >
            Player Name
          </label>
          <input
            id="playerName"
            type="text"
            value={playerName}
            onChange={(e) => {
              setPlayerName(e.target.value)
              setError('')
            }}
            placeholder="Enter your name (max 15 chars)"
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900 dark:text-white"
            maxLength={15}
          />
        </div>

        {/* Create room button */}
        <button
          onClick={handleCreateRoom}
          disabled={!playerName.trim() || isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 font-bold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-400 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                  5.291A7.962 7.962 0 014 12H0c0 
                  3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Creating...
            </span>
          ) : (
            <>
              <PlusCircle size={20} /> Create New Room
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center my-6">
          <hr className="w-full border-gray-300 dark:border-gray-600" />
          <span className="px-2 text-sm text-gray-500">OR</span>
          <hr className="w-full border-gray-300 dark:border-gray-600" />
        </div>

        {/* Join room form */}
        <form onSubmit={handleJoinRoom} className="space-y-4">
          <input
            type="text"
            value={roomId}
            onChange={(e) => {
              setRoomId(e.target.value)
              setError('')
            }}
            placeholder="Enter Room ID to join"
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={!playerName.trim() || !roomId.trim() || isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-400 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 
                    0 0 5.373 0 12h4zm2 
                    5.291A7.962 7.962 0 014 
                    12H0c0 3.042 1.135 5.824 3 
                    7.938l3-2.647z"
                  />
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
  )
}

export default HomePage
