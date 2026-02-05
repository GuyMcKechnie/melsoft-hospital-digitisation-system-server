const express = require('express');
const router = express.Router();
const servicesController = require('../controllers/servicesController');

router.get('/', servicesController.list);
router.post('/', servicesController.create);
router.get('/:id', servicesController.getById);
router.put('/:id', servicesController.update);
router.delete('/:id', servicesController.remove);

module.exports = router;
