DROP TABLE IF EXISTS contacts;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE contacts (
    user_id uuid NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    contact_id uuid NOT NULL,
    FOREIGN KEY (contact_id) REFERENCES users(user_id),
    contact_name TEXT NOT NULL
);