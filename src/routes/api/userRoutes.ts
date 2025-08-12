import { Router } from 'express';
import { UserController } from '../../controllers/UserController';
import { authenticateToken } from '../../middleware/auth';
import { validateSchema, userUpdateSchema } from '../../middleware/validation';
import { upload } from '../../routes/api/uploadRoutes';

const router = Router();
const userController = new UserController();

// Get all users (paginated)
router.get(
  '/',
  authenticateToken,
  userController.getUsers.bind(userController)
);

// Get user by ID
router.get('/:id', userController.getUserById.bind(userController));

// Update user profile
router.put(
  '/:id',
  authenticateToken,
  validateSchema(userUpdateSchema),
  userController.updateUser.bind(userController)
);

// Delete user
router.delete('/:id', userController.deleteUser.bind(userController));

// Upload user avatar
router.post(
  '/:id/avatar',
  authenticateToken,
  userController.uploadAvatar.bind(userController)
);

router.post(
  '/create',
  upload.single('avatar'),
  userController.createUser.bind(userController)
);

router.post(
  '/update/:id',
  upload.single('avatar'),
  userController.updateUser.bind(userController)
);

export default router;
