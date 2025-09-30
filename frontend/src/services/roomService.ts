/*
 * file: roomService.ts
 * module: services
 * description:
 *    Service functions for handling room-related API interactions.
 *    - Defines request/response interfaces for joining a room
 *    - Provides `joinRoom` function to connect a player to a room
 *
 * usage:
 *    import { joinRoom } from '../services/roomService'
 *
 *    const response = await joinRoom(roomId, playerName)
 *    if (response.error) {
 *       // handle error
 *    }
 */

import { API_URL } from '../../config'

// Request/Response Interfaces

export interface JoinRoomRequest {
  playerName: string
}

export interface JoinRoomResponse {
  error: boolean
  message: string
  game?: any
  player?: any
  roomId?: string
  playerId?: number
  playerName?: string
}

// Service Functions

/**
 * Join an existing game room by roomId and playerName
 * @param roomId - The identifier of the room to join
 * @param playerName - The name of the player joining the room
 * @returns Promise<JoinRoomResponse>
 * @throws Error if response is not ok
 */
export const joinRoom = async (
  roomId: string,
  playerName: string
): Promise<JoinRoomResponse> => {
  const response = await fetch(`${API_URL}/api/rooms/join/${roomId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ playerName }),
  })

  const data: JoinRoomResponse = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to join room')
  }

  return data
}
