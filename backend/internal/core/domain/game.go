// backend/internal/core/domain/game.go
/*
 * Domain Models
 *
 * This file defines the core data structures (entities) of the application.
 * These structs represent the fundamental concepts of the Tic-Tac-Toe game
 * and are used across all layers, from database persistence with GORM tags
 * to the business logic in services.
 */
package domain

import (
	"time"

	"gorm.io/gorm"
)

// Player represents a user in the system.
type Player struct {
	ID     uint   `gorm:"primaryKey" json:"id"`
	Name   string `gorm:"size:50;uniqueIndex;not null" json:"name"`
	Wins   int    `gorm:"default:0" json:"wins"`
	Draws  int    `json:"draws" gorm:"default:0"`
	Losses int    `json:"losses" gorm:"default:0"`

	CreatedAt time.Time `json:"-"`
	UpdatedAt time.Time `json:"-"`
}

// Game represents a single Tic-Tac-Toe match.
type Game struct {
	gorm.Model
	RoomID      string `gorm:"size:50;uniqueIndex;not null"`
	PlayerXID   *uint
	PlayerX     Player `gorm:"foreignKey:PlayerXID"`
	PlayerOID   *uint
	PlayerO     Player `gorm:"foreignKey:PlayerOID"`
	WinnerID    *uint
	Winner      Player `gorm:"foreignKey:WinnerID"`
	Status      string `gorm:"size:20;not null"` // e.g., "waiting", "in_progress", "finished"
	Board       string `gorm:"type:char(9);not null"`
	CurrentTurn string `gorm:"type:char(1);not null"`
}

// GameMove represents a single move made in a game.
// This is useful for auditing or replaying games, though not strictly required
// by the current feature set. It demonstrates a more complete domain model.
type GameMove struct {
	gorm.Model
	GameID   uint
	Game     Game `gorm:"foreignKey:GameID"`
	PlayerID uint
	Player   Player `gorm:"foreignKey:PlayerID"`
	Position int    `gorm:"not null"`
	Symbol   string `gorm:"type:char(1);not null"`
}
