// frontend/src/services/statsService.ts
import { API_URL } from "../../config"; 

export const fetchGeneralStats = async () => {
  const response = await fetch(`${API_URL}/api/stats/general`);
  if (!response.ok) {
    throw new Error('Failed to fetch general statistics');
  }
  return response.json();
};

export const fetchRanking = async () => {
  const response = await fetch(`${API_URL}/api/stats/ranking`);
  if (!response.ok) {
    throw new Error('Failed to fetch ranking');
  }
  return response.json();
};

export const fetchGameHistory = async (roomId: string) => {
  const response = await fetch(`${API_URL}/api/rooms/history/${roomId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch game history');
  }
  return response.json();
};

export const fetchPlayerStats = async (playerName: string) => {
  const response = await fetch(`${API_URL}/api/stats/player?playerName=${encodeURIComponent(playerName)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch player statistics');
  }
  return response.json();
};