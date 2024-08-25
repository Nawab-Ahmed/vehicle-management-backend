const express = require('express');
const router = express.Router();
const {
    addVehicleMovement,
    getAllVehicleMovements,
    getVehicleMovementById,
    updateVehicleMovement,
    deleteVehicleMovement
} = require('../controllers/vehicleMovementController');

router.post('/', addVehicleMovement);
router.get('/', getAllVehicleMovements);
router.get('/:id', getVehicleMovementById);
router.put('/:id', updateVehicleMovement);
router.delete('/:id', deleteVehicleMovement);

module.exports = router;
