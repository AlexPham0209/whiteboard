import { describe, it, expect, beforeEach, afterEach } from "vitest";
import AppError from "../src/utils/error.js";
import { PoolClient } from "pg";
import { dbTest } from "./contexts/dbTestContext.js";
import { addLine, getCanvas, Line } from "../src/models/lines.js";
import {
  createRoom,
  deleteRoom,
  roomExists,
  roomExistsFromCode,
} from "../src/models/rooms.js";
import {
  addMember,
  getRoomFromMember,
  memberExists,
  removeMember,
} from "../src/models/members.js";
import { createUser } from "../src/models/users.js";

describe("Lines Model Tests", () => {
  dbTest("Add line", async ({ dbClient }) => {
    const room = await createRoom(dbClient);
    const room_id = room.id;
    const room_code = room.room_code;

    const users = await createUser("testuser", "password123", dbClient);
    const member = await addMember(users.id, room_code, dbClient);

    const line: Line = {
      draw_mode: "draw",
      color: "black",
      brush_size: 5,
      points: [0.1, 0.2, 0.3, 0.4],
    };

    const result = await addLine(users.id, line, dbClient);
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty("user_id", users.id);
    expect(result[0]).toHaveProperty("draw_mode", line.draw_mode);
    expect(result[0]).toHaveProperty("color", line.color);
    expect(result[0]).toHaveProperty("brush_size", line.brush_size);
    expect(result[0]).toHaveProperty("points");
    expect(result[0].points).toEqual(line.points);
  });

  dbTest("Add line with non-member user", async ({ dbClient }) => {
    const room1 = await createRoom(dbClient);
    const users = await createUser("testuser", "password123", dbClient);

    const line: Line = {
      draw_mode: "draw",
      color: "black",
      brush_size: 5,
      points: [0.1, 0.2, 0.3, 0.4],
    };
    try {
      const result = await addLine(users.id, line, dbClient);
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect(err).toHaveProperty(
        "message",
        "Unable to add line. User may not be a member of any room.",
      );
      expect(err).toHaveProperty("status", 403);
    }
  });

  dbTest("Get all lines in current room", async ({ dbClient }) => {
    const room1 = await createRoom(dbClient);
    const room2 = await createRoom(dbClient);

    const user1 = await createUser("user1", "password123", dbClient);
    const user2 = await createUser("user2", "password123", dbClient);
    const user3 = await createUser("user3", "password123", dbClient);
    const user4 = await createUser("user4", "password123", dbClient);

    const member1 = await addMember(user1.id, room1.room_code, dbClient);
    const member2 = await addMember(user2.id, room2.room_code, dbClient);
    const member3 = await addMember(user3.id, room1.room_code, dbClient);
    const member4 = await addMember(user4.id, room2.room_code, dbClient);

    const line: Line = {
      draw_mode: "draw",
      color: "black",
      brush_size: 5,
      points: [0.1, 0.2, 0.3, 0.4],
    };

    const result1 = await addLine(user1.id, line, dbClient);
    const result2 = await addLine(user2.id, line, dbClient);
    const result3 = await addLine(user3.id, line, dbClient);
    const result4 = await addLine(user4.id, line, dbClient);

    const canvas1 = await getCanvas(room1.id, dbClient);
    const canvas2 = await getCanvas(room2.id, dbClient);

    expect(canvas1).toHaveLength(2);
    expect(canvas1[0]).toHaveProperty("user_id", user1.id);
    expect(canvas1[1]).toHaveProperty("user_id", user3.id);

    expect(canvas2).toHaveLength(2);
    expect(canvas2[0]).toHaveProperty("user_id", user2.id);
    expect(canvas2[1]).toHaveProperty("user_id", user4.id);
  });
});
