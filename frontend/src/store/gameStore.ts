// frontend/src/store/gameStore.ts
/*
 * Zustand Store for Game State Management (Corrected)
 *
 * Correcciones principales:
 * - El backend envía mensajes con un campo `type`. Ahora el `onmessage` hace un switch
 *   para manejar `gameStateUpdate`.
 * - Se parsea el `gameState` desde `message.gameState`, y `players` desde `message.players`.
 * - Se eliminó la validación incorrecta con `GameStateSchema` en la raíz del mensaje.
 */
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
}

// Acciones del store
interface GameStoreActions {
  connect: (roomId: string, playerName: string) => void;
  disconnect: () => void;
  makeMove: (position: number) => void;
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

  // Conexión WebSocket
  connect: (roomId: string, playerName: string) => {
    if (get().socket) return;

    const ws = new WebSocket(
      `${WS_URL}/join/${roomId}?playerName=${encodeURIComponent(playerName)}`
    );

    ws.onopen = () => set({ isConnected: true, socket: ws, error: null });

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

            set({
              gameState: parsedState,
              players: { X: playerX, O: playerO },
            });
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
      });
  },

  // Acción: enviar movimiento
  makeMove: (position: number) => {
    const { socket, gameState } = get();
    if (socket && socket.readyState === WebSocket.OPEN && gameState?.Status === 'in_progress') {
      socket.send(JSON.stringify({ type: 'move', position }));
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
    });
  },

  // Acción: resetear errores
  resetError: () => set({ error: null }),
}));
