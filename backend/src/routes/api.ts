import { test } from "@/controllers/apiController.js";
import { authenticate } from "@/middleware/authenticateMiddleware.js";
import express from "express";

const router = express.Router();

router.use(authenticate);
router.post("/test", test);
router.post("/create", (req, res) => {});

export default router;
