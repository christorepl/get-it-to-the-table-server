DROP TABLE IF EXISTS games;
CREATE TABLE games (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT
    game_name TEXT NOT NULL
    genres TEXT NOT NULL
);