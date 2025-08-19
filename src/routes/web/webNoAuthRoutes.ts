import express from 'express';
import jwt from 'jsonwebtoken';
import { checkLogin } from '../../middleware/auth';
import { UserModel } from '../../models/User';

const router = express.Router();

// Auth Pages Routes
router.get('/login', checkLogin, (req, res) => {
  res.render('login', {
    title: 'Login',
    error: req.query.error || null,
    success: req.query.success || null,
    formData: {},
  });
});

router.get('/register', checkLogin, (req, res) => {
  res.render('register', {
    title: 'Register',
    error: req.query.error || null,
    formData: {},
  });
});
// Auth Form Handlers (Session-based)
router.post('/login', async (req, res) => {
  try {
    const { email, password, remember } = req.body;
    // Find user and validate password
    const user = await UserModel.findByEmail(email);

    if (!user) {
      return res.render('login', {
        title: 'Login',
        error: 'Invalid email or password',
        formData: { email },
      });
    }

    const isValidPassword = await UserModel.validatePassword(user, password);
    if (!isValidPassword) {
      return res.render('login', {
        title: 'Login',
        error: 'Invalid email or password',
        formData: { email },
      });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const tokenExpiry = remember ? '30d' : '1d';
    const token = jwt.sign(
      { 
        userId: user.id,
        username: user.username,
        email: user.email
      },
      jwtSecret,
      { expiresIn: tokenExpiry }
    );

    // Set JWT token as HTTP-only cookie
    const cookieMaxAge = remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: cookieMaxAge,
      sameSite: 'lax'
    });

    // Keep session for backward compatibility with web routes
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      avatar: user.avatar || undefined,
    };

    if (remember) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    } else {
      req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 1 day
    }

    // Redirect to dashboard
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    res.render('login', {
      title: 'Login',
      error: 'An error occurred during login. Please try again.',
      formData: { email: req.body.email },
    });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword, firstName, lastName } =
      req.body;

    // Validate passwords match
    if (password !== confirmPassword) {
      return res.render('register', {
        title: 'Register',
        error: 'Passwords do not match',
        formData: { username, email, firstName, lastName },
      });
    }

    // Check if user already exists
    const existingUserByEmail = await UserModel.findByEmail(email);
    if (existingUserByEmail) {
      return res.render('register', {
        title: 'Register',
        error: 'User with this email already exists',
        formData: { username, email, firstName, lastName },
      });
    }

    const existingUserByUsername = await UserModel.findByUsername(username);
    if (existingUserByUsername) {
      return res.render('register', {
        title: 'Register',
        error: 'User with this username already exists',
        formData: { username, email, firstName, lastName },
      });
    }

    // Create new user
    const userData = {
      username,
      email,
      password,
      firstName: firstName || null,
      lastName: lastName || null,
    };

    const user = await UserModel.create(userData);

    // Generate JWT token for registration
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      { 
        userId: user.id,
        username: user.username,
        email: user.email
      },
      jwtSecret,
      { expiresIn: '1d' }
    );

    // Set JWT token as HTTP-only cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: 'lax'
    });

    // Set session for backward compatibility
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      avatar: user.avatar || undefined,
    };

    // Redirect to dashboard
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Registration error:', error);
    res.render('register', {
      title: 'Register',
      error: 'An error occurred during registration. Please try again.',
      formData: {
        username: req.body.username,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
      },
    });
  }
});

export default router;
