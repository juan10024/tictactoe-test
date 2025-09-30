/*
 * file: 001_initial_schema.sql
 * package: migrations
 * description:
 *     Defines the initial database schema for the Tic-Tac-Toe application.
 *     Sets up tables for players, games, and game moves with appropriate
 *     primary keys, foreign key relationships, and indexes for efficient querying.
 *     This script is automatically executed by the PostgreSQL container on first run.
 */

-- Create a custom function to automatically update the 'updated_at' timestamp.
-- This is a common PostgreSQL pattern to avoid managing this in application code.
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Table: players
-- Stores information about each unique player.
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    wins INTEGER NOT NULL DEFAULT 0,
    draws INTEGER NOT NULL DEFAULT 0,
    losses INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Index on name for fast lookups and on wins for ranking queries.
CREATE INDEX idx_players_name ON players(name);
CREATE INDEX idx_players_wins ON players(wins DESC);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON players
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Table: games
-- Stores information about each game session.
-- This enables tracking of historical games in the same room for statistics.
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    room_id VARCHAR(50) NOT NULL,  -- REMOVED UNIQUE constraint to allow multiple games per room
    player_x_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
    player_o_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
    winner_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL, -- "waiting", "in_progress", "finished"
    board CHAR(9) NOT NULL,
    current_turn CHAR(1) NOT NULL
);
-- Index on room_id for fast game lookups by room.
CREATE INDEX idx_games_room_id ON games(room_id);
-- Index on status for filtering active/finished games.
CREATE INDEX idx_games_status ON games(status);
-- Composite index for efficient queries of games by room and status.
CREATE INDEX idx_games_room_id_status ON games(room_id, status);
-- Index on created_at for ordering historical games by date.
CREATE INDEX idx_games_created_at ON games(created_at DESC);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON games
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Table: game_moves
-- Logs every move in every game for auditing or future features like replays.
CREATE TABLE IF NOT EXISTS game_moves (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    "position" INTEGER NOT NULL,
    symbol CHAR(1) NOT NULL
);
-- Index on game_id to quickly retrieve all moves for a specific game.
CREATE INDEX idx_game_moves_game_id ON game_moves(game_id);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON game_moves
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();