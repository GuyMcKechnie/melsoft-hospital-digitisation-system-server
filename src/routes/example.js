const express = require('express');
const router = express.Router();
const ResponseHelper = require('../utils/response');
const { authenticateJWT } = require('../middleware/auth');

// Public example endpoint
router.get('/test', (req, res) => {
    return ResponseHelper.success(res, { message: 'API is working' });
});

// Protected example: returns token payload as user
router.get('/me', authenticateJWT, (req, res) => {
    const user = req.user || null;
    return ResponseHelper.success(res, { user });
});

module.exports = router;
