// backend/internal/core/services/websocket.go
package services

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/juan10024/tictactoe-test/internal/core/domain"

	"github.com/gorilla/websocket"
)

const (
	writeWait      = 10 * time.Second    // Time allowed to write a message to the peer.
	pongWait       = 60 * time.Second    // Time allowed to read the next pong message from the peer.
	pingPeriod     = (pongWait * 9) / 10 // Send pings to peer with this period. Must be less than pongWait.
	maxMessageSize = 512                 // Maximum message size allowed from peer.
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true }, // Allow all origins for simplicity.
}

// Client represents a connected WebSocket user.
type Client struct {
	hub        *Hub
	conn       *websocket.Conn
	send       chan []byte // Buffered channel for outbound messages.
	room       string
	playerID   uint
	playerName string // Store player name for reference
	isObserver bool   // Flag to indicate if the client is an observer
}

// Hub maintains the set of active clients and broadcasts messages to the clients.
type Hub struct {
	register   chan *Client
	unregister chan *Client
	rooms      map[string]map[*Client]bool
	mu         sync.RWMutex // Mutex to protect the rooms map.
}

func NewHub() *Hub {
	return &Hub{
		register:   make(chan *Client),
		unregister: make(chan *Client),
		rooms:      make(map[string]map[*Client]bool),
	}
}

// Run starts the central hub logic for message and client management.
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			if h.rooms[client.room] == nil {
				h.rooms[client.room] = make(map[*Client]bool)
			}
			h.rooms[client.room][client] = true
			h.mu.Unlock()
			log.Printf("INFO: Client registered to room %s", client.room)

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.rooms[client.room]; ok {
				delete(h.rooms[client.room], client)
				if len(h.rooms[client.room]) == 0 {
					delete(h.rooms, client.room)
					log.Printf("INFO: Room %s closed.", client.room)
				}
			}
			h.mu.Unlock()
			close(client.send)
			log.Printf("INFO: Client unregistered from room %s", client.room)
		}
	}
}

// broadcast sends a message to all clients in a specific room.
func (h *Hub) broadcast(roomID string, message []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	if room, ok := h.rooms[roomID]; ok {
		for client := range room {
			select {
			case client.send <- message:
			default: // Drop message if client's send buffer is full.
				log.Printf("WARN: Client send buffer full. Closing connection for client in room %s.", client.room)
				close(client.send)
				delete(room, client)
			}
		}
	}
}

// ServeWs handles websocket requests from the peer.
func ServeWs(hub *Hub, gameService *GameService, w http.ResponseWriter, r *http.Request, roomID, playerName string) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	// Get or create the game and player
	game, player, err := gameService.HandleJoinRoom(roomID, playerName)
	if err != nil {
		log.Printf("ERROR: Could not handle join room: %v", err)
		conn.Close()
		return
	}

	// Determinar si el cliente es un observador
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

	// Broadcast updated game state to the room
	broadcastGameState(hub, gameService, roomID)

	// Check if we should start the game (only if we're not an observer and game is waiting)
	if !isObserver && game.Status == "waiting" && game.PlayerXID != nil && game.PlayerOID != nil {
		// Update game to in_progress
		game.Status = "in_progress"
		game.CurrentTurn = "X"
		if err := gameService.repo.Update(game); err != nil {
			log.Printf("ERROR: Could not start game in room %s: %v", roomID, err)
		} else {
			// Broadcast the updated game state
			broadcastGameState(hub, gameService, roomID)
		}
	}

	go client.writePump()
	go client.readPump(gameService)
}

