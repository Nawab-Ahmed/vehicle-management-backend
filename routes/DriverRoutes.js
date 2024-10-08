const express = require('express');
const router = express.Router();
const driverController = require('../controllers/DriverController');

router.get('/', driverController.getAllDrivers);
router.post('/', driverController.addDriver);
router.get('/:id', driverController.getDriverById);
router.put('/:id', driverController.updateDriver);
router.delete('/:id', driverController.deleteDriver);

module.exports = router;
