/*
 * file: game.go
 * package: domain
 * description:
 *     Defines the core domain entities of the application.
 *     These structs are shared across all layers, including database persistence
 *     (via GORM), business logic (services), and transport (DTOs).
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
	Draws  int    `gorm:"default:0" json:"draws"`
	Losses int    `gorm:"default:0" json:"losses"`

	CreatedAt time.Time `json:"-"`
	UpdatedAt time.Time `json:"-"`
}

// Game represents a single Tic-Tac-Toe match.
type Game struct {
	gorm.Model
	RoomID      string `gorm:"size:50;not null" json:"roomID"`
	PlayerXID   *uint  `json:"playerXID"`
	PlayerX     Player `json:"playerX" gorm:"foreignKey:PlayerXID"`
	PlayerOID   *uint  `json:"playerOID"`
	PlayerO     Player `json:"playerO" gorm:"foreignKey:PlayerOID"`
	WinnerID    *uint  `json:"winnerID"`
	Winner      Player `json:"winner" gorm:"foreignKey:WinnerID"`
	Status      string `gorm:"size:20;not null" json:"status"`
	Board       string `gorm:"type:char(9);not null" json:"board"`
	CurrentTurn string `gorm:"type:char(1);not null" json:"currentTurn"`
}

// GameMove represents a single move made during a game.
// Useful for auditing or implementing a replay feature.
type GameMove struct {
	gorm.Model
	GameID   uint
	Game     Game `gorm:"foreignKey:GameID"`
	PlayerID uint
	Player   Player `gorm:"foreignKey:PlayerID"`
	Position int    `gorm:"not null"`
	Symbol   string `gorm:"type:char(1);not null"`
}
