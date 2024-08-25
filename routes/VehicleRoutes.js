const express = require('express');
const router = express.Router();
const { getVehicles, addVehicle, updateVehicle, deleteVehicle } = require('../controllers/VehicleController');

router.get('/', getVehicles);
router.post('/', addVehicle);
router.put('/:regn_no', updateVehicle);
router.delete('/:regn_no', deleteVehicle);

module.exports = router;
