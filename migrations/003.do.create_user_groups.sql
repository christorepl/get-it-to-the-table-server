DROP TABLE IF EXISTS user_groups;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE user_groups (
    group_id uuid PRIMARY KEY DEFAULT uuid_generate_v4() UNIQUE,
    owner_id uuid NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(user_id),
    group_name TEXT NOT NULL,
    members TEXT NOT NULL UNIQUE
);