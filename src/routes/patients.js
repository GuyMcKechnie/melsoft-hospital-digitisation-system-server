const express = require('express');
const router = express.Router();
const patientsController = require('../controllers/patientsController');

router.get('/', patientsController.list);
router.post('/', patientsController.create);
router.get('/:id', patientsController.getById);
router.put('/:id', patientsController.update);
router.delete('/:id', patientsController.remove);

module.exports = router;
