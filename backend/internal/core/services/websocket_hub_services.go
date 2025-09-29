/*
 * file: websocket_hub_services.go
 * package: services
 * description:
 *     Hub for managing WebSocket clients, rooms, and message broadcasting.
 */

package services

import (
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

const (
	writeWait      = 10 * time.Second // Max time to write a message.
	pongWait       = 60 * time.Second // Max time to wait for next pong.
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 512 // Max incoming message size.
)

// WebSocket upgrader (allows all origins).
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

// Hub manages WebSocket clients and rooms.
type Hub struct {
	register   chan *Client                // Register new client.
	unregister chan *Client                // Unregister client.
	rooms      map[string]map[*Client]bool // Rooms and their clients.
	mu         sync.RWMutex                // Protects rooms map.
}

/*
 * NewHub creates and initializes a new Hub instance.
 *
 * Parameters:
 *   - None.
 *
 * Returns:
 *   - *Hub: a pointer to a new Hub instance.
 */
func NewHub() *Hub {
	return &Hub{
		register:   make(chan *Client),
		unregister: make(chan *Client),
		rooms:      make(map[string]map[*Client]bool),
	}
}

/*
 * Run starts the main event loop for the Hub.
 *
 * Parameters:
 *   - None.
 *
 * Returns:
 *   - None.
 */
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

/*
 * Broadcast sends a message to all connected clients in a specified room.
 *
 * Parameters:
 *   - roomID (string): The unique identifier of the room to broadcast to.
 *   - message ([]byte): The message payload to send to each client.
 *
 * Returns:
 *   - None.
 */
func (h *Hub) broadcast(roomID string, message []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	if room, ok := h.rooms[roomID]; ok {
		for client := range room {
			select {
			case client.send <- message:
			default:
				log.Printf("WARN: Client send buffer full. Closing connection for client in room %s.", client.room)
				close(client.send)
				delete(room, client)
			}
		}
	}
}
