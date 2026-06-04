import express from "express";

import {
  getSiteConfig,
  updateSiteConfig,
} from "../../controllers/site-config/site-config.controller";

import authMiddleware from "../../middleware/auth.middleware";
import { isAdmin } from "../../middleware/admin.middleware";

const router = express.Router();

router.get("/", getSiteConfig);
router.put("/", authMiddleware, isAdmin, updateSiteConfig);

export default router;
