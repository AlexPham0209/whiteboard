import { create, test } from "../controllers/apiController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import express from "express";

const router = express.Router();

router.use(authenticate);
router.post("/test", test);
router.post("/create", create);

export default router;
