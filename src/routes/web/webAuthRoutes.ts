import express from 'express';
import { authenticateSession } from '../../middleware/auth';
import { UserController } from '../../controllers/UserController';

const router = express.Router();
const userController = new UserController();
// Dashboard Route (Protected)
router.get('/dashboard', authenticateSession, (req, res) => {
  res.render('admin/dashboard', {
    title: 'Dashboard',
    user: req.session?.user || null,
  });
});

// Logout Route
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.redirect('/dashboard');
    }

    res.clearCookie('connect.sid'); // Clear session cookie
    res.redirect('/?success=Logged out successfully');
  });
});

// Profile Route (Protected)
router.get('/profile', authenticateSession, (req, res) => {
  res.render('admin/profile', {
    title: 'Profile',
    user: req.session?.user || null,
  });
});

router.get('/user', authenticateSession, async (req, res) => {
  const data = await userController.getUsersData(1, 20);
  console.log(data);
  res.render('admin/user', {
    title: 'User',
    user: req.session?.user || null,
    users: data.users,
    pagination: data.pagination,
  });
});

export default router;
