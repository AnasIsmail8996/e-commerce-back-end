import express from "express";
import {
  createContact,
  getAllContacts,
  getSingleContact,
  getMyContacts,
  updateContactStatus,
  deleteContact,
} from "../../controllers/contacts/contact.controller";
import authMiddleware from "../../middleware/auth.middleware";
import { isAdmin } from "../../middleware/admin.middleware";

const router = express.Router();

router.post("/", createContact);
router.get("/my", authMiddleware, getMyContacts);
router.get("/", authMiddleware, isAdmin, getAllContacts);
router.get("/:id", authMiddleware, isAdmin, getSingleContact);
router.put("/:id", authMiddleware, isAdmin, updateContactStatus);
router.delete("/:id", authMiddleware, isAdmin, deleteContact);

export default router;
