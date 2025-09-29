// backend/internal/core/services/game_service.go
package services

import (
	"errors"
	"strings"

	"github.com/juan10024/tictactoe-test/internal/core/domain"
	"github.com/juan10024/tictactoe-test/internal/core/ports"
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
	// Validate player name
	if len(playerName) == 0 || len(playerName) > 15 {
		return nil, nil, errors.New("player name must be between 1 and 15 characters")
	}

	player, err := s.repo.GetOrCreatePlayerByName(playerName)
	if err != nil {
		return nil, nil, err
	}

	// Intenta obtener el juego existente
	existingGame, err := s.repo.GetByRoomID(roomID)

	if err != nil { // El juego no existe
		// Crear un nuevo juego
		newGame := &domain.Game{
			RoomID:      roomID,
			PlayerXID:   &player.ID,
			PlayerX:     *player,
			Status:      "waiting",
			Board:       "         ",
			CurrentTurn: "X",
		}

		// Usamos Create que fallará si el RoomID ya existe (clave duplicada)
		if createErr := s.repo.Create(newGame); createErr != nil {
			// Si falla por clave duplicada, significa que otro proceso lo creó
			// Volver a intentar obtener el juego recién creado
			finalGame, finalErr := s.repo.GetByRoomID(roomID)
			if finalErr != nil {
				return nil, nil, errors.New("failed to retrieve game after creation attempt: " + finalErr.Error())
			}

			// Verificar si el jugador actual puede unirse
			if (finalGame.PlayerXID != nil && *finalGame.PlayerXID == player.ID) ||
				(finalGame.PlayerOID != nil && *finalGame.PlayerOID == player.ID) {
				// Jugador ya está en la sala
				return finalGame, player, nil
			}

			// Verificar si hay espacio para unirse
			if finalGame.PlayerXID != nil && finalGame.PlayerOID != nil {
				// Sala llena, convertir en observador
				return finalGame, player, nil
			}

			// Intentar unirse como segundo jugador
			if finalGame.PlayerXID != nil && *finalGame.PlayerXID != player.ID && finalGame.PlayerOID == nil {
				finalGame.PlayerOID = &player.ID
				finalGame.PlayerO = *player
				if updateErr := s.repo.Update(finalGame); updateErr != nil {
					return nil, nil, updateErr
				}
				return finalGame, player, nil
			}

			return finalGame, player, nil
		}
		// Si la creación fue exitosa, retornamos el nuevo juego
		return newGame, player, nil
	}

	// El juego ya existía
	// Verificar si el jugador ya está en la sala
	if (existingGame.PlayerXID != nil && *existingGame.PlayerXID == player.ID) ||
		(existingGame.PlayerOID != nil && *existingGame.PlayerOID == player.ID) {
		return existingGame, player, nil
	}

	// Verificar si hay espacio para unirse
	if existingGame.PlayerXID != nil && *existingGame.PlayerXID == player.ID {
		return nil, nil, errors.New("you are already in this room")
	}

	if existingGame.PlayerOID != nil && *existingGame.PlayerOID == player.ID {
		return nil, nil, errors.New("you are already in this room")
	}

	// Verificar si hay espacio para unirse como jugador
	if existingGame.Status == "waiting" && existingGame.PlayerOID == nil && existingGame.PlayerXID != nil {
		// Unirse como segundo jugador
		existingGame.PlayerOID = &player.ID
		existingGame.PlayerO = *player
		if err := s.repo.Update(existingGame); err != nil {
			return nil, nil, err
		}
		return existingGame, player, nil
	}

	// Convertir en observador
	return existingGame, player, nil
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

	if position < 0 || position > 8 {
		return nil, errors.New("invalid move: position is out of bounds")
	}

	if game.Board[position] != ' ' {
		return nil, errors.New("invalid move: position is already taken")
	}

	// Determine which player should be making the move
	var expectedPlayerID *uint
	var expectedSymbol string

	if game.CurrentTurn == "X" {
		expectedPlayerID = game.PlayerXID
		expectedSymbol = "X"
	} else {
		expectedPlayerID = game.PlayerOID
		expectedSymbol = "O"
	}

	if expectedPlayerID == nil || playerID != *expectedPlayerID {
		return nil, errors.New("it is not your turn")
	}

	// --- State Transition ---
	boardRunes := []rune(game.Board)
	boardRunes[position] = rune(expectedSymbol[0])
	game.Board = string(boardRunes)

	// --- Check Game Outcome ---
	if winnerSymbol := checkWinner(game.Board); winnerSymbol != "" {
		game.Status = "finished"
		if winnerSymbol == "X" {
			game.WinnerID = game.PlayerXID
		} else {
			game.WinnerID = game.PlayerOID
		}
		// Update player statistics for the winner and loser
		if game.WinnerID != nil {
			winner, err := s.repo.GetPlayerByID(*game.WinnerID)
			if err == nil && winner != nil {
				winner.Wins++
				if err := s.repo.UpdatePlayer(winner); err != nil {
					// Log the error but don't fail the game move
					// The game move itself was successful, just the stats update failed
				}
			}
			// Update loser stats
			var loserID *uint
			if winner != nil && game.WinnerID != nil && *game.WinnerID == winner.ID {
				if game.WinnerID == game.PlayerXID {
					loserID = game.PlayerOID // X won, O lost
				} else {
					loserID = game.PlayerXID // O won, X lost
				}
			}
			if loserID != nil {
				loser, err := s.repo.GetPlayerByID(*loserID)
				if err == nil && loser != nil {
					loser.Losses++
					s.repo.UpdatePlayer(loser)
				}
			}
		}
	} else if !strings.Contains(game.Board, " ") { // Draw
		game.Status = "finished"
		// Update player statistics for a draw
		if game.PlayerXID != nil {
			playerX, err := s.repo.GetPlayerByID(*game.PlayerXID)
			if err == nil && playerX != nil {
				playerX.Draws++
				s.repo.UpdatePlayer(playerX)
			}
		}
		if game.PlayerOID != nil {
			playerO, err := s.repo.GetPlayerByID(*game.PlayerOID)
			if err == nil && playerO != nil {
				playerO.Draws++
				s.repo.UpdatePlayer(playerO)
			}
		}
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
