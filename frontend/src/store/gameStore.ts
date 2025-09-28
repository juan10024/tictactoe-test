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
  winningLine: number[] | null;
  isGameOver: boolean;
  isObserver: boolean;
  showConfirmationModal: boolean;
  confirmationOpponent: string | null;
  showEndGameModal: boolean;
  showPlayAgainConfirmation: boolean;
  playAgainRequestingPlayer: string | null;
  isReturningPlayer: boolean;
  playerName?: string;
}

// Acciones del store
interface GameStoreActions {
  connect: (roomId: string, playerName: string) => void;
  disconnect: () => void;
  makeMove: (position: number) => void;
  resetGame: () => void;
  resetError: () => void;
  confirmGameStart: (confirm: boolean) => void;
  showCustomError: (message: string) => void;
  // Nuevas acciones para los modales
  setShowEndGameModal: (show: boolean) => void;
  setShowPlayAgainConfirmation: (show: boolean) => void;
  setPlayAgainRequest: (playerName: string) => void;
  clearPlayAgainRequest: () => void;
  setIsReturningPlayer: (isReturning: boolean) => void;
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
  showEndGameModal: false,
  showPlayAgainConfirmation: false,
  playAgainRequestingPlayer: null,
  isReturningPlayer: false,

  // Nueva acción para mostrar un error personalizado
  showCustomError: (message: string) => {
    alert(message);
  },

  // Conexión WebSocket
  connect: (roomId: string, playerName: string) => {
    if (get().socket) return;

    const wsUrl = `${WS_URL}/join/${roomId}?playerName=${encodeURIComponent(playerName)}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      set({
        isConnected: true,
        socket: ws,
        error: null,
        winningLine: null,
        isGameOver: false,
        showConfirmationModal: false,
        showEndGameModal: false,
        showPlayAgainConfirmation: false,
        playAgainRequestingPlayer: null
      });
    };

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

            // Verificar si es jugador registrado (tiene stats)
            const isReturning = !!(playerX?.wins || playerX?.losses || playerX?.draws ||
              playerO?.wins || playerO?.losses || playerO?.draws);

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
              isObserver: message.isObserver || false,
              isReturningPlayer: isReturning
            });

            // Mostrar modal de fin de juego si el juego terminó
            if (parsedState.Status === 'finished') {
              setTimeout(() => set({ showEndGameModal: true }), 500);
            }
            break;
          }

          case 'gameStartConfirmation': {
            set({
              showConfirmationModal: true,
              confirmationOpponent: message.opponentName
            });
            break;
          }

          case 'playAgainRequest': {
            const { playerName: currentPlayerName } = get();
            if (message.requestingPlayer !== currentPlayerName) {
              set({
                showPlayAgainConfirmation: true,
                playAgainRequestingPlayer: message.requestingPlayer
              });
            }
            break;
          }

          case 'play_again_menu_request': {
            const { playerName: currentPlayerName } = get();
            if (message.requestingPlayer !== currentPlayerName) {
              set({
                showPlayAgainConfirmation: true,
                playAgainRequestingPlayer: message.requestingPlayer
              });
            }
            break;
          }

          case 'error': {
            if (message.message && message.message.includes('already exists in the room')) {
              get().showCustomError(message.message);
              get().disconnect();
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
        showEndGameModal: false,
        showPlayAgainConfirmation: false,
        playAgainRequestingPlayer: null,
      });
  },

  makeMove: (position: number) => {
    const { socket, gameState, isObserver } = get();
    if (isObserver) {
      console.log('Observers cannot make moves');
      return;
    }

    if (socket && socket.readyState === WebSocket.OPEN && gameState?.Status === 'in_progress') {
      socket.send(JSON.stringify({ type: 'move', payload: { position } }));
    }
  },

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

  resetGame: () => {
    const { socket, gameState, isObserver } = get();
    if (isObserver) return;

    // Actualizar estado local inmediatamente
    if (gameState) {
      const resetGameState = {
        ...gameState,
        Board: '         ',
        Status: 'in_progress' as const,
        CurrentTurn: 'X' as const,
        WinnerID: null,
        winningLine: null
      };

      set({
        gameState: resetGameState,
        winningLine: null,
        isGameOver: false,
        showEndGameModal: false,
        showPlayAgainConfirmation: false,
        playAgainRequestingPlayer: null
      });
    }

    if (socket && socket.readyState === WebSocket.OPEN && gameState) {
      socket.send(JSON.stringify({ type: 'reset' }));
    }
  },

  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      socket.close(1000, "User disconnected");
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
      showEndGameModal: false,
      showPlayAgainConfirmation: false,
      playAgainRequestingPlayer: null,
    });
  },

  resetError: () => set({ error: null }),

  // Nuevas acciones para modales
  setShowEndGameModal: (show) => set({ showEndGameModal: show }),
  setShowPlayAgainConfirmation: (show) => set({ showPlayAgainConfirmation: show }),

setPlayAgainRequest: (playerName) => {
  const { socket, setShowEndGameModal, gameState } = get();
  if (socket && socket.readyState === WebSocket.OPEN) {
    // Determinar qué tipo de solicitud enviar
    const isFromMenu = gameState?.Status === 'finished';
    
    const messageType = isFromMenu ? 'play_again_menu_request' : 'playAgainRequest';
    
    // Cerrar el modal de fin de juego para el jugador que solicita jugar de nuevo
    setShowEndGameModal(false);
    socket.send(JSON.stringify({
      type: messageType,
      payload: { requestingPlayer: playerName }
    }));
  }
},

  clearPlayAgainRequest: () => set({
    showPlayAgainConfirmation: false,
    playAgainRequestingPlayer: null
  }),

  setIsReturningPlayer: (isReturning) => set({ isReturningPlayer: isReturning }),
}));

// Función para calcular la línea ganadora
function calculateWinningLine(board: string): number[] | null {
  const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  for (const condition of winConditions) {
    const [a, b, c] = condition;
    if (board[a] !== ' ' && board[a] === board[b] && board[a] === board[c]) {
      return condition;
    }
  }
  return null;
}