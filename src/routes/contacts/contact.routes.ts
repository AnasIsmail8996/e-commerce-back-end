import { Router } from "express";
import createContact from "../../controllers/contacts/create";
import { getAllContacts, getSingleContact, getMyContacts } from "../../controllers/contacts/get";
import updateContactStatus from "../../controllers/contacts/update";
import deleteContact from "../../controllers/contacts/delete";
import authMiddleware from "../../middleware/auth.middleware";
import optionalAuth from "../../middleware/optionalAuth.middleware";
import { isAdmin } from "../../middleware/admin.middleware";

const router = Router();

router.post("/", optionalAuth, createContact);
router.get("/my", authMiddleware, getMyContacts);
router.get("/", authMiddleware, isAdmin, getAllContacts);
router.get("/:id", authMiddleware, isAdmin, getSingleContact);
router.put("/:id", authMiddleware, isAdmin, updateContactStatus);
router.delete("/:id", authMiddleware, isAdmin, deleteContact);

export default router;
