// backend/internal/core/services/game_service.go
/*
 * Game Service (Application Core)
 *
 * This service encapsulates the primary business logic for managing the Tic-Tac-Toe game lifecycle.
 * It handles operations like creating/joining games, processing player moves, and determining game outcomes.
 * It remains pure and framework-agnostic, interacting with the outside world only through the defined ports.
 */
package services

import (
	"errors"
	"strings"

	"github.com/juan10024/tictactoe-test/backend/internal/core/domain"
	"github.com/juan10024/tictactoe-test/backend/internal/core/ports"
)

// GameService provides game-related business logic.
type GameService struct {
	repo ports.GameRepository
}

// NewGameService creates a new instance of GameService.
func NewGameService(r ports.GameRepository) *GameService {
	return &GameService{repo: r}
}

func (gs *GameService) GetPlayerByID(id uint) (*domain.Player, error) {
	return gs.repo.GetPlayerByID(id)
}

// HandleJoinRoom manages a player joining a game room. If the room doesn't exist, it's created.
// If it exists and needs a player, the player joins.
func (s *GameService) HandleJoinRoom(roomID, playerName string) (*domain.Game, *domain.Player, error) {
	player, err := s.repo.GetOrCreatePlayerByName(playerName)
	if err != nil {
		return nil, nil, err
	}

	game, err := s.repo.GetByRoomID(roomID)
	if err != nil { // Game not found, create a new one.
		newGame := &domain.Game{
			RoomID:      roomID,
			PlayerXID:   &player.ID,
			Status:      "waiting",
			Board:       "         ",
			CurrentTurn: "X",
		}
		if err := s.repo.Create(newGame); err != nil {
			return nil, nil, err
		}
		return newGame, player, nil
	}

	// Game exists, attempt to join as the second player.
	if game.PlayerOID == nil && *game.PlayerXID != player.ID {
		game.PlayerOID = &player.ID
		game.Status = "in_progress"
		if err := s.repo.Update(game); err != nil {
			return nil, nil, err
		}
	} else if game.PlayerXID == nil { // Should not happen with current logic, but defensive.
		game.PlayerXID = &player.ID
		if game.PlayerOID != nil {
			game.Status = "in_progress"
		}
		if err := s.repo.Update(game); err != nil {
			return nil, nil, err
		}
	}

	return game, player, nil
}

// MakeMove processes a player's move, validates it, updates the game state, and checks for a winner.
func (s *GameService) MakeMove(roomID string, playerID uint, position int) (*domain.Game, error) {
	game, err := s.repo.GetByRoomID(roomID)
	if err != nil {
		return nil, errors.New("game not found")
	}

	// --- Input Validations ---
	if game.Status != "in_progress" {
		return nil, errors.New("game is not currently in progress")
	}
	if position < 0 || position > 8 || game.Board[position] != ' ' {
		return nil, errors.New("invalid move: position is out of bounds or already taken")
	}

	var symbol string
	if playerID == *game.PlayerXID && game.CurrentTurn == "X" {
		symbol = "X"
	} else if playerID == *game.PlayerOID && game.CurrentTurn == "O" {
		symbol = "O"
	} else {
		return nil, errors.New("it is not your turn")
	}

	// --- State Transition ---
	boardRunes := []rune(game.Board)
	boardRunes[position] = rune(symbol[0])
	game.Board = string(boardRunes)

	// --- Check Game Outcome ---
	if winnerSymbol := checkWinner(game.Board); winnerSymbol != "" {
		game.Status = "finished"
		if winnerSymbol == "X" {
			game.WinnerID = game.PlayerXID
		} else {
			game.WinnerID = game.PlayerOID
		}
	} else if !strings.Contains(game.Board, " ") { // Draw
		game.Status = "finished"
	} else { // Continue play
		game.CurrentTurn = map[string]string{"X": "O", "O": "X"}[game.CurrentTurn]
	}

	if err := s.repo.Update(game); err != nil {
		return nil, err
	}
	return game, nil
}

// checkWinner determines if there is a winner based on the board state.
func checkWinner(board string) string {
	winConditions := [8][3]int{
		{0, 1, 2}, {3, 4, 5}, {6, 7, 8}, // Rows
		{0, 3, 6}, {1, 4, 7}, {2, 5, 8}, // Columns
		{0, 4, 8}, {2, 4, 6}, // Diagonals
	}

	for _, c := range winConditions {
		if board[c[0]] != ' ' && board[c[0]] == board[c[1]] && board[c[1]] == board[c[2]] {
			return string(board[c[0]])
		}
	}
	return ""
}
