// frontend/src/store/gameStore.ts
import { create } from 'zustand';
import { z } from 'zod';
import { WS_URL } from '../../config';

// Zod schema para un jugador
const PlayerSchema = z.object({
  id: z.number(),
  name: z.string(),
  wins: z.number(),
});

// Zod schema para validar el estado del juego recibido
const GameStateSchema = z.object({
  ID: z.number(),
  RoomID: z.string(),
  Board: z.string().length(9),
  CurrentTurn: z.enum(['X', 'O']),
  Status: z.enum(['waiting', 'in_progress', 'finished']),
  WinnerID: z.number().nullable(),
  PlayerXID: z.number().nullable(),
  PlayerOID: z.number().nullable(),
  PlayerX: PlayerSchema.optional(),
  PlayerO: PlayerSchema.optional(),
});

export type GameState = z.infer<typeof GameStateSchema>;
export type Player = z.infer<typeof PlayerSchema> & { symbol: 'X' | 'O' };

// Estado del store
interface GameStoreState {
  socket: WebSocket | null;
  isConnected: boolean;
  gameState: GameState | null;
  players: { X: Player | null; O: Player | null };
  error: string | null;
  winningLine: number[] | null; // Nueva propiedad para la línea ganadora
  isGameOver: boolean; // Nueva propiedad para estado de juego terminado
}

// Acciones del store
interface GameStoreActions {
  connect: (roomId: string, playerName: string) => void;
  disconnect: () => void;
  makeMove: (position: number) => void;
  resetGame: () => void;
  resetError: () => void;
}

type GameStore = GameStoreState & GameStoreActions;

export const useGameStore = create<GameStore>((set, get) => ({
  // Estado inicial
  socket: null,
  isConnected: false,
  gameState: null,
  players: { X: null, O: null },
  error: null,
  winningLine: null,
  isGameOver: false,

  // Conexión WebSocket
  connect: (roomId: string, playerName: string) => {
    if (get().socket) return;

    const wsUrl = `${WS_URL}/join/${roomId}?playerName=${encodeURIComponent(playerName)}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => set({ isConnected: true, socket: ws, error: null, winningLine: null, isGameOver: false });

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case 'gameStateUpdate': {
            const parsedState = GameStateSchema.parse(message.gameState);

            const playerX = message.players?.X
              ? { ...message.players.X, symbol: 'X' } as Player
              : null;
            const playerO = message.players?.O
              ? { ...message.players.O, symbol: 'O' } as Player
              : null;

            // Calcular la línea ganadora si hay un ganador
            let winningLine = null;
            if (parsedState.Status === 'finished' && parsedState.WinnerID) {
              winningLine = calculateWinningLine(parsedState.Board);
            }

            set({
              gameState: parsedState,
              players: { X: playerX, O: playerO },
              winningLine,
              isGameOver: parsedState.Status === 'finished'
            });
            break;
          }
          
          case 'error': {
            set({ error: message.message || 'An error occurred' });
            break;
          }

          default:
            console.warn('Unknown message type from server:', message);
        }
      } catch (e) {
        console.error('Error parsing WS message:', e);
        set({ error: 'Received invalid data from server.' });
      }
    };

    ws.onerror = () => set({ error: 'Connection error.' });
    ws.onclose = () =>
      set({
        isConnected: false,
        socket: null,
        gameState: null,
        players: { X: null, O: null },
        winningLine: null,
        isGameOver: false,
      });
  },

  // Acción: enviar movimiento
  makeMove: (position: number) => {
    const { socket, gameState } = get();
    if (socket && socket.readyState === WebSocket.OPEN && gameState?.Status === 'in_progress') {
      // Enviar en el formato que espera el backend
      socket.send(JSON.stringify({ type: 'move', payload: { position } }));
    }
  },

  // Acción: reiniciar juego
  resetGame: () => {
    const { socket, gameState } = get();
    if (socket && socket.readyState === WebSocket.OPEN && gameState) {
      // Enviar mensaje para reiniciar el juego
      socket.send(JSON.stringify({ type: 'reset' }));
    }
  },

  // Acción: desconectar
  disconnect: () => {
    get().socket?.close();
    set({
      isConnected: false,
      socket: null,
      gameState: null,
      players: { X: null, O: null },
      winningLine: null,
      isGameOver: false,
    });
  },

  // Acción: resetear errores
  resetError: () => set({ error: null }),
}));

// Función para calcular la línea ganadora
function calculateWinningLine(board: string): number[] | null {
  const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  for (const condition of winConditions) {
    const [a, b, c] = condition;
    if (board[a] !== ' ' && board[a] === board[b] && board[a] === board[c]) {
      return condition;
    }
  }
  return null;
}