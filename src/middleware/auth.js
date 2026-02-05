const jwt = require('jsonwebtoken');
const ResponseHelper = require('../utils/response');
const ApiError = require('../utils/apiError');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

function authenticateJWT(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return ResponseHelper.error(res, { code: 'unauthenticated', message: 'Authorization header missing' }, 401);
    }

    const token = auth.slice(7);
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload; // payload should include id, email, role, etc.
        return next();
    } catch (err) {
        return ResponseHelper.error(res, { code: 'invalid_token', message: 'Invalid or expired token' }, 401);
    }
}

function authorize(allowed = []) {
    return (req, res, next) => {
        if (!req.user) return ResponseHelper.error(res, { code: 'unauthenticated', message: 'Not authenticated' }, 401);
        if (!Array.isArray(allowed) || allowed.length === 0) return next();
        const role = req.user.role;
        if (!role || !allowed.includes(role)) return ResponseHelper.error(res, { code: 'forbidden', message: 'Insufficient permissions' }, 403);
        return next();
    };
}

module.exports = { authenticateJWT, authorize };
