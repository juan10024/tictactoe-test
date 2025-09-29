// frontend/src/services/roomService.ts

import { API_URL } from '../../config';


export interface JoinRoomRequest {
  playerName: string;
}

export interface JoinRoomResponse {
  error: boolean;
  message: string;
  game?: any;
  player?: any;
  roomId?: string;
  playerId?: number;
  playerName?: string;
}

export const joinRoom = async (roomId: string, playerName: string): Promise<JoinRoomResponse> => {
  const response = await fetch(`${API_URL}/api/rooms/join/${roomId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ playerName }),
  });

  const data: JoinRoomResponse = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to join room');
  }
  
  return data;
};