/*
 * file: repository.go
 * package: repository
 * description:
 *     Provides the concrete GORM implementation of the repository ports.
 *     These structs act as adapters, translating domain repository calls into
 *     database-specific queries, allowing the core business logic to remain
 *     decoupled from storage details.
 */

package repository

import (
	"errors"

	"github.com/juan10024/tictactoe-test/internal/core/domain"

	"gorm.io/gorm"
)

/*
 * GormGameRepository is the GORM implementation of the GameRepository port.
 *
 * Responsibilities:
 *   - Create, update, and retrieve games from the database.
 *   - Manage player creation and lookups by name or ID.
 */
type GormGameRepository struct {
	db *gorm.DB
}

/*
 * UpdatePlayer persists an existing player's updated fields to the database.
 *
 * Parameters:
 *   - player (*domain.Player): The player entity with updated values.
 *
 * Returns:
 *   - error: An error if the update fails, otherwise nil.
 */
func (r *GormGameRepository) UpdatePlayer(player *domain.Player) error {
	return r.db.Save(player).Error
}

/*
 * NewGormGameRepository constructs a new GormGameRepository instance.
 *
 * Parameters:
 *   - db (*gorm.DB): A GORM database connection instance.
 *
 * Returns:
 *   - *GormGameRepository: A repository instance bound to the database.
 */
func NewGormGameRepository(db *gorm.DB) *GormGameRepository {
	return &GormGameRepository{db: db}
}

/*
 * Create inserts a new game record into the database.
 *
 * Parameters:
 *   - game (*domain.Game): The game entity to persist.
 *
 * Returns:
 *   - error: An error if creation fails, otherwise nil.
 */
func (r *GormGameRepository) Create(game *domain.Game) error {
	return r.db.Create(game).Error
}

/*
 * Update saves the updated fields of a game record into the database.
 *
 * Parameters:
 *   - game (*domain.Game): The game entity with modifications.
 *
 * Returns:
 *   - error: An error if the update fails, otherwise nil.
 */
func (r *GormGameRepository) Update(game *domain.Game) error {
	return r.db.Save(game).Error
}

/*
 * GetByRoomID retrieves a game by its associated RoomID.
 *
 * Parameters:
 *   - roomID (string): The unique identifier of the room.
 *
 * Returns:
 *   - *domain.Game: The matching game entity.
 *   - error: An error if the query fails or the record is not found.
 */
func (r *GormGameRepository) GetByRoomID(roomID string) (*domain.Game, error) {
	var game domain.Game
	err := r.db.Preload("PlayerX").Preload("PlayerO").Where("room_id = ?", roomID).First(&game).Error
	return &game, err
}

/*
 * GetOrCreatePlayerByName retrieves an existing player by name or creates one if not found.
 *
 * Parameters:
 *   - name (string): The player's name.
 *
 * Returns:
 *   - *domain.Player: The retrieved or newly created player.
 *   - error: An error if the operation fails.
 */
func (r *GormGameRepository) GetOrCreatePlayerByName(name string) (*domain.Player, error) {
	var player domain.Player
	err := r.db.Where(domain.Player{Name: name}).FirstOrCreate(&player).Error
	return &player, err
}

/*
 * GetPlayerByID retrieves a player by their unique ID.
 *
 * Parameters:
 *   - id (uint): The player's ID.
 *
 * Returns:
 *   - *domain.Player: The player entity, or nil if not found.
 *   - error: An error if the query fails.
 */
func (r *GormGameRepository) GetPlayerByID(id uint) (*domain.Player, error) {
	var player domain.Player
	if err := r.db.First(&player, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &player, nil
}

/*
 * GetFinishedGamesByRoomID retrieves finished games by its associated RoomID.
 *
 * Parameters:
 *   - roomID (string): The unique identifier of the room.
 *
 * Returns:
 *   - []domain.Game: The matching finished game entities.
 *   - error: An error if the query fails.
 */
func (r *GormGameRepository) GetFinishedGamesByRoomID(roomID string) ([]domain.Game, error) {
	var games []domain.Game
	err := r.db.Preload("PlayerX").Preload("PlayerO").Preload("Winner").
		Where("room_id = ? AND status = ?", roomID, "finished").
		Order("created_at DESC").
		Find(&games).Error
	if err != nil {
		return nil, err
	}
	return games, nil
}

/*
 * GormStatsRepository is the GORM implementation of the StatsRepository port.
 *
 * Responsibilities:
 *   - Provide queries for statistics about players and games.
 */
type GormStatsRepository struct {
	db *gorm.DB
}

/*
 * NewGormStatsRepository constructs a new GormStatsRepository instance.
 *
 * Parameters:
 *   - db (*gorm.DB): A GORM database connection instance.
 *
 * Returns:
 *   - *GormStatsRepository: A repository instance bound to the database.
 */
func NewGormStatsRepository(db *gorm.DB) *GormStatsRepository {
	return &GormStatsRepository{db: db}
}

/*
 * GetTopPlayers retrieves the top players ranked by number of wins.
 *
 * Parameters:
 *   - limit (int): The maximum number of players to retrieve.
 *
 * Returns:
 *   - []domain.Player: The list of top players.
 *   - error: An error if the query fails.
 */
func (r *GormStatsRepository) GetTopPlayers(limit int) ([]domain.Player, error) {
	var players []domain.Player
	err := r.db.Order("wins desc").Limit(limit).Find(&players).Error
	return players, err
}

/*
 * CountGames returns the total number of games played.
 *
 * Returns:
 *   - int64: The total number of games.
 *   - error: An error if the query fails.
 */
func (r *GormStatsRepository) CountGames() (int64, error) {
	var count int64
	err := r.db.Model(&domain.Game{}).Count(&count).Error
	return count, err
}

/*
 * CountPlayers returns the total number of registered players.
 *
 * Returns:
 *   - int64: The total number of players.
 *   - error: An error if the query fails.
 */
func (r *GormStatsRepository) CountPlayers() (int64, error) {
	var count int64
	err := r.db.Model(&domain.Player{}).Count(&count).Error
	return count, err
}

/*
 * GetGamesByRoomID retrieves all games associated with a given room.
 *
 * Parameters:
 *   - roomID (string): The room identifier.
 *
 * Returns:
 *   - []domain.Game: A list of games for the specified room.
 *   - error: An error if the query fails.
 */
func (r *GormStatsRepository) GetGamesByRoomID(roomID string) ([]domain.Game, error) {
	var games []domain.Game
	result := r.db.Preload("PlayerX").Preload("PlayerO").Preload("Winner").
		Where("room_id = ?", roomID).
		Order("created_at DESC").
		Find(&games)
	if result.Error != nil {
		return nil, result.Error
	}
	return games, nil
}

/*
 * GetPlayerByName retrieves a player by their exact name.
 *
 * Parameters:
 *   - name (string): The player's name.
 *
 * Returns:
 *   - *domain.Player: The matching player entity.
 *   - error: An error if the query fails.
 */
func (r *GormStatsRepository) GetPlayerByName(name string) (*domain.Player, error) {
	var player domain.Player
	result := r.db.Where("name = ?", name).First(&player)
	if result.Error != nil {
		return nil, result.Error
	}
	return &player, nil
}
