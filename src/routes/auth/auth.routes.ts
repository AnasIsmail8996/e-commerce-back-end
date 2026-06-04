import { Router } from "express";
import { register } from "../../controllers/auth/register.controller";
import { login } from "../../controllers/auth/login.controller";
import { refreshToken } from "../../controllers/auth/refresh.controller";

import { OPTVerifyController } from "../../controllers/auth/otp.controller";
import { resetOTPController } from "../../controllers/auth/reset.otp.controller";
import { forgotPasswordController } from "../../controllers/auth/forgot.password.controller";
import { changePasswordController } from "../../controllers/auth/change.password.controller";
import { logout } from "../../controllers/auth/logout.controller";
import { getAllUsers } from "../../controllers/auth/get.users.controller";
import { deleteUser } from "../../controllers/auth/delete.user.controller";
import { seedAdmin } from "../../controllers/auth/seed.admin.controller";
import authMiddleware from "../../middleware/auth.middleware";
import { isAdmin } from "../../middleware/admin.middleware";
import { getMe } from "../../controllers/auth/me.controller";
import { authLimiter, strictLimiter } from "../../utils/rateLimiter";

const router = Router();

// ---------------- AUTH ROUTES ----------------
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);
router.get("/users", authMiddleware, isAdmin, getAllUsers);
router.delete("/users/:id", authMiddleware, isAdmin, deleteUser);
router.post("/verify-otp", authLimiter, OPTVerifyController);
router.post("/reset-otp", authLimiter, resetOTPController);
router.post("/forgot-password", authLimiter, forgotPasswordController);
router.post("/change-password", changePasswordController);
router.post("/seed-admin", strictLimiter, seedAdmin);

export default router;
