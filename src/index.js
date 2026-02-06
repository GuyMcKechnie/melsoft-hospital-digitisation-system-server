const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { requestLogger } = require('./utils/logger');
const ResponseHelper = require('./utils/response');
const errorHandler = require('./middleware/errorHandler');
const { globalLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3000;

// Security + parsing + logging
app.use(helmet());
// Configure CORS to allow Authorization header for bearer tokens
const corsOptions = {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization'],
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
// Apply CORS middleware for preflight requests without registering a glob route
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        return cors(corsOptions)(req, res, next);
    }
    return next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger());

// Global rate limiter
app.use(globalLimiter);

// Root API metadata
app.get('/api', (req, res) => {
    return ResponseHelper.success(res, { name: 'melsoft-hospital-digitisation-system-server', version: process.env.npm_package_version || '1.0.0', routes: ['/api/health', '/api'] });
});

// Health check (public)
app.get('/api/health', (req, res) => {
    return ResponseHelper.success(res, { status: 'ok', timestamp: new Date().toISOString() });
});

// Example routes (mounted from src/routes/example.js)
try {
    const exampleRouter = require('./routes/example');
    app.use('/api', exampleRouter);
} catch (err) {
    console.warn('No example routes found or failed to load:', err.message);
}

// Auth routes
try {
    const authRouter = require('./routes/auth');
    app.use('/api', authRouter);
} catch (err) {
    console.warn('No auth routes loaded:', err.message);
}

// Users routes
try {
    const usersRouter = require('./routes/users');
    app.use('/api', usersRouter);
} catch (err) {
    console.warn('No users routes loaded:', err.message);
}

// Enquiries routes
try {
    const enquiriesRouter = require('./routes/enquiries');
    app.use('/api', enquiriesRouter);
} catch (err) {
    console.warn('No enquiries routes loaded:', err.message);
}

// Appointments routes
try {
    const appointmentsRouter = require('./routes/appointments');
    app.use('/api', appointmentsRouter);
} catch (err) {
    console.warn('No appointments routes loaded:', err.message);
}

// 404 handler
app.use((req, res) => {
    return ResponseHelper.error(res, { code: 'not_found', message: 'Route not found' }, 404);
});

// Centralized error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
