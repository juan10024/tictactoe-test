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
	"tictactoe/internal/adapters/db"
	"tictactoe/internal/adapters/handlers"
	"tictactoe/internal/core/services"
	"tictactoe/internal/infra/repository"
)

func main() {
	// 1. Database Initialization
	// Initialize the GORM DB context with connection pooling for performance.
	dbConn, err := db.InitializeDatabase()
	if err != nil {
		log.Fatalf("FATAL: Database initialization failed: %v", err)
	}
	log.Println("SUCCESS: Database connection pool established.")

	// 2. Dependency Injection (DI) Container
	// Instantiate repositories, services, and the WebSocket hub. This manual DI approach
	// is lightweight and sufficient for this application's scale.
	gameRepo := repository.NewGormGameRepository(dbConn)
	statsRepo := repository.NewGormStatsRepository(dbConn)

	hub := services.NewHub()
	go hub.Run() // Run the WebSocket hub in a separate goroutine.

	gameService := services.NewGameService(gameRepo)
	statsService := services.NewStatsService(statsRepo)

	// 3. Handler & Router Configuration
	// Create handlers with injected services and set up the HTTP router.
	gameHandler := handlers.NewGameHandler(gameService, hub)
	statsHandler := handlers.NewStatsHandler(statsService)
	wsHandler := handlers.NewWebSocketHandler(hub, gameService) // Inject GameService for join logic

	router := http.NewServeMux()
	router.HandleFunc("/ws/join/", wsHandler.HandleConnection)
	router.HandleFunc("/api/stats/ranking", statsHandler.GetRanking)
	router.HandleFunc("/api/stats/general", statsHandler.GetGeneralStats)

	// 4. HTTP Server Configuration & Launch
	// Configure a robust http.Server with timeouts to prevent resource exhaustion.
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