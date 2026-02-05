# Melsoft Hospital Digitisation System - Backend Server

A Node.js Express backend server connected to Supabase database for the hospital digitisation system.

## Features

- ✅ RESTful API with Express.js
- ✅ Supabase integration for database and authentication
- ✅ JWT-based authentication with refresh tokens
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting and security middleware
- ✅ File upload support with Multer
- ✅ Email notifications with Nodemailer
- ✅ Background job processing with BullMQ
- ✅ Redis for caching and queues
- ✅ Structured logging with Winston
- ✅ Input validation with Zod
- ✅ Docker support for containerization
- ✅ Cloud deployment ready (Render, Railway, Heroku, Docker)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project
- Redis (optional for local dev, required for production)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/GuyMcKechnie/melsoft-hospital-digitisation-system-server.git
cd melsoft-hospital-digitisation-system-server
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Fill in your Supabase credentials in the `.env` file:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3000
NODE_ENV=development
```

## Running the Server

### Development mode (with auto-reload):

```bash
npm run dev
```

### Production mode:

```bash
npm start
```

The server will start on `http://localhost:3000` by default.

### Using Docker:

```bash
# Build and run with Docker Compose (includes Redis)
docker-compose up

# Or build and run Docker container only
docker build -t melsoft-hospital-server .
docker run -p 3000:3000 --env-file .env melsoft-hospital-server
```

## Project Structure

```
src/
├── index.js              # Main server entry point with graceful shutdown
├── config/
│   ├── supabase.js       # Supabase client configuration
│   └── storage.js        # File storage configuration
├── controllers/          # Business logic for routes
│   ├── authController.js
│   ├── usersController.js
│   ├── patientsController.js
│   ├── servicesController.js
│   └── appointmentsController.js
├── routes/              # API route definitions
│   ├── auth.js
│   ├── users.js
│   ├── patients.js
│   ├── services.js
│   └── appointments.js
├── middleware/          # Custom middleware
│   ├── auth.js          # JWT authentication
│   ├── errorHandler.js  # Centralized error handling
│   ├── logger.js        # Request logging
│   └── validate.js      # Input validation
└── utils/               # Utility functions
    ├── email.js         # Email service
    └── hash.js          # Password hashing
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/logout` - Logout and revoke tokens
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/me` - Get current user profile

### Users (Admin/Staff)
- `GET /api/users` - List all users (with pagination)
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PATCH /api/users/:id/password` - Change password

### Patients
- `GET /api/patients` - List patients (with search & filters)
- `POST /api/patients` - Create patient record
- `GET /api/patients/:id` - Get patient details
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient
- `GET /api/patients/:id/appointments` - Get patient appointments
- `POST /api/patients/:id/attachments` - Upload patient documents

### Services
- `GET /api/services` - List all services
- `POST /api/services` - Create service (admin)
- `GET /api/services/:id` - Get service details
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Appointments
- `GET /api/appointments` - List appointments (with filters)
- `POST /api/appointments` - Book new appointment
- `GET /api/appointments/:id` - Get appointment details
- `PUT /api/appointments/:id` - Update/reschedule appointment
- `POST /api/appointments/:id/cancel` - Cancel appointment
- `POST /api/appointments/:id/confirm` - Confirm appointment

### System
- `GET /api/health` - Health check endpoint
- `GET /api` - API metadata and version

For detailed API documentation, see [prd.md](./prd.md).

## Folder Guide

- **config/** - Configuration files (database, storage, environment)
- **routes/** - API route handlers (endpoint definitions)
- **controllers/** - Business logic for routes
- **middleware/** - Custom middleware (auth, validation, logging)
- **utils/** - Utility functions (email, hashing, etc.)
- **docs/** - Documentation files

## Cloud Deployment

This application is ready for cloud deployment with support for:

- 🚀 **Render** - Use `render.yaml` for Blueprint deployment
- 🚂 **Railway** - Use `railway.json` for configuration
- 🟣 **Heroku** - Use `Procfile` for deployment
- 🐳 **Docker** - Use `Dockerfile` and `docker-compose.yml`
- ☁️ **AWS/GCP/Azure** - Deploy via container services

**For detailed deployment instructions, see [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)**

### Quick Deploy Buttons

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

## Environment Variables

See `.env.example` for all required environment variables.

### Required Variables
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (keep secure!)
- `JWT_SECRET` - Secret for JWT signing (if using custom JWT)

### Optional Variables
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `REDIS_URL` - Redis connection URL for caching/queues
- `EMAIL_*` - SMTP settings for email notifications

## Development

## Development

### Local Development Setup

1. Start Redis (if needed):
   ```bash
   # Using Docker
   docker run -d -p 6379:6379 redis:7-alpine
   
   # Or using Docker Compose
   docker-compose up redis -d
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

### Testing

```bash
npm test
```

### Code Style

```bash
npm run lint
```

## Security Features

- 🔐 Password hashing with Argon2
- 🎫 JWT-based authentication
- 🔄 Refresh token rotation
- 🚦 Rate limiting to prevent abuse
- 🛡️ CORS configuration
- ✅ Input validation and sanitization
- 📝 Audit logging for sensitive operations
- 🔒 Role-based access control (RBAC)

## Architecture Highlights

- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth + JWT tokens
- **Caching**: Redis for sessions and rate limiting
- **Queue**: BullMQ for background jobs (emails, reminders)
- **Storage**: File uploads via Multer (configured for cloud storage)
- **Logging**: Structured logging with Winston

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For issues and questions:
- Open an issue on GitHub
- Check the [deployment guide](./docs/DEPLOYMENT.md)
- Review [prd.md](./prd.md) for API specifications

## License

ISC
