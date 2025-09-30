/*
 * file: main_handlers.go
 * package: handlers
 * description:
 *     Provides HTTP handlers for game-related routes, statistics retrieval,
 *     and WebSocket connection management.
 */

package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/juan10024/tictactoe-test/internal/core/services"
)

/*
 * GameHandler handles game-related HTTP requests.
 *
 * Fields:
 *   - gameService (*services.GameService): Service that contains game business logic.
 *   - hub (*services.Hub): WebSocket hub used for broadcasting updates.
 *
 * Returns:
 *   - *GameHandler: A new instance of GameHandler.
 */
type GameHandler struct {
	gameService *services.GameService
	hub         *services.Hub
}

func NewGameHandler(s *services.GameService, h *services.Hub) *GameHandler {
	return &GameHandler{gameService: s, hub: h}
}

/*
 * StatsHandler handles HTTP requests related to game statistics.
 *
 * Fields:
 *   - statsService (*services.StatsService): Service that provides statistics data.
 *
 * Returns:
 *   - *StatsHandler: A new instance of StatsHandler.
 */
type StatsHandler struct {
	statsService *services.StatsService
}

func NewStatsHandler(s *services.StatsService) *StatsHandler {
	return &StatsHandler{statsService: s}
}

/*
 * respondWithJSON sends a JSON response with a given status code.
 *
 * Parameters:
 *   - w (http.ResponseWriter): The HTTP response writer.
 *   - code (int): HTTP status code.
 *   - payload (interface{}): Data to be serialized to JSON.
 *
 * Returns:
 *   - None.
 */
func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, _ := json.Marshal(payload)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(response)
}

/*
 * respondWithError sends a standardized error response as JSON.
 *
 * Parameters:
 *   - w (http.ResponseWriter): The HTTP response writer.
 *   - code (int): HTTP status code.
 *   - message (string): Error message to include in the response.
 *
 * Returns:
 *   - None.
 */
func respondWithError(w http.ResponseWriter, code int, message string) {
	respondWithJSON(w, code, map[string]string{"error": message})
}

/*
 * GetRanking returns the current player ranking as JSON.
 *
 * Parameters:
 *   - w (http.ResponseWriter): The HTTP response writer.
 *   - r (*http.Request): The HTTP request.
 *
 * Returns:
 *   - None. Writes the ranking to the response.
 */
func (h *StatsHandler) GetRanking(w http.ResponseWriter, r *http.Request) {
	ranking, err := h.statsService.GetRanking()
	if err != nil {
		log.Printf("ERROR: Failed to get ranking: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Could not retrieve player ranking.")
		return
	}
	respondWithJSON(w, http.StatusOK, ranking)
}

/*
 * GetGeneralStats returns general game statistics as JSON.
 *
 * Parameters:
 *   - w (http.ResponseWriter): The HTTP response writer.
 *   - r (*http.Request): The HTTP request.
 *
 * Returns:
 *   - None. Writes the statistics to the response.
 */
func (h *StatsHandler) GetGeneralStats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.statsService.GetGeneralStats()
	if err != nil {
		log.Printf("ERROR: Failed to get general stats: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Could not retrieve general statistics.")
		return
	}
	respondWithJSON(w, http.StatusOK, stats)
}

// GetGameHistory returns the game history for a specific room
func (h *StatsHandler) GetGameHistory(w http.ResponseWriter, r *http.Request) {

	path := strings.TrimPrefix(r.URL.Path, "/api/rooms/history/")
	roomID := path

	if roomID == "" {
		http.Error(w, "Room ID is required as path parameter", http.StatusBadRequest)
		return
	}

	history, err := h.statsService.GetGameHistory(roomID)
	if err != nil {
		log.Printf("ERROR: Failed to get game history for room %s: %v", roomID, err)
		respondWithError(w, http.StatusInternalServerError, "Could not retrieve game history.")
		return
	}

	respondWithJSON(w, http.StatusOK, history)
}

// GetPlayerStats returns statistics for a specific player
func (h *StatsHandler) GetPlayerStats(w http.ResponseWriter, r *http.Request) {
	playerName := r.URL.Query().Get("playerName")
	if playerName == "" {
		http.Error(w, "Player name is required as query parameter", http.StatusBadRequest)
		return
	}

	player, err := h.statsService.GetPlayerStats(playerName)
	if err != nil {
		log.Printf("ERROR: Failed to get player stats for %s: %v", playerName, err)
		respondWithError(w, http.StatusInternalServerError, "Could not retrieve player statistics.")
		return
	}

	respondWithJSON(w, http.StatusOK, player)
}

/*
 * WebSocketHandler manages WebSocket connections for real-time communication.
 *
 * Fields:
 *   - hub (*services.Hub): WebSocket hub for managing clients.
 *   - gameService (*services.GameService): Service used to handle game logic.
 *
 * Returns:
 *   - *WebSocketHandler: A new instance of WebSocketHandler.
 */
type WebSocketHandler struct {
	hub         *services.Hub
	gameService *services.GameService
}

func NewWebSocketHandler(h *services.Hub, gs *services.GameService) *WebSocketHandler {
	return &WebSocketHandler{hub: h, gameService: gs}
}

/*
 * HandleConnection upgrades an HTTP request to a WebSocket connection and registers it.
 *
 * Parameters:
 *   - w (http.ResponseWriter): The HTTP response writer.
 *   - r (*http.Request): The HTTP request containing the room ID and player name.
 *
 * Returns:
 *   - None.
 */
func (h *WebSocketHandler) HandleConnection(w http.ResponseWriter, r *http.Request) {
	roomID := strings.TrimPrefix(r.URL.Path, "/ws/join/")
	playerName := r.URL.Query().Get("playerName")

	if roomID == "" || playerName == "" {
		http.Error(w, "Room ID and Player Name are required", http.StatusBadRequest)
		return
	}

	services.ServeWs(h.hub, h.gameService, w, r, roomID, playerName)
}
