import { describe, it, expect, beforeEach, afterEach } from "vitest";
import AppError from "../src/utils/error.js";
import { PoolClient } from "pg";
import { dbTest } from "./contexts/dbTestContext.js";
import {
  createRoom,
  deleteRoom,
  roomExists,
  roomExistsFromCode,
  getMembersInRoom,
} from "../src/models/rooms.js";
import { addMember } from "../src/models/members.js";
import { createUser } from "../src/models/users.js";

const uuidRegex =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

describe("Rooms Model Tests", () => {
  dbTest("Create room", async ({ dbClient }) => {
    const result = await createRoom(dbClient);
    expect(result).toHaveProperty("room_code");
    expect(result).toHaveProperty("id");
    expect(result.room_code).toHaveLength(5);
    expect(result.id).toMatch(uuidRegex);
  });

  dbTest("Create if room exists", async ({ dbClient }) => {
    const { id, room_code } = await createRoom(dbClient);
    expect(await roomExists(id, dbClient)).toBe(true);
    expect(await roomExistsFromCode(room_code, dbClient)).toBe(true);
    expect(
      await roomExists("dd9f9cf0-61b1-4a97-9e15-a9dfdfbefa95", dbClient),
    ).toBe(false);
    expect(await roomExistsFromCode("ABCDE", dbClient)).toBe(false);
  });

  dbTest("Delete room", async ({ dbClient }) => {
    const { id, room_code } = await createRoom(dbClient);
    await deleteRoom(id, dbClient);
    await expect(roomExists(id, dbClient)).resolves.toBe(false);
  });

  dbTest("Delete non-existent room", async ({ dbClient }) => {
    try {
      await deleteRoom("dd9f9cf0-61b1-4a97-9e15-a9dfdfbefa95", dbClient);
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect(err).toHaveProperty("message", "Room not found");
      expect(err).toHaveProperty("status", 404);
    }
  });

  dbTest("Create multiple rooms", async ({ dbClient }) => {
    const room1 = await createRoom(dbClient);
    const room2 = await createRoom(dbClient);
    expect(room1.id).not.toBe(room2.id);
    expect(room1.room_code).not.toBe(room2.room_code);
  });

  dbTest("Get members in room", async ({ dbClient }) => {
    const { id, room_code } = await createRoom(dbClient);
    const members = await getMembersInRoom(id, dbClient);

    // Create users and add them to the room
    const user1 = await createUser("testuser1", "password", dbClient);
    const user2 = await createUser("testuser2", "password", dbClient);
    const user3 = await createUser("testuser3", "password", dbClient);

    const member1 = await addMember(user1.id, room_code, dbClient);
    const member2 = await addMember(user2.id, room_code, dbClient);
    const member3 = await addMember(user3.id, room_code, dbClient);

    const membersAfter = await getMembersInRoom(id, dbClient);

    expect(membersAfter).toHaveLength(3);
    expect(membersAfter[0]).toHaveProperty("username", "testuser1");
    expect(membersAfter[1]).toHaveProperty("username", "testuser2");
    expect(membersAfter[2]).toHaveProperty("username", "testuser3");

    expect(membersAfter[0]).toHaveProperty("user_id", user1.id);
    expect(membersAfter[1]).toHaveProperty("user_id", user2.id);
    expect(membersAfter[2]).toHaveProperty("user_id", user3.id);
  });
});
