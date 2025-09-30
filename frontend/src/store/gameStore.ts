/*
 * file: gameStore.ts
 * module: store
 * description:
 *    Zustand store to manage the Tic-Tac-Toe game state.
 *    - Manages WebSocket connection lifecycle
 *    - Stores and validates game state with Zod schemas
 *    - Handles players, moves, errors, and modals
 *    - Provides actions for game flow (connect, make move, reset, play again, etc.)
 *    - Dispatches browser CustomEvents to integrate with UI modals and transitions
 *
 * usage:
 *    import { useGameStore } from '../store/gameStore'
 *
 *    const { connect, makeMove, resetGame } = useGameStore()
 *    connect("room123", "Alice")
 *    makeMove(0)
 *    resetGame()
 */

import { create } from 'zustand'
import { z } from 'zod'
import { WS_URL } from '../../config'


// Schemas

// Player validation schema
const PlayerSchema = z.object({
  id: z.number(),
  name: z.string(),
  wins: z.number(),
  draws: z.number(),
  losses: z.number(),
})

// Game state validation schema
const GameStateSchema = z.object({
  ID: z.number(),
  roomID: z.string(),
  board: z.string().length(9), 
  currentTurn: z.enum(['X', 'O']),
  status: z.enum(['waiting', 'in_progress', 'finished']),
  winnerID: z.number().nullable(),
  playerXID: z.number().nullable(),
  playerOID: z.number().nullable(),
  playerX: PlayerSchema.optional(),
  playerO: PlayerSchema.optional(),
})

// Types inferred from schemas
export type GameState = z.infer<typeof GameStateSchema>
export type Player = z.infer<typeof PlayerSchema> & { symbol: 'X' | 'O' }


// Store State and Actions

interface GameStoreState {
  socket: WebSocket | null
  isConnected: boolean
  gameState: GameState | null
  players: { X: Player | null; O: Player | null }
  error: string | null
  winningLine: number[] | null
  isGameOver: boolean
  isObserver: boolean
  showConfirmationModal: boolean
  confirmationOpponent: string | null
  showEndGameModal: boolean
  showPlayAgainConfirmation: boolean
  playAgainRequestingPlayer: string | null
  isReturningPlayer: boolean
  isValidationComplete: boolean
  playerName?: string
}

interface GameStoreActions {
  connect: (roomId: string, playerName: string) => void
  disconnect: () => void
  makeMove: (position: number) => void
  resetGame: () => void
  resetError: () => void
  respondToPlayAgain: (accepted: boolean) => void
  confirmGameStart: (confirm: boolean) => void
  showCustomError: (message: string) => void
  setShowEndGameModal: (show: boolean) => void
  setShowPlayAgainConfirmation: (show: boolean) => void
  setPlayAgainRequest: (playerName: string) => void
  clearPlayAgainRequest: () => void
  setIsReturningPlayer: (isReturning: boolean) => void
}

type GameStore = GameStoreState & GameStoreActions

