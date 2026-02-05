const express = require('express');
const router = express.Router();
const Joi = require('joi');
const controller = require('../controllers/usersController');
const { authenticateJWT, authorize, authorizeOrOwner } = require('../middleware/auth');
const { validateBody, validateQuery } = require('../middleware/validate');

const listSchema = Joi.object({ page: Joi.number().integer().min(1).optional(), limit: Joi.number().integer().min(1).max(100).optional(), search: Joi.string().optional(), role: Joi.string().lowercase().valid('admin', 'staff', 'user').optional(), status: Joi.string().optional(), sort: Joi.string().optional(), order: Joi.string().valid('asc', 'desc').optional() });
const createSchema = Joi.object({ name: Joi.string().required(), email: Joi.string().email().required(), password: Joi.string().min(8).optional(), role: Joi.string().lowercase().valid('admin', 'staff', 'user').optional() });
const updateSchema = Joi.object({ name: Joi.string().optional(), email: Joi.string().email().optional(), password: Joi.string().min(8).optional(), role: Joi.string().lowercase().valid('admin', 'staff', 'user').optional(), status: Joi.string().optional() });
const passwordSchema = Joi.object({ currentPassword: Joi.string().optional(), newPassword: Joi.string().min(8).required() });

router.get('/users', authenticateJWT, authorize(['admin']), validateQuery(listSchema), controller.listUsers);
router.post('/users', authenticateJWT, authorize(['admin']), validateBody(createSchema), controller.createUser);
router.get('/users/:id', authenticateJWT, authorizeOrOwner(['admin']), controller.getUser);
router.put('/users/:id', authenticateJWT, authorizeOrOwner(['admin']), validateBody(updateSchema), controller.updateUser);
router.delete('/users/:id', authenticateJWT, authorize(['admin']), controller.deleteUser);
router.patch('/users/:id/password', authenticateJWT, authorizeOrOwner(['admin']), validateBody(passwordSchema), controller.changePassword);

module.exports = router;
