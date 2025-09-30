/*
 * file: GameRoom.tsx
 * page: GameRoom
 * description:
 *    Main page for a game room (players + observers).
 *    - Connects/disconnects users to a room via gameStore
 *    - Manages game menu vs. in-game board views
 *    - Controls multiple modals (welcome, leave, endgame, play again, observer exit)
 *    - Handles observers joining mid-game and game continuation logic
 *
 * usage:
 *    Route definition:
 *       <Route path="/room/:roomId" element={<GameRoom />} />
 */

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'

// Views
import GameRoomMenuView from '../components/game/GameRoomMenuView'
import GameRoomGameView from '../components/game/GameRoomGameView'

// Modals
import ConfirmationModals from '../components/modals/ConfirmationModal'
import EndGameModal from '../components/modals/EndGameModal'
import PlayAgainConfirmationModal from '../components/modals/PlayAgainConfirmationModal'
import ObserverExitModal from '../components/modals/ObserverExitModal'


// Main Page Component

const GameRoom = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  // Store actions + selectors
  const connect = useGameStore((state) => state.connect)
  const disconnect = useGameStore((state) => state.disconnect)
  const gameState = useGameStore((state) => state.gameState)
  const showEndGameModal = useGameStore((state) => state.showEndGameModal)
  const showPlayAgainConfirmation = useGameStore(
    (state) => state.showPlayAgainConfirmation
  )

  // Local UI states
  const [welcomeModalShown, setWelcomeModalShown] = useState(false)
  const isObserverFromStore = useGameStore.getState().isObserver
  const [showMenu, setShowMenu] = useState(!isObserverFromStore)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showLeaveGameModal, setShowLeaveGameModal] = useState(false)
  const [showObserverExitModal, setShowObserverExitModal] = useState(false)

  const playerName =
    new URLSearchParams(location.search).get('playerName') || ''

 
  // Lifecycle Effects
  

  /** Connect/disconnect to room */
  useEffect(() => {
    if (!roomId || !playerName) {
      navigate('/')
      return
    }
    connect(roomId, playerName)
    return () => {
      const currentPath = window.location.pathname
      if (!currentPath.includes('/stats')) {
        disconnect()
      }
    }
  }, [roomId, connect, disconnect, navigate, location, playerName])

  /** Event listener: show menu */
  useEffect(() => {
    const handleShowGameMenu = () => setShowMenu(true)
    window.addEventListener('showGameMenu', handleShowGameMenu)
    return () => window.removeEventListener('showGameMenu', handleShowGameMenu)
  }, [])

  /** Event listener: show game board */
  useEffect(() => {
    const handleShowGameBoard = () => setShowMenu(false)
    window.addEventListener('showGameBoard', handleShowGameBoard)
    return () =>
      window.removeEventListener('showGameBoard', handleShowGameBoard)
  }, [])

  /** Auto-switch to board if game already started */
  useEffect(() => {
    const currentGameState = useGameStore.getState().gameState
    if (showMenu && currentGameState?.status === 'in_progress') {
      setShowMenu(false)
    }
  }, [showMenu])

  /** Welcome modal (once per session) */
  useEffect(() => {
    const isConnected = useGameStore.getState().isConnected
    if (isConnected && !welcomeModalShown) {
      if (!sessionStorage.getItem('welcomeModalShown')) {
        const timer = setTimeout(() => {
          setWelcomeModalShown(true)
          sessionStorage.setItem('welcomeModalShown', 'true')
        }, 100)
        return () => clearTimeout(timer)
      }
    }
  }, [welcomeModalShown])

  /** Observers skip menu or go to board if game is in progress */
  useEffect(() => {
    const { isObserver, gameState } = useGameStore.getState()
    if (isObserver) {
      setShowMenu(false)
    } else if (gameState?.status === 'in_progress') {
      setShowMenu(false)
    }
  }, [])

  /** Observer exit modal when game finishes */
  useEffect(() => {
    const unsubscribe = useGameStore.subscribe((state) => {
      if (state.isObserver && state.gameState?.status === 'finished') {
        if (!state.showPlayAgainConfirmation && !state.playAgainRequestingPlayer) {
          const timer = setTimeout(() => {
            setShowObserverExitModal(true)
          }, 1000)
          return () => clearTimeout(timer)
        }
      } else {
        setShowObserverExitModal(false)
      }
    })
    return () => unsubscribe()
  }, [])


  // Event Handlers
 
  const handleCopyRoomId = useCallback(() => {
    if (roomId) {
      navigator.clipboard
        .writeText(roomId)
        .then(() => alert('Room ID copied!'))
        .catch((err) => console.error('Failed to copy ID: ', err))
    }
  }, [roomId])

  const handleLeaveRoom = useCallback(() => {
    disconnect()
    navigate('/')
  }, [disconnect, navigate])

  const handlePlayGame = () => {
    const gameState = useGameStore.getState().gameState
    const playerName =
      new URLSearchParams(location.search).get('playerName') || ''
    if (gameState?.status === 'finished') {
      useGameStore.getState().setPlayAgainRequest(playerName)
    }
    setTimeout(() => setShowMenu(false), 50)
  }

  const handleViewStats = useCallback(() => {
    navigate(
      `/room/${roomId}/stats?playerName=${encodeURIComponent(playerName)}`
    )
  }, [roomId, navigate, playerName])

  const handleCloseWelcomeModal = useCallback(() => {
    setWelcomeModalShown(false)
    sessionStorage.setItem('welcomeModalShown', 'true')
  }, [])

  const handleConfirmLeaveGame = useCallback(() => {
    setShowLeaveGameModal(false)
    setShowMenu(true)
  }, [])

  const handleCancelLeaveGame = useCallback(() => {
    setShowLeaveGameModal(false)
  }, [])

  const handleObserverStay = useCallback(() => {
    setShowObserverExitModal(false)
  }, [])

  const handleObserverLeave = useCallback(() => {
    disconnect()
    navigate('/')
  }, [disconnect, navigate])


  // Derived State

  const shouldShowContinueButton = useMemo(() => {
    return !!(gameState && gameState.status === 'in_progress' && showMenu)
  }, [gameState, showMenu])

  const isObserver = useGameStore((state) => state.isObserver)

 
  // Render

  if (showMenu) {
    return (
      <>
        <GameRoomMenuView
          roomId={roomId || ''}
          playerName={playerName}
          onCopyRoomId={handleCopyRoomId}
          onPlayGame={handlePlayGame}
          onViewStats={handleViewStats}
          onLeaveRoom={handleLeaveRoom}
          shouldShowContinueButton={shouldShowContinueButton}
          welcomeModalShown={welcomeModalShown}
          onCloseWelcomeModal={handleCloseWelcomeModal}
        />
        <ConfirmationModals
          showLeaveModal={showLeaveModal}
          onLeaveModalClose={() => setShowLeaveModal(false)}
          onLeaveRoom={handleLeaveRoom}
          showLeaveGameModal={showLeaveGameModal}
          onLeaveGameModalClose={handleCancelLeaveGame}
          onConfirmLeaveGame={handleConfirmLeaveGame}
        />
        {showPlayAgainConfirmation && <PlayAgainConfirmationModal />}
        {showObserverExitModal && (
          <ObserverExitModal
            isOpen={showObserverExitModal}
            onStay={handleObserverStay}
            onLeave={handleObserverLeave}
          />
        )}
      </>
    )
  }

  return (
    <>
      <GameRoomGameView
        roomId={roomId || ''}
        playerName={playerName}
        isObserver={isObserver}
        onCopyRoomId={handleCopyRoomId}
        onBackClick={() => setShowLeaveGameModal(true)}
      />
      <ConfirmationModals
        showLeaveModal={showLeaveModal}
        onLeaveModalClose={() => setShowLeaveModal(false)}
        onLeaveRoom={handleLeaveRoom}
        showLeaveGameModal={showLeaveGameModal}
        onLeaveGameModalClose={handleCancelLeaveGame}
        onConfirmLeaveGame={handleConfirmLeaveGame}
      />
      {showEndGameModal && <EndGameModal playerName={playerName} />}
      {showPlayAgainConfirmation && <PlayAgainConfirmationModal />}
      {showObserverExitModal && (
        <ObserverExitModal
          isOpen={showObserverExitModal}
          onStay={handleObserverStay}
          onLeave={handleObserverLeave}
        />
      )}
    </>
  )
}

export default GameRoom