func (c *Client) readPump(gs *GameService) {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		var msg struct {
			Type    string `json:"type"`
			Payload struct {
				Position int `json:"position"`
			} `json:"payload"`
		}

		// Handle both old and new message formats for compatibility
		if err := json.Unmarshal(message, &msg); err == nil {
			switch msg.Type {
			case "move":
				if c.isObserver {
					// Observers cannot make moves
					errorMsg := map[string]interface{}{
						"type":    "error",
						"message": "Observers cannot make moves",
					}
					errorBytes, _ := json.Marshal(errorMsg)
					c.send <- errorBytes
					continue
				}

				_, err := gs.MakeMove(c.room, c.playerID, msg.Payload.Position)
				if err != nil {
					log.Printf("ERROR: Invalid move by player %d in room %s: %v", c.playerID, c.room, err)
					// Send error message back to the client
					errorMsg := map[string]interface{}{
						"type":    "error",
						"message": err.Error(),
					}
					errorBytes, _ := json.Marshal(errorMsg)
					select {
					case c.send <- errorBytes:
					default:
						log.Printf("WARN: Could not send error message to client in room %s", c.room)
					}
				} else {
					broadcastGameState(c.hub, gs, c.room)
				}
			case "reset":
				// Only players can reset the game, not observers
				if c.isObserver {
					continue
				}

				// Reset game logic - this would require a new service method
				game, err := gs.repo.GetByRoomID(c.room)
				if err == nil && game != nil {
					// Reset the game state
					game.Board = "         "
					game.Status = "in_progress"
					game.CurrentTurn = "X" // X always starts
					game.WinnerID = nil

					if err := gs.repo.Update(game); err != nil {
						log.Printf("ERROR: Could not reset game in room %s: %v", c.room, err)
					} else {
						broadcastGameState(c.hub, gs, c.room)
					}
				}
			case "confirmGameStart":
				log.Printf("Game start confirmed by %s", c.playerName)

			case "playAgainRequest":
				// Reenviar el mensaje de solicitud de jugar de nuevo a todos los demás jugadores en la sala
				if !c.isObserver {
					playAgainMsg := map[string]interface{}{
						"type":             "playAgainRequest",
						"requestingPlayer": c.playerName,
					}
					playAgainBytes, _ := json.Marshal(playAgainMsg)

					// Enviar a todos los clientes en la sala excepto al que envió la solicitud
					c.hub.mu.RLock()
					if room, ok := c.hub.rooms[c.room]; ok {
						for otherClient := range room {
							if otherClient != c && !otherClient.isObserver {
								select {
								case otherClient.send <- playAgainBytes:
								default:
									log.Printf("WARN: Could not send playAgainRequest to client %s in room %s", otherClient.playerName, c.room)
								}
							}
						}
					}
					c.hub.mu.RUnlock()
				}
			case "play_again_menu_request":

				if !c.isObserver {
					playAgainMenuMsg := map[string]interface{}{
						"type":             "play_again_menu_request",
						"requestingPlayer": c.playerName,
					}
					playAgainMenuBytes, _ := json.Marshal(playAgainMenuMsg)

					// Enviar a todos los clientes en la sala excepto al que envió la solicitud
					c.hub.mu.RLock()
					if room, ok := c.hub.rooms[c.room]; ok {
						for otherClient := range room {
							if otherClient != c && !otherClient.isObserver {
								select {
								case otherClient.send <- playAgainMenuBytes:
								default:
									log.Printf("WARN: Could not send play_again_menu_request to client %s in room %s", otherClient.playerName, c.room)
								}
							}
						}
					}
					c.hub.mu.RUnlock()
				}
			}
		} else {
			// Try parsing as the old format (direct position)
			var position int
			if err := json.Unmarshal(message, &position); err == nil {
				if c.isObserver {
					continue
				}

				_, err := gs.MakeMove(c.room, c.playerID, position)
				if err != nil {
					log.Printf("ERROR: Invalid move by player %d in room %s: %v", c.playerID, c.room, err)
				} else {
					broadcastGameState(c.hub, gs, c.room)
				}
			}
		}
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// A DTO to structure the game state broadcast message
type GameStateBroadcast struct {
	Type      string       `json:"type"`
	GameState *domain.Game `json:"gameState"`
	Players   struct {
		X *domain.Player `json:"X"`
		O *domain.Player `json:"O"`
	} `json:"players"`
	IsObserver bool `json:"isObserver"`
}

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
