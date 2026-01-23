# Melsoft Hospital Digitisation System - Backend Server

A Node.js Express backend server connected to Supabase database for the hospital digitisation system.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account and project

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

## Project Structure

```
src/
├── index.js              # Main server entry point
├── config/
│   └── supabase.js       # Supabase client configuration
└── routes/
    └── example.js        # Example route with Supabase queries
```

## API Endpoints

- `GET /health` - Server health check
- `GET /api/test` - Test endpoint

## Folder Guide

- **config/** - Configuration files (database, environment, etc.)
- **routes/** - API route handlers
- **controllers/** - Business logic for routes (optional, add as needed)
- **middleware/** - Custom middleware (optional, add as needed)

## Environment Variables

See `.env.example` for all required environment variables.

## Next Steps

1. Add your Supabase tables and authentication
2. Create route handlers for your API endpoints
3. Add database models/types as needed
4. Implement authentication middleware
5. Add input validation
6. Set up error handling

## License

ISC
