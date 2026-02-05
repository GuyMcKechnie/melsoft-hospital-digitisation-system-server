const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateBody } = require('../middleware/validate');
const { authenticateJWT } = require('../middleware/auth');
const controller = require('../controllers/authController');

const signupSchema = Joi.object({ name: Joi.string().required(), email: Joi.string().email().required(), password: Joi.string().min(8).required(), role: Joi.string().optional() });
const loginSchema = Joi.object({ email: Joi.string().email().required(), password: Joi.string().required() });
const forgotSchema = Joi.object({ email: Joi.string().email().required() });
const resetSchema = Joi.object({ token: Joi.string().required(), newPassword: Joi.string().min(8).required() });
const refreshSchema = Joi.object({ refreshToken: Joi.string().required() });

router.post('/auth/signup', authLimiter, validateBody(signupSchema), controller.signup);
router.post('/auth/login', authLimiter, validateBody(loginSchema), controller.login);
router.post('/auth/logout', authLimiter, controller.logout);
router.post('/auth/refresh', authLimiter, validateBody(refreshSchema), controller.refresh);
router.post('/auth/forgot-password', authLimiter, validateBody(forgotSchema), controller.forgotPassword);
router.post('/auth/reset-password', authLimiter, validateBody(resetSchema), controller.resetPassword);
router.get('/auth/me', authenticateJWT, controller.me);

module.exports = router;
