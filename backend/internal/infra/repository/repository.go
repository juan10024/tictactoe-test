// backend/internal/infra/repository/repository.go
/*
 * GORM Repository Implementation (Adapter)
 *
 * This file provides the concrete implementation of the repository interfaces (ports)
 * using GORM. It translates the domain-specific repository calls into database-specific
 * queries, acting as an adapter between the application's core logic and the
 * PostgreSQL database. This separation allows the core to remain ignorant of the
 * data storage details.
 */
package repository

import (
	"errors"

	"github.com/juan10024/tictactoe-test/internal/core/domain"

	"gorm.io/gorm"
)

// GormGameRepository is the GORM implementation of the GameRepository port.
type GormGameRepository struct {
	db *gorm.DB
}

func (r *GormGameRepository) UpdatePlayer(player *domain.Player) error {
	return r.db.Save(player).Error
}

func NewGormGameRepository(db *gorm.DB) *GormGameRepository {
	return &GormGameRepository{db: db}
}

func (r *GormGameRepository) Create(game *domain.Game) error {
	return r.db.Create(game).Error
}

func (r *GormGameRepository) Update(game *domain.Game) error {
	return r.db.Save(game).Error
}

func (r *GormGameRepository) GetByRoomID(roomID string) (*domain.Game, error) {
	var game domain.Game
	// Preload associated player data for efficiency, avoiding N+1 query problems.
	err := r.db.Preload("PlayerX").Preload("PlayerO").Where("room_id = ?", roomID).First(&game).Error
	return &game, err
}

func (r *GormGameRepository) GetOrCreatePlayerByName(name string) (*domain.Player, error) {
	var player domain.Player
	// FirstOrCreate finds the first record matching the condition or creates it if not found.
	// This is an atomic and efficient way to handle player creation.
	err := r.db.Where(domain.Player{Name: name}).FirstOrCreate(&player).Error
	return &player, err
}

// GormStatsRepository is the GORM implementation of the StatsRepository port.
type GormStatsRepository struct {
	db *gorm.DB
}

func NewGormStatsRepository(db *gorm.DB) *GormStatsRepository {
	return &GormStatsRepository{db: db}
}

func (r *GormStatsRepository) GetTopPlayers(limit int) ([]domain.Player, error) {
	var players []domain.Player
	// Query for players with the highest number of wins.
	err := r.db.Order("wins desc").Limit(limit).Find(&players).Error
	return players, err
}

func (r *GormStatsRepository) CountGames() (int64, error) {
	var count int64
	err := r.db.Model(&domain.Game{}).Count(&count).Error
	return count, err
}

func (r *GormStatsRepository) CountPlayers() (int64, error) {
	var count int64
	err := r.db.Model(&domain.Player{}).Count(&count).Error
	return count, err
}

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
