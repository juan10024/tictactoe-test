// backend/main.go
/*
 * Entry Point for the Tic-Tac-Toe Backend Service.
 *
 * This file initializes the application by setting up dependencies, configuring the database,
 * establishing API routes, and launching the web server. It follows a dependency injection
 * pattern to wire together components, promoting a decoupled and testable architecture.
 * The architecture is inspired by "Screaming Architecture" principles, where the project
 * structure reflects the application's domain.
 */
package main

import (
	"log"
	"net/http"
	"time"

	"github.com/juan10024/tictactoe-test/backend/internal/adapters/db"
	"github.com/juan10024/tictactoe-test/backend/internal/adapters/handlers"
	"github.com/juan10024/tictactoe-test/backend/internal/core/services"
	"github.com/juan10024/tictactoe-test/backend/internal/infra/repository"
)

func main() {
	// 1. Database Initialization
	dbConn, err := db.InitializeDatabase()
	if err != nil {
		log.Fatalf("FATAL: Database initialization failed: %v", err)
	}
	log.Println("SUCCESS: Database connection pool established.")

	// 2. Dependency Injection (repositories, services, hub)
	gameRepo := repository.NewGormGameRepository(dbConn)
	statsRepo := repository.NewGormStatsRepository(dbConn)

	hub := services.NewHub()
	go hub.Run() // Run the WebSocket hub in a separate goroutine.

	gameService := services.NewGameService(gameRepo)
	statsService := services.NewStatsService(statsRepo)

	// 3. Handler & Router Configuration
	// We create handlers so they are available for wiring routes.
	// NOTE: ensure handlers expose methods for each route; if you don't use
	// a handler immediately, you must either register routes or discard the variable.
	gameHandler := handlers.NewGameHandler(gameService, hub)
	_ = gameHandler // avoid "declared and not used" compile error
	// TODO: register game routes below when handler methods are implemented:
	// e.g. router.HandleFunc("/api/games", gameHandler.ListGames)

	statsHandler := handlers.NewStatsHandler(statsService)
	wsHandler := handlers.NewWebSocketHandler(hub, gameService) // Inject GameService for join logic

	// 4. Router registration
	router := http.NewServeMux()
	// WebSocket endpoint (handlers should parse room/player from query or URL)
	router.HandleFunc("/ws/join/", wsHandler.HandleConnection)
	// Stats API
	router.HandleFunc("/api/stats/ranking", statsHandler.GetRanking)
	router.HandleFunc("/api/stats/general", statsHandler.GetGeneralStats)

	// 5. HTTP Server Configuration & Launch
	server := &http.Server{
		Addr:         ":8080",
		Handler:      router,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	log.Println("INFO: HTTP server starting on port 8080...")
	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("FATAL: Could not start server: %v", err)
	}
}
