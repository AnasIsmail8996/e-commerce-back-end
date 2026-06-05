import express from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { isAdmin } from "../../middleware/admin.middleware";

import { createOrder } from "../../controllers/orders/create";
import { getMyOrders, getAllOrders } from "../../controllers/orders/get";
import { getSingleOrder } from "../../controllers/orders/get.single";
import { updateOrder } from "../../controllers/orders/update";
import { deleteOrder } from "../../controllers/orders/delete";
import { updateOrderStatus } from "../../controllers/orders/update.status";
import { isUser } from "../../middleware/user.middleware";
import { checkout } from "../../controllers/orders/checkout";
const router = express.Router();

router.post("/create", authMiddleware, isUser, createOrder);
router.get("/my", authMiddleware, isUser, getMyOrders);

// ADMIN
router.get("/", authMiddleware, isAdmin, getAllOrders);
router.get("/:id", authMiddleware, isAdmin, getSingleOrder);
router.put("/update/:id", authMiddleware, isAdmin, updateOrder);
router.put("/status/:id", authMiddleware, isAdmin, updateOrderStatus);
router.delete("/delete/:id", authMiddleware, isAdmin, deleteOrder);
router.post(
  "/checkout",
  authMiddleware,
  isUser,
  checkout
);
export default router;