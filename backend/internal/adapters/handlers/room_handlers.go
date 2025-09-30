/*
 * file: room_handler.go
 * package: handlers
 * description:
 *     Exposes HTTP endpoints for room-related operations, including joining a room.
 */

package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/juan10024/tictactoe-test/internal/adapters/dto"
	"github.com/juan10024/tictactoe-test/internal/core/services"
)

type RoomHandler struct {
	gameService *services.GameService
}

func NewRoomHandler(gameService *services.GameService) *RoomHandler {
	return &RoomHandler{
		gameService: gameService,
	}
}

func (h *RoomHandler) JoinRoom(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/api/rooms/join/")
	roomID := path

	if roomID == "" {
		http.Error(w, "Room ID is required", http.StatusBadRequest)
		return
	}

	var req dto.JoinRoomRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.PlayerName == "" {
		http.Error(w, "Player name is required", http.StatusBadRequest)
		return
	}

	game, player, err := h.gameService.HandleJoinRoom(roomID, req.PlayerName)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(dto.JoinRoomResponse{
			Error:   true,
			Message: err.Error(),
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(dto.JoinRoomResponse{
		Error:      false,
		Message:    "Successfully joined room",
		Game:       game,
		Player:     player,
		RoomID:     roomID,
		PlayerID:   player.ID,
		PlayerName: player.Name,
	})
}
