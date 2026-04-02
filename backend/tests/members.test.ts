import { describe, it, expect, beforeEach, afterEach } from "vitest";
import AppError from "../src/utils/error.js";
import { PoolClient } from "pg";
import { dbTest } from "./contexts/dbTestContext.js";
import {
  createRoom,
  deleteRoom,
  roomExists,
  roomExistsFromCode,
} from "../src/models/rooms.js";
import {
  addMember,
  getMember,
  getRoomFromMember,
  memberExists,
  removeMember,
} from "../src/models/members.js";
import { createUser } from "../src/models/users.js";

describe("Members Model Tests", () => {
  dbTest("Create member", async ({ dbClient }) => {
    const room = await createRoom(dbClient);
    const room_id = room.id;
    const room_code = room.room_code;

    const user = await createUser("testuser", "password123", dbClient);
    const user_id = user.id;

    const result = await addMember(user_id, room_code, dbClient);
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("room_id", room_id);
  });

  dbTest("Member exists", async ({ dbClient }) => {
    const room = await createRoom(dbClient);
    const room_code = room.room_code;
    const user = await createUser("testuser", "password123", dbClient);
    const user_id = user.id;

    await addMember(user_id, room_code, dbClient);
    const exists = await memberExists("testuser", room_code, dbClient);
    expect(exists).toBe(true);
  });

  dbTest("Member does not exist", async ({ dbClient }) => {
    const room = await createRoom(dbClient);
    const room_code = room.room_code;
    const user = await createUser("testuser", "password123", dbClient);

    const exists = await memberExists("testuser", room_code, dbClient);
    expect(exists).toBe(false);
  });

  dbTest("Get member", async ({ dbClient }) => {
    const { room_code } = await createRoom(dbClient);
    const { id } = await createUser("testuser", "password123", dbClient);

    const member = await addMember(id, room_code, dbClient);

    const result = await getMember(id, dbClient);

    expect(result).toHaveProperty("id", member.id);
    expect(result).toHaveProperty("room_id", member.room_id);
  });

  dbTest("Get no member", async ({ dbClient }) => {
    const { room_code } = await createRoom(dbClient);
    const { id } = await createUser("testuser", "password123", dbClient);
    const result = await getMember(id, dbClient);

    expect(result).toBe(null);
  });

  dbTest("Remove member", async ({ dbClient }) => {
    const { room_code } = await createRoom(dbClient);
    const { id } = await createUser("testuser", "password123", dbClient);

    const member = await addMember(id, room_code, dbClient);
    await removeMember(member.id, dbClient);
    const exists = await memberExists("testuser", room_code, dbClient);
    expect(exists).toBe(false);
  });

  dbTest("Remove non-existent member", async ({ dbClient }) => {
    try {
      await removeMember("dd9f9cf0-61b1-4a97-9e15-a9dfdfbefa95", dbClient);
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect(err).toHaveProperty("message", "Member record not found");
      expect(err).toHaveProperty("status", 404);
    }
  });

  dbTest("Get room from member", async ({ dbClient }) => {
    const { room_code } = await createRoom(dbClient);
    const { id } = await createUser("testuser", "password123", dbClient);

    const member = await addMember(id, room_code, dbClient);
    const room = await getRoomFromMember(member.id, dbClient);
    expect(room).toHaveProperty("id", member.room_id);
    expect(room).toHaveProperty("room_code", room_code);
  });
});
