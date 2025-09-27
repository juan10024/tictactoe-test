// backend/internal/adapters/handlers/handlers.go
package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/juan10024/tictactoe-test/internal/core/services"
)

// GameHandler is responsible for game-related HTTP requests (if any were needed).
type GameHandler struct {
	gameService *services.GameService
	hub         *services.Hub
}

func NewGameHandler(s *services.GameService, h *services.Hub) *GameHandler {
	return &GameHandler{gameService: s, hub: h}
}

// StatsHandler handles requests for game statistics.
type StatsHandler struct {
	statsService *services.StatsService
}

func NewStatsHandler(s *services.StatsService) *StatsHandler {
	return &StatsHandler{statsService: s}
}

// respondWithJSON is a helper to standardize JSON responses.
func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, _ := json.Marshal(payload)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(response)
}

// respondWithError is a helper to standardize error responses.
func respondWithError(w http.ResponseWriter, code int, message string) {
	respondWithJSON(w, code, map[string]string{"error": message})
}

// GetRanking fetches and returns the player ranking.
func (h *StatsHandler) GetRanking(w http.ResponseWriter, r *http.Request) {
	ranking, err := h.statsService.GetRanking()
	if err != nil {
		log.Printf("ERROR: Failed to get ranking: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Could not retrieve player ranking.")
		return
	}
	respondWithJSON(w, http.StatusOK, ranking)
}

// GetGeneralStats fetches and returns general game statistics.
func (h *StatsHandler) GetGeneralStats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.statsService.GetGeneralStats()
	if err != nil {
		log.Printf("ERROR: Failed to get general stats: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Could not retrieve general statistics.")
		return
	}
	respondWithJSON(w, http.StatusOK, stats)
}

// WebSocketHandler handles the WebSocket connection lifecycle.
type WebSocketHandler struct {
	hub         *services.Hub
	gameService *services.GameService
}

func NewWebSocketHandler(h *services.Hub, gs *services.GameService) *WebSocketHandler {
	return &WebSocketHandler{hub: h, gameService: gs}
}

// HandleConnection upgrades HTTP requests to WebSocket connections.
func (h *WebSocketHandler) HandleConnection(w http.ResponseWriter, r *http.Request) {
	roomID := strings.TrimPrefix(r.URL.Path, "/ws/join/")
	playerName := r.URL.Query().Get("playerName")

	if roomID == "" || playerName == "" {
		http.Error(w, "Room ID and Player Name are required", http.StatusBadRequest)
		return
	}

	services.ServeWs(h.hub, h.gameService, w, r, roomID, playerName)
}
