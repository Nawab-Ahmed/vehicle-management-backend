const express = require('express');
const router = express.Router();
const {
    addVehicle,
    getAllVehicles,
    updateVehicle,
    deleteVehicle
} = require('../controllers/VehicleManagementController');

// Routes without authentication or authorization
router.post('/', addVehicle);
router.get('/', getAllVehicles);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

module.exports = router;
