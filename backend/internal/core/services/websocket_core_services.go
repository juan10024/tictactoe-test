/*
 * file: websocket_core_services.go
 * package: services
 * description:
 *     WebSocket core service for handling client connections, room joining, and game state broadcasting.
 */

package services

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/juan10024/tictactoe-test/internal/core/domain"
)

// GameStateBroadcast represents the payload sent to clients with game state updates.
type GameStateBroadcast struct {
	Type      string       `json:"type"`
	GameState *domain.Game `json:"gameState"`
	Players   struct {
		X *domain.Player `json:"X"`
		O *domain.Player `json:"O"`
	} `json:"players"`
	IsObserver bool `json:"isObserver"`
}

/*
 * ServeWs handles new WebSocket connections and initializes the client.
 *
 * Parameters:
 *   - hub (*Hub): Reference to the Hub managing rooms and clients.
 *   - gameService (*GameService): Service used to handle game logic.
 *   - w (http.ResponseWriter): HTTP response writer.
 *   - r (*http.Request): Incoming HTTP request.
 *   - roomID (string): ID of the room to join.
 *   - playerName (string): Name of the player joining.
 *
 * Returns:
 *   - None.
 */
func ServeWs(hub *Hub, gameService *GameService, w http.ResponseWriter, r *http.Request, roomID, playerName string) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	game, player, err := gameService.HandleJoinRoom(roomID, playerName)
	if err != nil {
		log.Printf("ERROR: Could not handle join room: %v", err)
		conn.Close()
		return
	}

	isObserver := false
	if game.Status == "in_progress" ||
		(game.PlayerXID != nil && *game.PlayerXID != player.ID &&
			game.PlayerOID != nil && *game.PlayerOID != player.ID) {
		isObserver = true
	}

	client := &Client{
		hub:        hub,
		conn:       conn,
		send:       make(chan []byte, 256),
		room:       roomID,
		playerID:   player.ID,
		playerName: player.Name,
		isObserver: isObserver,
	}
	hub.register <- client

	broadcastGameState(hub, gameService, roomID)

	if !isObserver && game.Status == "waiting" && game.PlayerXID != nil && game.PlayerOID != nil {
		game.Status = "in_progress"
		game.CurrentTurn = "X"
		if err := gameService.repo.Update(game); err != nil {
			log.Printf("ERROR: Could not start game in room %s: %v", roomID, err)
		} else {
			broadcastGameState(hub, gameService, roomID)
		}
	}

	go client.writePump()
	go client.readPump(gameService)
}

/*
 * broadcastGameState retrieves the current game state and sends it to all clients in the room.
 *
 * Parameters:
 *   - hub (*Hub): Reference to the Hub managing rooms and clients.
 *   - gs (*GameService): Service to retrieve game and player data.
 *   - roomID (string): ID of the room to broadcast to.
 *
 * Returns:
 *   - None.
 */
func broadcastGameState(hub *Hub, gs *GameService, roomID string) {
	game, err := gs.repo.GetByRoomID(roomID)
	if err != nil {
		log.Printf("ERROR: Could not get game state for room %s: %v", roomID, err)
		return
	}

	var playerX, playerO *domain.Player
	if game.PlayerXID != nil {
		playerX, _ = gs.GetPlayerByID(*game.PlayerXID)
	}
	if game.PlayerOID != nil {
		playerO, _ = gs.GetPlayerByID(*game.PlayerOID)
	}

	broadcastMsg := GameStateBroadcast{
		Type:      "gameStateUpdate",
		GameState: game,
		Players: struct {
			X *domain.Player `json:"X"`
			O *domain.Player `json:"O"`
		}{X: playerX, O: playerO},
	}

	msgBytes, err := json.Marshal(broadcastMsg)
	if err != nil {
		log.Printf("ERROR: Could not marshal game state: %v", err)
		return
	}

	hub.broadcast(roomID, msgBytes)
}
