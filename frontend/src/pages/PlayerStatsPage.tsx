/*
 * file: PlayerStatsPage.tsx
 * page: PlayerStatsPage
 * description:
 *    Page that displays a player's statistics after a game session.
 *    - Shows player-specific summary and general game stats
 *    - Lists game history within the current room
 *    - Allows navigation back to the game room
 *    - Disconnects the player from the room upon entering stats view
 *    - Handles "Play Again" confirmation modal if triggered
 *
 * usage:
 *    Route definition:
 *       <Route path="/room/:roomId/stats" element={<PlayerStatsPage />} />
 */

import { useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import StatsHeader from '../components/stats/StatsHeader'
import PlayerStatsSummary from '../components/stats/PlayerStatsSummary'
import GameHistorySection from '../components/game/GameHistorySection'
import GeneralStatsSection from '../components/stats/GeneralStatsSection'
import { useGameStore } from '../store/gameStore'
import PlayAgainConfirmationModal from '../components/modals/PlayAgainConfirmationModal'

// Main Page Component

const PlayerStatsPage = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { disconnect, showPlayAgainConfirmation } = useGameStore()

  const playerName =
    new URLSearchParams(location.search).get('playerName') || ''

  // Lifecycle Effects

  /** Disconnect from room when entering stats page */
  useEffect(() => {
    if (!roomId || !playerName) {
      navigate('/')
      return
    }
    disconnect()
  }, [roomId, playerName, navigate])

  // Event Handlers

  const handleBackToGame = () => {
    navigate(`/room/${roomId}?playerName=${encodeURIComponent(playerName)}`)
  }

  // Render

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-200 p-4">
      <div className="w-full max-w-4xl">
        <StatsHeader onBackClick={handleBackToGame} />
        <PlayerStatsSummary playerName={playerName} />
        <GeneralStatsSection />
        <GameHistorySection roomId={roomId || ''} />
      </div>

      {showPlayAgainConfirmation && <PlayAgainConfirmationModal />}
    </div>
  )
}

export default PlayerStatsPage
