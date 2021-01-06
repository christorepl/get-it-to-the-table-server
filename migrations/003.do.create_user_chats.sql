DROP TABLE IF EXISTS user_chats;
CREATE TABLE user_chats (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    user_id UUID NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    chat_name TEXT NOT NULL,
    users VARCHAR(255) NOT NULL
);