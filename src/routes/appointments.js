const express = require('express');
const router = express.Router();
const appointmentsController = require('../controllers/appointmentsController');

router.get('/', appointmentsController.list);
router.post('/', appointmentsController.create);
router.get('/:id', appointmentsController.getById);
router.put('/:id', appointmentsController.update);
router.post('/:id/cancel', appointmentsController.cancel);

module.exports = router;
