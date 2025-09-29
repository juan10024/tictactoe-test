/*
 * file: websocket_client_services.go
 * package: services
 * description:
 *     Defines the Client struct representing a connected WebSocket user, and
 *     provides the readPump and writePump methods for handling incoming and outgoing messages.
 */

package services

import (
	"encoding/json"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

// Client represents a single connected WebSocket client.
type Client struct {
	hub        *Hub            // Hub instance this client belongs to.
	conn       *websocket.Conn // Active WebSocket connection.
	send       chan []byte     // Outgoing messages channel.
	room       string          // Room identifier this client is connected to.
	playerID   uint            // Player ID in the game.
	playerName string          // Player's display name.
	isObserver bool            // Whether this client is an observer.
}

/*
 * readPump listens for incoming WebSocket messages from the client.
 *
 * Parameters:
 *   - gs (*GameService): Service used to handle game state updates and moves.
 *
 * Returns:
 *   - None.
 */
func (c *Client) readPump(gs *GameService) {
	defer func() {
		log.Printf("Client readPump closing for player %s in room %s", c.playerName, c.room)
		c.hub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error in readPump for player %s: %v", c.playerName, err)
			}
			break
		}

		var msg struct {
			Type    string `json:"type"`
			Payload struct {
				Position int `json:"position"`
			} `json:"payload"`
		}

		if err := json.Unmarshal(message, &msg); err == nil {
			switch msg.Type {
			case "move":
				if c.isObserver {
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
				if c.isObserver {
					continue
				}
				game, err := gs.repo.GetByRoomID(c.room)
				if err == nil && game != nil {
					game.Board = "         "
					game.Status = "in_progress"
					game.CurrentTurn = "X"
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
				if !c.isObserver {
					playAgainMsg := map[string]interface{}{
						"type":             "playAgainRequest",
						"requestingPlayer": c.playerName,
					}
					playAgainBytes, _ := json.Marshal(playAgainMsg)

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

/*
 * writePump sends messages from the hub to the WebSocket client.
 *
 * Parameters:
 *   - None.
 *
 * Returns:
 *   - None.
 */
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		log.Printf("Client writePump closing for player %s in room %s", c.playerName, c.room)
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				log.Printf("Send channel closed for player %s", c.playerName)
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				log.Printf("Error in writePump for player %s: %v", c.playerName, err)
				return
			}
			w.Write(message)

			if err := w.Close(); err != nil {
				log.Printf("Error closing writer for player %s: %v", c.playerName, err)
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				log.Printf("Error sending ping for player %s: %v", c.playerName, err)
				return
			}
		}
	}
}
