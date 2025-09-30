/*
 * file: game_services.go
 * package: services
 * description:
 *     Defines the Users game management and actions in the game
 */

package services

import (
	"errors"
	"strings"

	"github.com/juan10024/tictactoe-test/internal/core/domain"
	"github.com/juan10024/tictactoe-test/internal/core/ports"
)

/*
 * GameService provides business logic for game management and player actions.
 *
 * Fields:
 *   - repo (ports.GameRepository): Repository used to persist and retrieve game data.
 */
type GameService struct {
	repo ports.GameRepository
}

/*
 * NewGameService creates a new instance of GameService.
 *
 * Parameters:
 *   - r (ports.GameRepository): The repository implementation for game data.
 *
 * Returns:
 *   - *GameService: A new service instance configured with the provided repository.
 */
func NewGameService(r ports.GameRepository) *GameService {
	return &GameService{repo: r}
}

/*
 * GetPlayerByID retrieves a player by its unique ID.
 *
 * Parameters:
 *   - id (uint): The player's unique identifier.
 *
 * Returns:
 *   - *domain.Player: The player instance if found.
 *   - error: An error if the player cannot be retrieved.
 */
func (gs *GameService) GetPlayerByID(id uint) (*domain.Player, error) {
	return gs.repo.GetPlayerByID(id)
}

/*
 * HandleJoinRoom allows a player to join or create a game room.
 *
 * Parameters:
 *   - roomID (string): The unique identifier of the room.
 *   - playerName (string): The name of the player joining the room.
 *
 * Returns:
 *   - *domain.Game: The game instance for the room.
 *   - *domain.Player: The player instance that joined.
 *   - error: An error if joining or creating the room fails.
 */
func (s *GameService) HandleJoinRoom(roomID, playerName string) (*domain.Game, *domain.Player, error) {
	if len(playerName) == 0 || len(playerName) > 15 {
		return nil, nil, errors.New("player name must be between 1 and 15 characters")
	}

	player, err := s.repo.GetOrCreatePlayerByName(playerName)
	if err != nil {
		return nil, nil, err
	}

	existingGame, err := s.repo.GetByRoomID(roomID)
	if err != nil {
		newGame := &domain.Game{
			RoomID:      roomID,
			PlayerXID:   &player.ID,
			PlayerX:     *player,
			Status:      "waiting",
			Board:       "         ",
			CurrentTurn: "X",
		}

		if createErr := s.repo.Create(newGame); createErr != nil {

			finalGame, finalErr := s.repo.GetByRoomID(roomID)
			if finalErr != nil {
				return nil, nil, errors.New("failed to retrieve game after creation attempt: " + finalErr.Error())
			}

			if finalGame.PlayerXID != nil && finalGame.PlayerX.Name != "" {
				if strings.EqualFold(finalGame.PlayerX.Name, playerName) {
					return nil, nil, errors.New("a player with this name already exists in the room")
				}
			}
			if finalGame.PlayerOID != nil && finalGame.PlayerO.Name != "" {
				if strings.EqualFold(finalGame.PlayerO.Name, playerName) {
					return nil, nil, errors.New("a player with this name already exists in the room")
				}
			}

			if (finalGame.PlayerXID != nil && *finalGame.PlayerXID == player.ID) ||
				(finalGame.PlayerOID != nil && *finalGame.PlayerOID == player.ID) {
				return finalGame, player, nil
			}

			if finalGame.PlayerXID != nil && finalGame.PlayerOID != nil {
				return finalGame, player, nil // Convertir en observador
			}

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
		return newGame, player, nil
	}

	if existingGame.PlayerX.Name != "" && strings.EqualFold(existingGame.PlayerX.Name, playerName) {
		return nil, nil, errors.New("a player with this name already exists in the room")
	}

	if existingGame.PlayerO.Name != "" && strings.EqualFold(existingGame.PlayerO.Name, playerName) {
		return nil, nil, errors.New("a player with this name already exists in the room")
	}

	if (existingGame.PlayerXID != nil && *existingGame.PlayerXID == player.ID) ||
		(existingGame.PlayerOID != nil && *existingGame.PlayerOID == player.ID) {
		return existingGame, player, nil
	}

	if existingGame.Status == "waiting" && existingGame.PlayerOID == nil && existingGame.PlayerXID != nil {
		existingGame.PlayerOID = &player.ID
		existingGame.PlayerO = *player
		if err := s.repo.Update(existingGame); err != nil {
			return nil, nil, err
		}
		return existingGame, player, nil
	}

	return existingGame, player, nil
}

/*
 * MakeMove validates and applies a player's move, updates the game state,
 * and determines if the game has a winner or ends in a draw.
 *
 * Parameters:
 *   - roomID (string): The unique identifier of the room.
 *   - playerID (uint): The unique identifier of the player making the move.
 *   - position (int): The board position (0-8) where the move is made.
 *
 * Returns:
 *   - *domain.Game: The updated game instance.
 *   - error: An error if the move is invalid or cannot be applied.
 */
func (s *GameService) MakeMove(roomID string, playerID uint, position int) (*domain.Game, error) {
	game, err := s.repo.GetByRoomID(roomID)
	if err != nil {
		return nil, errors.New("game not found")
	}

	if game.Status != "in_progress" {
		return nil, errors.New("game is not currently in progress")
	}

	if position < 0 || position > 8 {
		return nil, errors.New("invalid move: position is out of bounds")
	}

	if game.Board[position] != ' ' {
		return nil, errors.New("invalid move: position is already taken")
	}

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

	boardRunes := []rune(game.Board)
	boardRunes[position] = rune(expectedSymbol[0])
	game.Board = string(boardRunes)

	if winnerSymbol := checkWinner(game.Board); winnerSymbol != "" {
		game.Status = "finished"
		if winnerSymbol == "X" {
			game.WinnerID = game.PlayerXID
		} else {
			game.WinnerID = game.PlayerOID
		}
		if game.WinnerID != nil {
			winner, err := s.repo.GetPlayerByID(*game.WinnerID)
			if err == nil && winner != nil {
				winner.Wins++
				s.repo.UpdatePlayer(winner)
			}

			var loserID *uint
			if winner != nil && game.WinnerID != nil && *game.WinnerID == winner.ID {
				if game.WinnerID == game.PlayerXID {
					loserID = game.PlayerOID
				} else {
					loserID = game.PlayerXID
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
	} else if !strings.Contains(game.Board, " ") {
		game.Status = "finished"
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
	} else {
		game.CurrentTurn = map[string]string{"X": "O", "O": "X"}[game.CurrentTurn]
	}

	if err := s.repo.Update(game); err != nil {
		return nil, err
	}
	return game, nil
}

/*
 * checkWinner determines the winner symbol ("X" or "O") based on board state.
 *
 * Parameters:
 *   - board (string): The current game board.
 *
 * Returns:
 *   - string: The winner symbol if there is a winner, otherwise an empty string.
 */
func checkWinner(board string) string {
	winConditions := [8][3]int{
		{0, 1, 2}, {3, 4, 5}, {6, 7, 8},
		{0, 3, 6}, {1, 4, 7}, {2, 5, 8},
		{0, 4, 8}, {2, 4, 6},
	}

	for _, c := range winConditions {
		if board[c[0]] != ' ' && board[c[0]] == board[c[1]] && board[c[1]] == board[c[2]] {
			return string(board[c[0]])
		}
	}
	return ""
}
