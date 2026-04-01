CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TYPE draw_mode AS ENUM ('draw', 'erase');
CREATE TYPE pen_color AS ENUM ('black', 'red', 'blue');

-- Rooms
CREATE TABLE rooms (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_code VARCHAR(5) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_room_code ON rooms (room_code);

-- Users
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), 
    username VARCHAR(30),
    password VARCHAR,
    UNIQUE (username)
);

-- Members
CREATE TABLE members (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), 
    user_id uuid NOT NULL UNIQUE,
    room_id uuid NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_user 
        FOREIGN KEY (user_id) REFERENCES users(id),
    
    CONSTRAINT fk_room 
        FOREIGN KEY (room_id) REFERENCES rooms(id)
        ON DELETE CASCADE,
);

CREATE INDEX idx_members_user_id ON members (user_id);
CREATE INDEX idx_members_room_id ON members (room_id);
CREATE INDEX idx_members_joined_at ON members (joined_at);

-- Lines
CREATE TABLE lines (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), 
    room_id uuid NOT NULL,
    user_id uuid NOT NULL,
    draw_mode draw_mode,
    color pen_color,
    brush_size int DEFAULT 5,
    points float[],
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_user 
        FOREIGN KEY (user_id) REFERENCES users(id),

    CONSTRAINT fk_room 
        FOREIGN KEY (room_id) REFERENCES rooms(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_lines_user_id ON lines (user_id);
CREATE INDEX idx_lines_room_id ON lines (room_id);
CREATE INDEX idx_lines_created_at ON lines (created_at);
