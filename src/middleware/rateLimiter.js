const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 200, // limit each IP to 200 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // stricter for auth endpoints
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { globalLimiter, authLimiter };
