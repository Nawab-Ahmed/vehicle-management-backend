// routes/VehicleMaintenanceDueRoutes.js
const express = require('express');
const router = express.Router();
const vehicleMaintenanceDueController = require('../controllers/VehicleMaintenanceDueController'); // Correct import

router.get('/due-report', vehicleMaintenanceDueController.getVehicleMaintenanceDueReport);

module.exports = router;
