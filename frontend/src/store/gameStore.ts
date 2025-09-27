// frontend/src/store/gameStore.ts
import { create } from 'zustand';
import { z } from 'zod';
import { WS_URL } from '../../config';

// Zod schema para un jugador
const PlayerSchema = z.object({
  id: z.number(),
  name: z.string(),
  wins: z.number(),
  draws: z.number(),
  losses: z.number(),
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
  isObserver: boolean; // Nueva propiedad para indicar si es observador
  showConfirmationModal: boolean; // Nueva propiedad para mostrar modal de confirmación
  confirmationOpponent: string | null; // Nombre del oponente que quiere iniciar
}

// Acciones del store
interface GameStoreActions {
  connect: (roomId: string, playerName: string) => void;
  disconnect: () => void;
  makeMove: (position: number) => void;
  resetGame: () => void;
  resetError: () => void;
  confirmGameStart: (confirm: boolean) => void; // Nueva acción para confirmar inicio de juego
  // Nueva acción para mostrar un mensaje de error bonito
  showCustomError: (message: string) => void;
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
  isObserver: false,
  showConfirmationModal: false,
  confirmationOpponent: null,

  // Nueva acción para mostrar un error personalizado (podría abrir un modal o toast)
  showCustomError: (message: string) => {
    // Aquí puedes usar una librería de UI como react-hot-toast, react-toastify, etc.
    // o simplemente actualizar el estado para mostrar un modal
    alert(message); // Usamos alert como placeholder temporal
    // set({ error: message });
  },

  // Conexión WebSocket
  connect: (roomId: string, playerName: string) => {
    if (get().socket) return;

    const wsUrl = `${WS_URL}/join/${roomId}?playerName=${encodeURIComponent(playerName)}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => set({ isConnected: true, socket: ws, error: null, winningLine: null, isGameOver: false, showConfirmationModal: false });

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
              isGameOver: parsedState.Status === 'finished',
              isObserver: message.isObserver || false
            });
            break;
          }

          case 'gameStartConfirmation': {
            set({
              showConfirmationModal: true,
              confirmationOpponent: message.opponentName
            });
            break;
          }

          case 'error': {
            // Verificamos si el error es de nombre duplicado
            if (message.message && message.message.includes('already exists in the room')) {
              // Mostramos un mensaje bonito y desconectamos
              get().showCustomError(message.message);
              get().disconnect(); // Cerramos la conexión si es un error crítico de nombre
            } else {
              set({ error: message.message || 'An error occurred' });
            }
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

    ws.onerror = () => {
      set({ error: 'WebSocket connection error.' });
      // Opcional: intentar reconectar después de un tiempo
    };
    ws.onclose = () =>
      set({
        isConnected: false,
        socket: null,
        gameState: null,
        players: { X: null, O: null },
        winningLine: null,
        isGameOver: false,
        isObserver: false,
        showConfirmationModal: false,
        confirmationOpponent: null,
      });
  },

  // Acción: enviar movimiento
  makeMove: (position: number) => {
    const { socket, gameState, isObserver } = get();
    if (isObserver) {
      console.log('Observers cannot make moves');
      return;
    }

    if (socket && socket.readyState === WebSocket.OPEN && gameState?.Status === 'in_progress') {
      // Enviar en el formato que espera el backend
      socket.send(JSON.stringify({ type: 'move', payload: { position } }));
    }
  },

  // Acción: confirmar inicio de juego
  confirmGameStart: (confirm: boolean) => {
    const { socket, showConfirmationModal } = get();
    if (showConfirmationModal && socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'confirmGameStart',
        payload: { confirmed: confirm }
      }));

      set({ showConfirmationModal: false, confirmationOpponent: null });
    }
  },

  // Acción: reiniciar juego
  resetGame: () => {
    const { socket, gameState, isObserver } = get();
    if (isObserver) return; // Observers cannot reset the game

    if (socket && socket.readyState === WebSocket.OPEN && gameState) {
      // Enviar mensaje para reiniciar el juego
      socket.send(JSON.stringify({ type: 'reset' }));
    }
  },

  // Acción: desconectar
  disconnect: () => {
    const socket = get().socket;
    if (socket) {
        // Cerrar la conexión WebSocket
        socket.close(1000, "User disconnected"); // Código 1000 significa cierre normal
    }
    set({
      isConnected: false,
      socket: null,
      gameState: null,
      players: { X: null, O: null },
      winningLine: null,
      isGameOver: false,
      isObserver: false,
      showConfirmationModal: false,
      confirmationOpponent: null,
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