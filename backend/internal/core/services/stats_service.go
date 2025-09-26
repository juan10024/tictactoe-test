// backend/internal/core/services/stats_service.go
/*
 * Statistics Service (Application Core)
 *
 * This service provides business logic for aggregating and retrieving game statistics.
 * It acts as a facade over the stats repository, transforming raw data into meaningful
 * DTOs (Data Transfer Objects) for the presentation layer.
 */
package services

import (
	"github.com/juan10024/tictactoe-test/internal/core/domain"
	"github.com/juan10024/tictactoe-test/internal/core/ports"
)

// StatsService provides statistics-related business logic.
type StatsService struct {
	repo ports.StatsRepository
}

// NewStatsService creates a new instance of StatsService.
func NewStatsService(r ports.StatsRepository) *StatsService {
	return &StatsService{repo: r}
}

// RankingResponse is the DTO for player ranking.
type RankingResponse struct {
	Players []domain.Player `json:"players"`
}

// GeneralStatsResponse is the DTO for general statistics.
type GeneralStatsResponse struct {
	TotalGames   int64 `json:"totalGames"`
	TotalPlayers int64 `json:"totalPlayers"`
}

// GetRanking retrieves the top players, ordered by wins.
func (s *StatsService) GetRanking() (*RankingResponse, error) {
	players, err := s.repo.GetTopPlayers(10) // Fetch top 10 players
	if err != nil {
		return nil, err
	}
	return &RankingResponse{Players: players}, nil
}

// GetGeneralStats retrieves high-level statistics about the game.
func (s *StatsService) GetGeneralStats() (*GeneralStatsResponse, error) {
	totalGames, err := s.repo.CountGames()
	if err != nil {
		return nil, err
	}
	totalPlayers, err := s.repo.CountPlayers()
	if err != nil {
		return nil, err
	}
	return &GeneralStatsResponse{
		TotalGames:   totalGames,
		TotalPlayers: totalPlayers,
	}, nil
}
