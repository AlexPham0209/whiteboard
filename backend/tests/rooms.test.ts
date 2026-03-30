import { describe, it, expect, beforeEach, afterEach } from "vitest";
import AppError from "../src/utils/error.js";
import { PoolClient } from "pg";
import { dbTest } from "./contexts/dbTestContext.js";
import { createRoom, deleteRoom, roomExists, roomExistsFromCode } from "../src/models/rooms.js";

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

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
    expect(await roomExists("dd9f9cf0-61b1-4a97-9e15-a9dfdfbefa95", dbClient)).toBe(false);
    expect(await roomExistsFromCode("ABCDE", dbClient)).toBe(false);
  });

  dbTest("Delete room", async ({ dbClient }) => {
    const { id, room_code } = await createRoom(dbClient);
    await deleteRoom(id, dbClient);
    await expect(roomExists(id, dbClient)).resolves.toBe(false);
  });
});
