import express from "express";

import {
  getSiteConfig,
  updateSiteConfig,
  uploadCarouselImages,
} from "../../controllers/site-config/site-config.controller";

import authMiddleware from "../../middleware/auth.middleware";
import { isAdmin } from "../../middleware/admin.middleware";
import { upload } from "../../middleware/upload";

const router = express.Router();

router.get("/", getSiteConfig);
router.put("/", authMiddleware, isAdmin, updateSiteConfig);
router.post(
  "/upload-carousel",
  authMiddleware,
  isAdmin,
  upload.array("images", 10),
  uploadCarouselImages
);

export default router;
