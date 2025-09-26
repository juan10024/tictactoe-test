// backend/internal/adapters/db/db.go
/*
 * Database Adapter
 *
 * This package is responsible for establishing and configuring the connection
 * to the PostgreSQL database using GORM. It includes connection pooling settings
 * for performance and resilience and handles schema auto-migration.
 */
package db

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/juan10024/tictactoe-test/backend/internal/core/domain"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// InitializeDatabase configures and returns a GORM DB instance.
func InitializeDatabase() (*gorm.DB, error) {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent), // Use logger.Info for verbose query logging
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configure Connection Pool for performance and stability
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}
	sqlDB.SetMaxIdleConns(10)           // Max number of connections in the idle connection pool
	sqlDB.SetMaxOpenConns(100)          // Max number of open connections to the database
	sqlDB.SetConnMaxLifetime(time.Hour) // Max amount of time a connection may be reused

	// AutoMigrate the schema. In a real-world production environment, a more robust
	// migration tool like GORM's migrator or an external tool (e.g., migrate, goose) is recommended.
	if err := db.AutoMigrate(&domain.Player{}, &domain.Game{}, &domain.GameMove{}); err != nil {
		return nil, fmt.Errorf("database schema migration failed: %w", err)
	}
	log.Println("INFO: Database schema migration completed successfully.")

	return db, nil
}
