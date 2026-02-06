const express = require('express');
const router = express.Router();
const Joi = require('joi');
const controller = require('../controllers/appointmentsController');
const { authenticateJWT, authorize } = require('../middleware/auth');
const { validateBody, validateQuery } = require('../middleware/validate');

const listSchema = Joi.object({ page: Joi.number().integer().min(1).optional(), limit: Joi.number().integer().min(1).max(100).optional() });
// accept time values like "HH:MM" or "HH:MM:SS" (seconds optional)
const timePattern = /^\d{2}:\d{2}(:\d{2})?$/;
const createSchema = Joi.object({ service: Joi.string().required(), date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(), time: Joi.string().pattern(timePattern).required(), doctor: Joi.string().optional(), status: Joi.string().valid('Pending', 'Approved', 'Completed', 'Cancelled').optional() });
const updateSchema = Joi.object({ service: Joi.string().optional(), date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(), time: Joi.string().pattern(timePattern).optional(), doctor: Joi.string().optional(), status: Joi.string().valid('Pending', 'Approved', 'Completed', 'Cancelled').optional() });

// All appointment routes are restricted to patients
router.get('/appointments', authenticateJWT, authorize(['patient']), validateQuery(listSchema), controller.listAppointments);
router.post('/appointments', authenticateJWT, authorize(['patient']), validateBody(createSchema), controller.createAppointment);
router.get('/appointments/:id', authenticateJWT, authorize(['patient']), controller.getAppointment);
router.put('/appointments/:id', authenticateJWT, authorize(['patient']), validateBody(updateSchema), controller.updateAppointment);
router.delete('/appointments/:id', authenticateJWT, authorize(['patient']), controller.deleteAppointment);

module.exports = router;
