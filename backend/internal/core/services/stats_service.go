/*
 * file: stats_services.go
 * package: services
 * description:
 *     Defines the Users stats, provides business logic for retrieving and aggregating game statistics
 */

package services

import (
	"github.com/juan10024/tictactoe-test/internal/core/domain"
	"github.com/juan10024/tictactoe-test/internal/core/ports"
)

/*
 * StatsService provides business logic for retrieving and aggregating game statistics.
 *
 * Fields:
 *   - repo (ports.StatsRepository): Repository used to access stats data.
 */
type StatsService struct {
	repo ports.StatsRepository
}

/*
 * NewStatsService creates a new instance of StatsService.
 *
 * Parameters:
 *   - r (ports.StatsRepository): The repository implementation for stats data.
 *
 * Returns:
 *   - *StatsService: A new service instance configured with the provided repository.
 */
func NewStatsService(r ports.StatsRepository) *StatsService {
	return &StatsService{repo: r}
}

/*
 * RankingResponse represents the response DTO containing player ranking information.
 *
 * Fields:
 *   - Players ([]domain.Player): A list of top players ordered by number of wins.
 */
type RankingResponse struct {
	Players []domain.Player `json:"players"`
}

/*
 * GeneralStatsResponse represents the response DTO containing general statistics.
 *
 * Fields:
 *   - TotalGames (int64): Total number of games played.
 *   - TotalPlayers (int64): Total number of players registered.
 */
type GeneralStatsResponse struct {
	TotalGames   int64 `json:"totalGames"`
	TotalPlayers int64 `json:"totalPlayers"`
}

/*
 * GetRanking retrieves the top players based on their win count.
 *
 * Parameters:
 *   - None.
 *
 * Returns:
 *   - *RankingResponse: DTO containing the top 10 players.
 *   - error: An error if retrieving the data fails.
 */
func (s *StatsService) GetRanking() (*RankingResponse, error) {
	players, err := s.repo.GetTopPlayers(10)
	if err != nil {
		return nil, err
	}
	return &RankingResponse{Players: players}, nil
}

/*
 * GetGeneralStats retrieves aggregated statistics about the game.
 *
 * Parameters:
 *   - None.
 *
 * Returns:
 *   - *GeneralStatsResponse: DTO containing total games and total players count.
 *   - error: An error if retrieving the data fails.
 */
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
