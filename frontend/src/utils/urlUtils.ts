/*
 * file: urlUtils.ts
 * module: utils
 * description: Utility functions to extract key parameters from the URL related to the game session.
 *
 * functions:
 * - getPlayerNameFromUrl: Retrieves the player's name from the URL query parameters (?playerName=...).
 * - getRoomIdFromUrl: Retrieves the room ID from the last segment of the current path (/room/:roomId).
 *
 * usage:
 * These helpers simplify extracting URL data required to initialize
 * and manage a player's session within the application.
 */

export const getPlayerNameFromUrl = (): string => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('playerName') || '';
};

export const getRoomIdFromUrl = (): string => {
  const pathParts = window.location.pathname.split('/');
  return pathParts[pathParts.length - 1];
};
