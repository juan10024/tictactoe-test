/*
 * file: main.go
 * package: main
 * description:
 *     This file initializes the application by setting up dependencies, configuring the database,
 *     establishing API routes, and launching the web server. It follows a dependency injection
 *     pattern to wire together components, promoting a decoupled and testable architecture.
 */

package main

import (
	"log"
	"net/http"
	"time"

	"github.com/juan10024/tictactoe-test/internal/adapters/db"
	"github.com/juan10024/tictactoe-test/internal/adapters/handlers"
	"github.com/juan10024/tictactoe-test/internal/core/services"
	"github.com/juan10024/tictactoe-test/internal/infra/repository"
)

/*
 * main is the entry point of the application.
 *
 * This function performs the following tasks:
 *   - Initializes the database connection pool.
 *   - Sets up repositories, services, and the WebSocket hub (dependency injection).
 *   - Configures HTTP handlers and registers API routes.
 *   - Creates and starts the HTTP server with timeouts and CORS middleware.
 *
 * Parameters:
 *   - None.
 *
 * Returns:
 *   - None.
 */
func main() {
	// Database Initialization
	dbConn, err := db.InitializeDatabase()
	if err != nil {
		log.Fatalf("FATAL: Database initialization failed: %v", err)
	}
	log.Println("SUCCESS: Database connection pool established.")

	// Dependency Injection
	gameRepo := repository.NewGormGameRepository(dbConn)
	statsRepo := repository.NewGormStatsRepository(dbConn)

	hub := services.NewHub()
	go hub.Run()

	gameService := services.NewGameService(gameRepo)
	statsService := services.NewStatsService(statsRepo)

	// Handler & Router Configuration
	gameHandler := handlers.NewGameHandler(gameService, hub)
	_ = gameHandler

	statsHandler := handlers.NewStatsHandler(statsService)
	wsHandler := handlers.NewWebSocketHandler(hub, gameService)
	roomHandler := handlers.NewRoomHandler(gameService)

	// Router registration
	router := http.NewServeMux()

	// Attach CORS middleware
	corsHandler := corsMiddleware(router)

	// Register endpoints
	router.HandleFunc("/ws/join/", wsHandler.HandleConnection)
	router.HandleFunc("/api/stats/ranking", statsHandler.GetRanking)
	router.HandleFunc("/api/stats/general", statsHandler.GetGeneralStats)
	router.HandleFunc("/api/rooms/join/", roomHandler.JoinRoom)

	// HTTP Server Configuration & Launch
	server := &http.Server{
		Addr:         ":8080",
		Handler:      corsHandler,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	log.Println("INFO: HTTP server starting on port 8080...")
	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("FATAL: Could not start server: %v", err)
	}
}

/*
 * corsMiddleware adds CORS (Cross-Origin Resource Sharing) headers to HTTP responses.
 *
 * Parameters:
 *   - next (http.Handler): The next handler in the chain.
 *
 * Returns:
 *   - http.Handler: A wrapped handler that applies CORS headers before invoking the next handler.
 */
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*") // Allow all origins (can be restricted)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
