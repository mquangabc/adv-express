import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import path from 'path';

// Import configurations and middleware
import { initDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import AppRoutes from './routes';
// Load environment variables
dotenv.config();

class Server {
  public app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000');
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(
      helmet({
        contentSecurityPolicy: false,
      })
    );
    this.app.use(
      cors({
        origin: process.env.NODE_ENV === 'production' ? false : true,
        credentials: true,
      })
    );

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
    });
    this.app.use(limiter);

    // Compression
    this.app.use(compression());

    // Logging
    this.app.use(morgan('combined'));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Cookie and session middleware
    this.app.use(cookieParser());
    this.app.use(
      session({
        secret: process.env.SESSION_SECRET || 'your-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24, // 24 hours
        },
      })
    );

    // Static files
    this.app.use(
      '/uploads',
      express.static(path.join(__dirname, '../uploads'))
    );
    this.app.use('/js', express.static(path.join(__dirname, '../views/js')));

    // View engine setup
    this.app.set('view engine', 'ejs');
    this.app.set('views', path.join(__dirname, '../views'));
  }

  private initializeRoutes(): void {
    // Home route
    this.app.get('/', (req, res) => {
      console.log(req.session?.user);
      res.render('index', {
        title: 'Node TypeScript Server',
        user: req.session?.user || null,
      });
    });

    // Web auth routes vd: auth/login, auth/register /dashboard
    this.app.use('/', AppRoutes.webAuthRoutes);
    this.app.use('/auth', AppRoutes.webNoAuthRoutes);

    // API routes
    this.app.use('/api/auth', AppRoutes.authRoutes);
    this.app.use('/api/users', AppRoutes.userRoutes);
    this.app.use('/api/upload', AppRoutes.uploadRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).render('404', { title: 'Page Not Found' });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      await initDatabase();
      this.app.listen(this.port, () => {
        console.log(`🚀 Server running on port ${this.port}`);
        console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔗 URL: http://localhost:${this.port}`);
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }
}

const server = new Server();
server.start();

export default server;
