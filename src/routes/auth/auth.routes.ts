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
import authMiddleware from "../../middleware/auth.middleware";
import { isAdmin } from "../../middleware/admin.middleware";

const router = Router();

// ---------------- AUTH ROUTES ----------------
router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.get("/users", authMiddleware, isAdmin, getAllUsers);
router.delete("/users/:id", authMiddleware, isAdmin, deleteUser);
// OTP verification
router.post("/verify-otp", OPTVerifyController);

// Reset OTP
router.post("/reset-otp", resetOTPController);

// Forgot password
router.post("/forgot-password", forgotPasswordController);

// Change password
router.post("/change-password", changePasswordController);

export default router;