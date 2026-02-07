CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TYPE draw_mode AS ENUM ('draw', 'erase');
CREATE TYPE pen_color AS ENUM ('black', 'red', 'blue');

CREATE TABLE rooms (
    -- id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_code VARCHAR(5) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    -- id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), 
    username VARCHAR(255) NOT NULL,
    room_id uuid NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_room 
        FOREIGN KEY (room_id) REFERENCES rooms(id)
        ON DELETE CASCADE,

    UNIQUE (username, room_id)
);

CREATE TABLE lines (
    -- id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), 
    room_id uuid NOT NULL,
    -- user_id bigint NOT NULL,
    username VARCHAR(255) NOT NULL,
    draw_mode draw_mode,
    color pen_color,
    brush_size int DEFAULT 5,
    points float[],
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_room 
        FOREIGN KEY (room_id) REFERENCES rooms(id)
        ON DELETE CASCADE

    -- CONSTRAINT fk_user 
    --     FOREIGN KEY (user_id) REFERENCES users(id)
);
