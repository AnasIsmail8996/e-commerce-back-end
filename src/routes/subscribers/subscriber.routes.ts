import express from "express";
import {
  subscribe,
  getAllSubscribers,
  deleteSubscriber,
} from "../../controllers/subscribers/subscriber.controller";
import authMiddleware from "../../middleware/auth.middleware";
import { isAdmin } from "../../middleware/admin.middleware";

const router = express.Router();

router.post("/", subscribe);
router.get("/", authMiddleware, isAdmin, getAllSubscribers);
router.delete("/:id", authMiddleware, isAdmin, deleteSubscriber);

export default router;
