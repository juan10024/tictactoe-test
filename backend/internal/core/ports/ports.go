/*
 * file: ports.go
 * package: ports
 * description:
 * 			This file defines the interfaces that form the boundaries of the application's core logic (hexagon).
 * 			These ports allow the core services to be decoupled from specific infrastructure implementations
 */

package ports

import "github.com/juan10024/tictactoe-test/internal/core/domain"

/* GameRepository defines the contract for game data persistence.
 * Any data storage solution must implement this interface to be used by the core service.
 */

type GameRepository interface {
	Create(game *domain.Game) error
	Update(game *domain.Game) error
	GetByRoomID(roomID string) (*domain.Game, error)
	GetOrCreatePlayerByName(name string) (*domain.Player, error)
	GetPlayerByID(id uint) (*domain.Player, error)
	UpdatePlayer(player *domain.Player) error
}

// StatsRepository defines the contract for retrieving game statistics.
type StatsRepository interface {
	GetTopPlayers(limit int) ([]domain.Player, error)
	GetGamesByRoomID(roomID string) ([]domain.Game, error)
	GetPlayerByName(name string) (*domain.Player, error)

	CountGames() (int64, error)
	CountPlayers() (int64, error)
}
