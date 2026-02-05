-- Create Room
INSERT INTO rooms (room_code) VALUES ('ALKFJ');


-- Add new users
INSERT INTO users (username, room_id)
SELECT 'alfex', id
FROM rooms
WHERE room_code='ALKFJ';

-- Add new users (Alternate query)
INSERT INTO users (username, room_id) VALUES ('alex', (SELECT id FROM rooms WHERE room_code = 'ALKFJ'));

-- Add new line to canvas
INSERT INTO lines (room_id, user_id, mode, color, brush_size, points)
SELECT room_id, id, 'draw', 'black', 5, '{1.5, 2.5, 2, 6, 9, 10, 55}' as points  
FROM users
JOIN rooms ON users.room_id = rooms.id
WHERE users.username = 'alex' AND rooms.room_code = 'room_code'
RETURNING *;

-- Add new line (Alternate query)
INSERT INTO lines (room_id, user_id, mode, color, brush_size, points)
VALUES (
    (SELECT room_id FROM users WHERE username = 'conor'),
    (SELECT id FROM users WHERE username = 'conor'),
    'draw',
    'black',
    5,
    '{1.5, 2.5, 2, 6, 9, 10, 55}'
);

-- Get all lines created by User
SELECT users.username, lines.mode, lines.color, lines.brush_size, lines.points 
FROM lines 
JOIN users ON lines.user_id = users.id
WHERE users.username = 'alex'
ORDER BY lines.created_at ASC;

-- Get all lines in a room
SELECT users.username, lines.mode, lines.color, lines.brush_size, lines.points 
FROM lines 
JOIN rooms ON lines.room_id = rooms.id
JOIN users ON lines.user_id = users.id WHERE rooms.room_code = 'ABCDE'
ORDER BY lines.created_at ASC;

-- Get all users in a room
SELECT username, joined_at
FROM users 
JOIN rooms ON users.room_id = rooms.id
WHERE rooms.room_code = 'ALKFJ'

-- Get user count
SELECT COUNT(*)
FROM users 
JOIN rooms ON users.room_id = rooms.id
WHERE rooms.room_code = 'ALKFJ'

-- Delete Room
DELETE FROM rooms WHERE room_id='ABCDE';

-- Delete User
DELETE FROM users WHERE username='alex';

