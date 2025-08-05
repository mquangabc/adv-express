# Node TypeScript Server

A comprehensive Node.js server built with TypeScript, featuring authentication, file upload, and PostgreSQL integration.

## Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 🍪 **Session Management** - Express sessions with cookie support
- 📁 **File Upload** - Single and multiple file upload with validation
- 🗄️ **PostgreSQL Database** - With Knex.js query builder and migrations
- 🎨 **EJS Templates** - Server-side rendering with Bootstrap UI
- 🛡️ **Security** - Helmet, CORS, rate limiting, bcrypt password hashing
- ⚡ **TypeScript** - Full TypeScript support with strict typing
- 🔄 **Middleware** - Custom authentication and validation middleware
- 📊 **Logging** - Morgan HTTP request logger
- 🗜️ **Compression** - Gzip compression for better performance

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup

1. **Clone and install dependencies:**

   ```bash
   npm install
   ```

2. **Database Setup:**

   - Make sure PostgreSQL is running
   - Create a database named `demo`
   - Update `.env` file with your database credentials

3. **Environment Variables:**
   Copy `.env.example` to `.env` and update the values:

   ```
   NODE_ENV=development
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=minhquang
   DB_PASSWORD=123456
   DB_NAME=demo
   JWT_SECRET=your-super-secret-jwt-key
   SESSION_SECRET=your-super-secret-session-key
   ```

4. **Run Database Migrations:**

   ```bash
   npm run migrate
   ```

5. **Start the Server:**

   ```bash
   # Development
   npm run dev

   # Production
   npm run build
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh-token` - Refresh JWT token
- `GET /api/auth/me` - Get current user profile

### Users

- `GET /api/users` - Get all users (paginated, requires auth)
- `GET /api/users/:id` - Get user by ID (requires auth)
- `PUT /api/users/:id` - Update user profile (requires auth)
- `DELETE /api/users/:id` - Delete user (requires auth)
- `POST /api/users/:id/avatar` - Upload user avatar (requires auth)

### File Upload

- `POST /api/upload/single` - Upload single file (requires auth)
- `POST /api/upload/multiple` - Upload multiple files (requires auth)
- `GET /api/upload/file/:filename` - Get uploaded file
- `DELETE /api/upload/file/:filename` - Delete uploaded file (requires auth)

## Project Structure

```
src/
├── config/
│   └── database.ts          # Database configuration
├── controllers/
│   ├── AuthController.ts    # Authentication logic
│   ├── UserController.ts    # User management
│   └── UploadController.ts  # File upload handling
├── middleware/
│   ├── auth.ts             # Authentication middleware
│   ├── errorHandler.ts     # Global error handler
│   └── validation.ts       # Request validation
├── migrations/
│   └── 20240101000001_create_users_table.ts
├── models/
│   └── User.ts             # User model
├── routes/
│   ├── authRoutes.ts       # Authentication routes
│   ├── userRoutes.ts       # User routes
│   └── uploadRoutes.ts     # Upload routes
├── types/
│   └── index.ts            # TypeScript type definitions
└── server.ts               # Main server file
```

## Database Schema

### Users Table

- `id` - Primary key
- `username` - Unique username
- `email` - Unique email address
- `password` - Bcrypt hashed password
- `first_name` - Optional first name
- `last_name` - Optional last name
- `avatar` - Optional avatar image path
- `is_active` - Account status
- `created_at` - Timestamp
- `updated_at` - Timestamp

## Security Features

- **Password Hashing:** bcrypt with salt rounds
- **JWT Tokens:** Secure token-based authentication
- **Session Management:** Express sessions with secure cookies
- **Rate Limiting:** Prevent brute force attacks
- **CORS Protection:** Cross-origin resource sharing control
- **Helmet Security:** Security headers
- **Input Validation:** Joi schema validation
- **File Upload Security:** MIME type validation and size limits

## Usage Examples

### Register a new user

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Upload a file

```bash
curl -X POST http://localhost:3000/api/upload/single \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/image.jpg"
```

## Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run migrate:rollback` - Rollback last migration
- `npm run migrate:make <name>` - Create new migration

## Environment Variables

| Variable         | Description            | Default         |
| ---------------- | ---------------------- | --------------- |
| `NODE_ENV`       | Environment mode       | `development`   |
| `PORT`           | Server port            | `3000`          |
| `DB_HOST`        | Database host          | `localhost`     |
| `DB_PORT`        | Database port          | `5432`          |
| `DB_USER`        | Database username      | `minhquang`     |
| `DB_PASSWORD`    | Database password      | `123456`        |
| `DB_NAME`        | Database name          | `demo`          |
| `JWT_SECRET`     | JWT signing secret     | Required        |
| `JWT_EXPIRES_IN` | JWT expiration time    | `7d`            |
| `SESSION_SECRET` | Session signing secret | Required        |
| `MAX_FILE_SIZE`  | Max upload file size   | `5242880` (5MB) |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
