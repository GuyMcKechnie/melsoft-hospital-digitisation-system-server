const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');
const { createEnquiry, listEnquiries, getEnquiry, addReply, closeEnquiry } = require('../controllers/enquiriesController');

// Create a new enquiry (patients only) — body: { subject, message }
router.post('/enquiries', authenticateJWT, createEnquiry);

// List enquiries — admin sees all, patient sees own
router.get('/enquiries', authenticateJWT, listEnquiries);

// Get single enquiry by id
router.get('/enquiries/:id', authenticateJWT, getEnquiry);

// Add reply to enquiry (admin or owner)
router.post('/enquiries/:id/replies', authenticateJWT, addReply);

// Close enquiry (admin or owner)
router.patch('/enquiries/:id/close', authenticateJWT, closeEnquiry);

module.exports = router;
