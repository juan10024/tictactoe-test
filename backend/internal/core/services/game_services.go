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
		// Intenta crear un nuevo juego, pero maneja el caso de que otro proceso lo haya creado mientras
		newGame := &domain.Game{
			RoomID:      roomID,
			PlayerXID:   &player.ID,
			PlayerX:     *player,
			Status:      "waiting",
			Board:       "         ",
			CurrentTurn: "X",
		}
		// Usamos Create que fallará si el RoomID ya existe
		if createErr := s.repo.Create(newGame); createErr != nil {
			// Si falla por clave duplicada, significa que otro proceso lo creó
			// Intentamos obtener el juego recién creado por el otro proceso
			finalGame, finalErr := s.repo.GetByRoomID(roomID)
			if finalErr != nil {
				return nil, nil, errors.New("failed to create or retrieve game after creation attempt: " + finalErr.Error())
			}
			// Verificamos si el jugador actual puede unirse
			if finalGame.PlayerX != (domain.Player{}) && strings.EqualFold(finalGame.PlayerX.Name, playerName) {
				return nil, nil, errors.New("a player with this name already exists in the room")
			}
			if finalGame.PlayerO != (domain.Player{}) && strings.EqualFold(finalGame.PlayerO.Name, playerName) {
				return nil, nil, errors.New("a player with this name already exists in the room")
			}
			// Si puede unirse, lo dejamos como observador si el juego ya está en progreso o si está lleno
			isObserver := (finalGame.Status == "in_progress" && finalGame.PlayerOID != nil && *finalGame.PlayerOID != player.ID) ||
				(finalGame.PlayerXID != nil && *finalGame.PlayerXID != player.ID && finalGame.PlayerOID != nil && *finalGame.PlayerOID != player.ID)
			if isObserver {
				return finalGame, player, nil // Retorna el juego existente como observador
			}
			return finalGame, player, nil // Retorna como jugador si hay espacio
		}
		// Si la creación fue exitosa, retornamos el nuevo juego
		return newGame, player, nil
	}

	// El juego ya existía, verificamos nombres duplicados
	// Normalize player name for comparison (case-insensitive)
	normalizedPlayerName := strings.ToLower(strings.TrimSpace(playerName))
	if existingGame.PlayerX != (domain.Player{}) && strings.ToLower(existingGame.PlayerX.Name) == normalizedPlayerName {
		return nil, nil, errors.New("a player with this name already exists in the room")
	}
	if existingGame.PlayerO != (domain.Player{}) && strings.ToLower(existingGame.PlayerO.Name) == normalizedPlayerName {
		return nil, nil, errors.New("a player with this name already already exists in the room")
	}

	// Game exists, check if we can join as a player or if we become an observer
	// Si el juego ya está en progreso o ya tiene 2 jugadores, se convierte en observador
	isObserver := existingGame.Status == "in_progress" || (existingGame.PlayerXID != nil && existingGame.PlayerOID != nil)
	if isObserver {
		return existingGame, player, nil
	}

	// Game exists, attempt to join as the second player.
	if existingGame.PlayerOID == nil && *existingGame.PlayerXID != player.ID {
		existingGame.PlayerOID = &player.ID
		existingGame.PlayerO = *player
		// El estado permanece como "waiting" hasta que el primer jugador confirme
		// existingGame.Status = "in_progress" // <-- Esto se hará después de la confirmación
		// existingGame.CurrentTurn = "X" // <-- Esto se hará después de la confirmación
		if err := s.repo.Update(existingGame); err != nil {
			return nil, nil, err
		}
		return existingGame, player, nil
	} else if existingGame.PlayerXID == nil { // Should not happen with current logic, but defensive.
		existingGame.PlayerXID = &player.ID
		existingGame.PlayerX = *player
		if existingGame.PlayerOID != nil {
			// existingGame.Status = "in_progress" // <-- Esto se hará después de la confirmación
			// existingGame.CurrentTurn = "X" // <-- Esto se hará después de la confirmación
		}
		if err := s.repo.Update(existingGame); err != nil {
			return nil, nil, err
		}
		return existingGame, player, nil
	} else {
		// Room is full, player becomes an observer
		return existingGame, player, nil
	}
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
