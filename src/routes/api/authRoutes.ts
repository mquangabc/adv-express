import { Router } from 'express';
import { AuthController } from '../../controllers/AuthController';
import {
  validateSchema,
  userRegistrationSchema,
  userLoginSchema,
} from '../../middleware/validation';

const router = Router();
const authController = new AuthController();

// Registration route
router.post(
  '/register',
  validateSchema(userRegistrationSchema),
  authController.register.bind(authController)
);

// Login route
router.post(
  '/login',
  validateSchema(userLoginSchema),
  authController.login.bind(authController)
);

// Logout route
router.post('/logout', authController.logout.bind(authController));

// Refresh token route
router.post('/refresh-token', authController.refreshToken.bind(authController));

// Check authentication status
router.get('/me', authController.getCurrentUser.bind(authController));

export default router;
