import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authenticateToken } from "../middleware/auth";
import { validateSchema, userUpdateSchema } from "../middleware/validation";

const router = Router();
const userController = new UserController();

// Get all users (paginated)
router.get(
  "/",
  authenticateToken,
  userController.getUsers.bind(userController)
);

// Get user by ID
router.get(
  "/:id",
  authenticateToken,
  userController.getUserById.bind(userController)
);

// Update user profile
router.put(
  "/:id",
  authenticateToken,
  validateSchema(userUpdateSchema),
  userController.updateUser.bind(userController)
);

// Delete user
router.delete(
  "/:id",
  authenticateToken,
  userController.deleteUser.bind(userController)
);

// Upload user avatar
router.post(
  "/:id/avatar",
  authenticateToken,
  userController.uploadAvatar.bind(userController)
);

export default router;
