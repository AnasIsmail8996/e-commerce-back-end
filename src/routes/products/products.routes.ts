import express from "express";

import { deleteProduct, } from "../../controllers/products/delete";
import create from "../../controllers/products/create";
import { getAllProducts, getSingleProduct, } from "../../controllers/products/get";
import update from "../../controllers/products/update";

import authMiddleware from "../../middleware/auth.middleware";
import { isAdmin } from "../../middleware/admin.middleware";
import { upload } from "../../middleware/upload";

const router = express.Router();

// create
router.post(
  "/create",
  authMiddleware,
  isAdmin,
  upload.array("images", 5),
  create
);

// update
router.put(
  "/update/:id",
  authMiddleware,
  isAdmin,
  upload.array("images", 5),
  update
);

// delete
router.delete(
  "/delete/:id",
  authMiddleware,
  isAdmin,
  deleteProduct
);

// get all
router.get("/", getAllProducts);

// single
router.get("/:id", getSingleProduct);

export default router;