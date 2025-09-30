/*
 * file: statsService.ts
 * module: services
 * description:
 *    Service functions for fetching statistical data from the backend API.
 *    - General statistics across all games
 *    - Global player ranking
 *    - Game history per room
 *    - Player-specific statistics
 *
 * usage:
 *    import { fetchGeneralStats, fetchRanking, fetchGameHistory, fetchPlayerStats } from '../services/statsService'
 *
 *    const stats = await fetchGeneralStats()
 *    const ranking = await fetchRanking()
 *    const history = await fetchGameHistory(roomId)
 *    const playerStats = await fetchPlayerStats(playerName)
 */

// Dependencies
import { API_URL } from '../../config'

// Service Functions

/**
 * Fetch general game statistics across all players and rooms
 * @returns Promise<any> - General statistics data
 * @throws Error if request fails
 */
export const fetchGeneralStats = async () => {
  const response = await fetch(`${API_URL}/api/stats/general`)
  if (!response.ok) {
    throw new Error('Failed to fetch general statistics')
  }
  return response.json()
}

/**
 * Fetch global ranking of players
 * @returns Promise<any> - Ranking data
 * @throws Error if request fails
 */
export const fetchRanking = async () => {
  const response = await fetch(`${API_URL}/api/stats/ranking`)
  if (!response.ok) {
    throw new Error('Failed to fetch ranking')
  }
  return response.json()
}

/**
 * Fetch game history for a specific room
 * @param roomId - Unique identifier of the room
 * @returns Promise<any> - Game history data
 * @throws Error if request fails
 */
export const fetchGameHistory = async (roomId: string) => {
  const response = await fetch(`${API_URL}/api/rooms/history/${roomId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch game history')
  }
  return response.json()
}

/**
 * Fetch statistics for a specific player
 * @param playerName - Player name to retrieve statistics for
 * @returns Promise<any> - Player statistics data
 * @throws Error if request fails
 */
export const fetchPlayerStats = async (playerName: string) => {
  const response = await fetch(
    `${API_URL}/api/stats/player?playerName=${encodeURIComponent(playerName)}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch player statistics')
  }
  return response.json()
}
