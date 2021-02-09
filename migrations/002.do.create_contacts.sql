DROP TABLE IF EXISTS contacts;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE contacts (
    user_id uuid REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
    contact_id uuid REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
    contact_name TEXT NOT NULL
);