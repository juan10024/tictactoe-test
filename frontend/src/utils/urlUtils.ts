// frontend/src/utils/urlUtils.ts
export const getPlayerNameFromUrl = (): string => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('playerName') || '';
};

export const getRoomIdFromUrl = (): string => {
  const pathParts = window.location.pathname.split('/');
  return pathParts[pathParts.length - 1];
};