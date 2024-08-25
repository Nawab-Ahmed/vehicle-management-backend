const express = require('express');
const router = express.Router();
const {
    addVehicleMaintenance,
    getAllVehicleMaintenance,
    getVehicleMaintenanceById, 
    updateVehicleMaintenance,
    deleteVehicleMaintenance,
    generateGatePass 
} = require('../controllers/VehicleMaintenanceController');

router.post('/', addVehicleMaintenance);
router.get('/', getAllVehicleMaintenance);
router.get('/:id', getVehicleMaintenanceById);
router.put('/:id', updateVehicleMaintenance);
router.delete('/:id', deleteVehicleMaintenance);
router.post('/:id/generate-gate-pass', generateGatePass);

module.exports = router;
