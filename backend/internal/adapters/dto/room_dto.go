/*
 * file: room_dto.go
 * package: dto
 * description:
 *     Provides services to management JoinRoom Request.
 */
package dto

import (
	"github.com/juan10024/tictactoe-test/internal/core/domain"
)

type JoinRoomRequest struct {
	PlayerName string `json:"playerName"`
}

type JoinRoomResponse struct {
	Error      bool           `json:"error"`
	Message    string         `json:"message"`
	Game       *domain.Game   `json:"game,omitempty"`
	Player     *domain.Player `json:"player,omitempty"`
	RoomID     string         `json:"roomId,omitempty"`
	PlayerID   uint           `json:"playerId,omitempty"`
	PlayerName string         `json:"playerName,omitempty"`
}
