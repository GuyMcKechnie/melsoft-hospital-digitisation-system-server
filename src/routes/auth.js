const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateSupabase } = require('../middleware/auth');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', (req, res) => res.status(501).json({ success: false, error: { message: 'Not implemented' } }));
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/me', authenticateSupabase, authController.me);

module.exports = router;