// Zustand Store

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
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
  isValidationComplete: false,

  // Actions

  /** Show a custom error in a blocking alert */
  showCustomError: (message: string) => {
    alert(message)
  },

  /** Connect to game WebSocket and setup listeners */
  connect: (roomId: string, playerName: string) => {
    set({ playerName })
    const currentSocket = get().socket
    if (currentSocket) {
      currentSocket.close(1000, 'Reconnecting with new session')
    }

    const wsUrl = `${WS_URL}/join/${roomId}?playerName=${encodeURIComponent(playerName)}`
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      set({
        isConnected: true,
        isValidationComplete: true,
        socket: ws,
        error: null,
        winningLine: null,
        isGameOver: false,
        showConfirmationModal: false,
        showEndGameModal: false,
        showPlayAgainConfirmation: false,
        playAgainRequestingPlayer: null,
      })
    }

    // Handle server messages
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)

        switch (message.type) {
          case 'gameStateUpdate': {
            const parsedState = GameStateSchema.parse(message.gameState)
            const currentPlayerName = get().playerName

            const playerX = message.players?.X
              ? ({ ...message.players.X, symbol: 'X' } as Player)
              : null
            const playerO = message.players?.O
              ? ({ ...message.players.O, symbol: 'O' } as Player)
              : null

            const isObserver = !(
              playerX?.name === currentPlayerName ||
              playerO?.name === currentPlayerName
            )

            const isReturning =
              !!(playerX?.wins ||
              playerX?.losses ||
              playerX?.draws ||
              playerO?.wins ||
              playerO?.losses ||
              playerO?.draws)

            let winningLine = null
            if (parsedState.status === 'finished' && parsedState.winnerID) {
              winningLine = calculateWinningLine(parsedState.board)
            }

            set({
              gameState: parsedState,
              players: { X: playerX, O: playerO },
              winningLine,
              isGameOver: parsedState.status === 'finished',
              isObserver,
              isReturningPlayer: isReturning,
            })

            if (parsedState.status === 'finished') {
              setTimeout(() => set({ showEndGameModal: true }), 500)
            }
            break
          }

          case 'gameStartConfirmation': {
            set({
              showConfirmationModal: true,
              confirmationOpponent: message.opponentName,
            })
            break
          }

          case 'playAgainRequest': {
            const { playerName: currentPlayerName } = get()
            if (message.requestingPlayer !== currentPlayerName) {
              set({
                showPlayAgainConfirmation: true,
                playAgainRequestingPlayer: message.requestingPlayer,
              })
              showWaitingModal(
                message.requestingPlayer,
                currentPlayerName || ''
              )
            }
            break
          }

          case 'play_again_waiting':
            break

          case 'play_again_accepted': {
            const event = new CustomEvent('playAgainAccepted')
            window.dispatchEvent(event)
            handlePlayAgainAccept()
            break
          }

          case 'play_again_rejected': {
            const event = new CustomEvent('playAgainRejected', {
              detail: { rejectedBy: message.rejectedBy },
            })
            window.dispatchEvent(event)
            handlePlayAgainReject(message.rejectedBy)
            break
          }

          case 'error': {
            if (
              message.message &&
              message.message.includes('already exists in the room')
            ) {
              get().showCustomError(message.message)
              get().disconnect()
            } else {
              set({ error: message.message || 'An error occurred' })
            }
            break
          }

          default:
            console.warn('Unknown message type from server:', message)
        }
      } catch (e) {
        console.error('Error parsing WS message:', e)
        set({ error: 'Received invalid data from server.' })
      }
    }

    ws.onerror = () => {
      set({ error: 'WebSocket connection error.' })
    }

    ws.onclose = (event) =>
      console.log('WebSocket closed:', event.code, event.reason)

    // Reset store state on disconnect
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
    })
  },

  /** Respond to play again request */
  respondToPlayAgain: (accepted: boolean) => {
    const { socket } = get()
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: 'play_again_response',
          payload: { accepted },
        })
      )
    }
  },

  /** Send a move to the server */
  makeMove: (position: number) => {
    const { socket, gameState, isObserver } = get()
    if (isObserver) {
      console.log('Observers cannot make moves')
      return
    }

    if (
      socket &&
      socket.readyState === WebSocket.OPEN &&
      gameState?.status === 'in_progress'
    ) {
      socket.send(JSON.stringify({ type: 'move', payload: { position } }))
    }
  },

  /** Confirm or reject game start */
  confirmGameStart: (confirm: boolean) => {
    const { socket, showConfirmationModal } = get()
    if (showConfirmationModal && socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: 'confirmGameStart',
          payload: { confirmed: confirm },
        })
      )

      set({ showConfirmationModal: false, confirmationOpponent: null })
    }
  },

  /** Reset game state locally and notify server */
  resetGame: () => {
    const { socket, gameState, isObserver } = get()
    if (isObserver) return

    if (gameState) {
      const resetGameState = {
        ...gameState,
        board: '         ',
        status: 'in_progress' as const,
        CurrentTurn: 'X' as const,
        winnerID: null,
        winningLine: null,
      }

      set({
        gameState: resetGameState,
        winningLine: null,
        isGameOver: false,
        showEndGameModal: false,
        showPlayAgainConfirmation: false,
        playAgainRequestingPlayer: null,
      })
    }

    if (socket && socket.readyState === WebSocket.OPEN && gameState) {
      socket.send(JSON.stringify({ type: 'reset' }))
    }
  },

  /** Disconnect from WebSocket and reset state */
  disconnect: () => {
    const socket = get().socket
    if (socket) {
      socket.close(1000, 'User disconnected')
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
    })
  },

  /** Reset error state */
  resetError: () => set({ error: null }),

  /** Modal state setters */
  setShowEndGameModal: (show) => set({ showEndGameModal: show }),
  setShowPlayAgainConfirmation: (show) =>
    set({ showPlayAgainConfirmation: show }),

  /** Initiate play again request */
  setPlayAgainRequest: (playerName) => {
    const { socket, setShowEndGameModal } = get()
    if (socket && socket.readyState === WebSocket.OPEN) {
      setShowEndGameModal(false)
      socket.send(
        JSON.stringify({
          type: 'playAgainRequest',
          payload: { requestingPlayer: playerName },
        })
      )
    }
  },

  /** Clear play again request state */
  clearPlayAgainRequest: () =>
    set({
      showPlayAgainConfirmation: false,
      playAgainRequestingPlayer: null,
    }),

  /** Mark whether current player is a returning player */
  setIsReturningPlayer: (isReturning) =>
    set({ isReturningPlayer: isReturning }),
}))


// Helper functions

/** Calculate winning line indices from board string */
function calculateWinningLine(board: string): number[] | null {
  const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]

  for (const condition of winConditions) {
    const [a, b, c] = condition
    if (board[a] !== ' ' && board[a] === board[b] && board[a] === board[c]) {
      return condition
    }
  }
  return null
}

/** Dispatch browser event to show waiting modal */
export const showWaitingModal = (requestingPlayer: string, opponentName: string) => {
  const event = new CustomEvent('showWaitingModal', {
    detail: { requestingPlayer, opponentName },
  })
  window.dispatchEvent(event)
}

/** Dispatch browser event to show rejection message */
export const showRejectionMessage = (rejectedBy: string) => {
  const event = new CustomEvent('showRejectionMessage', {
    detail: { rejectedBy },
  })
  window.dispatchEvent(event)
}

/** Handle accepted play again flow */
export const handlePlayAgainAccept = () => {
  const { resetGame } = useGameStore.getState()
  resetGame()

  const event = new CustomEvent('showGameboard')
  window.dispatchEvent(event)
}

/** Handle rejected play again flow */
export const handlePlayAgainReject = (rejectedBy: string) => {
  const { clearPlayAgainRequest } = useGameStore.getState()
  clearPlayAgainRequest()

  showRejectionMessage(rejectedBy)

  const event = new CustomEvent('showGameMenu')
  window.dispatchEvent(event)
}
