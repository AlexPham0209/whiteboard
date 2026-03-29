import bcrypt from "bcrypt";
import { createUser, getUser, userExists } from "../models/users.js";
import express from "express";
import jwt, { type VerifyErrors } from "jsonwebtoken";
import AppError from "@/utils/error.js";
import { login, register } from "@/controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

export default router;
