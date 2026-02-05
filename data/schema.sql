CREATE DATABASE whiteboard;
CREATE TYPE draw_mode AS ENUM ('draw', 'erase');
CREATE TYPE pen_color AS ENUM ('black', 'red', 'blue');

CREATE TABLE rooms (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    room_code VARCHAR(5) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    username VARCHAR(255) UNIQUE NOT NULL,
    room_id bigint NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_room 
        FOREIGN KEY (room_id) REFERENCES rooms(id)
        ON DELETE CASCADE
);

CREATE TABLE lines (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    room_id bigint NOT NULL,
    user_id bigint NOT NULL,
    mode draw_mode,
    color pen_color,
    brush_size int DEFAULT 5,
    points float[],
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_room 
        FOREIGN KEY (room_id) REFERENCES rooms(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user 
        FOREIGN KEY (user_id) REFERENCES users(id)
);
